"""Versioned NanoJev candidate encoding and typed readout.

Encoding follows TianyuCodings/NanoJev at commit
71a513bb0163b5634467842b523ee0c0ed6fb1c7 (MIT; see NOTICE.md).
No model imports or network access. IDs are transport metadata, not model input.
"""
import json
import math

MAX_STATES = 8
MAX_QUESTIONS = 32
MAX_PATHS = 128
MAX_TOTAL_TOKENS = 16384


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate JSON key')
        result[key] = value
    return result


def reject_nonfinite(value):
    raise ValueError('Non-finite JSON number')


def parse_json(text):
    return json.loads(text, object_pairs_hook=unique_object, parse_constant=reject_nonfinite)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def validate_request(payload):
    if not isinstance(payload, dict) or set(payload) != {'states'}:
        raise ValueError('Expected only a states array')
    states = payload['states']
    if not isinstance(states, list) or not 1 <= len(states) <= MAX_STATES:
        raise ValueError('Expected 1..8 states')
    ids = set()
    question_count = path_count = 0
    for row in states:
        if not isinstance(row, dict) or set(row) != {'id', 'state', 'questions'}:
            raise ValueError('Each state needs only id, state, and questions')
        if not nonempty(row['id']) or row['id'] in ids or len(row['id']) > 128:
            raise ValueError('State IDs must be unique nonempty strings')
        ids.add(row['id'])
        if not isinstance(row['state'], (str, dict, list)) or not row['state']:
            raise ValueError('State must be nonempty text, an object, or an array')
        questions = row['questions']
        if not isinstance(questions, dict) or not questions:
            raise ValueError('Questions must be a nonempty object')
        for qid, question in questions.items():
            if not nonempty(qid) or len(qid) > 128 or not isinstance(question, dict):
                raise ValueError('Invalid question ID or object')
            if set(question) - {'type', 'instructions', 'criteria'} or not nonempty(question.get('instructions')):
                raise ValueError('Questions need textual instructions and supported fields')
            kind, criteria = question.get('type'), question.get('criteria')
            if kind == 'boolean':
                if criteria is not None and (not isinstance(criteria, dict) or set(criteria) - {'false', 'true'} or not all(nonempty(x) for x in criteria.values())):
                    raise ValueError('Boolean criteria must contain textual false/true definitions')
                if 'criteria' in question and criteria is None:
                    raise ValueError('Null Boolean criteria are not supported')
                path_count += 1
            elif kind == 'choice':
                if not isinstance(criteria, dict) or not 2 <= len(criteria) <= 255 or not all(nonempty(k) and nonempty(v) for k, v in criteria.items()):
                    raise ValueError('Choice requires 2..255 textual options')
                path_count += len(criteria)
            elif kind == 'score':
                if not isinstance(criteria, list) or not 2 <= len(criteria) <= 10 or not all(nonempty(x) for x in criteria):
                    raise ValueError('Score requires 2..10 textual levels')
                path_count += len(criteria)
            else:
                raise ValueError('Use boolean, choice, or score; noul needs an explicit adapter')
            question_count += 1
    if question_count > MAX_QUESTIONS or path_count > MAX_PATHS:
        raise ValueError('Local limit: 32 questions / 128 candidate paths')
    return states


def prepare_examples(payload, tokenizer, max_length):
    states = validate_request(payload)
    if type(max_length) is not int or max_length <= 0 or type(tokenizer.eos_token_id) is not int:
        raise ValueError('Invalid token limit or EOS ID')
    examples, total_tokens = [], 0
    for row in states:
        for qid, q in row['questions'].items():
            kind = q['type']
            if kind == 'boolean':
                ids, texts = ['false', 'true'], ['The proposition is true.']
            elif kind == 'choice':
                ids = list(q['criteria'])
                texts = [f"{key}: {q['criteria'][key]}" for key in ids]
            else:
                ids, texts = [str(i) for i in range(len(q['criteria']))], q['criteria']
            # Preserve upstream Python str state serialization and separate
            # segment tokenization. Do not substitute a chat template.
            segments = [f"State:\n{row['state']}\n", f"Question type: {kind}\nQuestion:\n{q['instructions']}\n"]
            if kind == 'boolean' and 'criteria' in q:
                for key, label in (('false', 'False'), ('true', 'True')):
                    if key in q['criteria']:
                        segments[1] += f"{label} criterion: {q['criteria'][key]}\n"
            prefix = sum([tokenizer.encode(x, add_special_tokens=False) for x in segments], [])
            leaves = [prefix + tokenizer.encode(f'Candidate:\n{x}\nDecision:', add_special_tokens=False) + [tokenizer.eos_token_id] for x in texts]
            if max(map(len, leaves)) > max_length:
                raise ValueError(f'Candidate path exceeds checkpoint limit {max_length}; no truncation applied')
            total_tokens += sum(map(len, leaves))
            examples.append({'state_id': row['id'], 'qid': qid, 'type': kind, 'candidate_ids': ids, 'leaf_tokens': leaves})
    if total_tokens > MAX_TOTAL_TOKENS:
        raise ValueError('Local limit: 16384 total candidate-path tokens')
    return examples


def answer_from_probabilities(example, probabilities):
    ids = example['candidate_ids']
    if len(probabilities) != len(ids) or any(not math.isfinite(x) or x < 0 or x > 1 for x in probabilities) or abs(math.fsum(probabilities) - 1) > 1e-5:
        raise ValueError('Invalid model probability distribution')
    best = max(range(len(ids)), key=probabilities.__getitem__)
    answer = {'type': example['type'], 'probabilities': dict(zip(ids, probabilities))}
    if example['type'] == 'boolean':
        answer.update(p_true=probabilities[1], value=bool(best))
    elif example['type'] == 'choice':
        answer.update(choice=ids[best], value=ids[best])
    else:
        score = math.fsum(i * p for i, p in enumerate(probabilities))
        answer.update(score=score, level=best, value=score)
    return answer
