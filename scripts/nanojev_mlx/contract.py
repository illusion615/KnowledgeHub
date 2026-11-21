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


def _validate_question_criteria(question):
    kind, criteria = question.get('type'), question.get('criteria')
    if kind == 'boolean':
        if 'criteria' in question and criteria is None:
            raise ValueError('Null Boolean criteria are not supported')
        if criteria is not None and (
            not isinstance(criteria, dict)
            or set(criteria) - {'false', 'true'}
            or not all(nonempty(x) for x in criteria.values())
        ):
            raise ValueError('Boolean criteria must contain textual false/true definitions')
        return 1
    if kind == 'choice':
        if not isinstance(criteria, dict) or not 2 <= len(criteria) <= 255 or not all(nonempty(k) and nonempty(v) for k, v in criteria.items()):
            raise ValueError('Choice requires 2..255 textual options')
        return len(criteria)
    if kind == 'score':
        if not isinstance(criteria, list) or not 2 <= len(criteria) <= 10 or not all(nonempty(x) for x in criteria):
            raise ValueError('Score requires 2..10 textual levels')
        return len(criteria)
    raise ValueError('Use boolean, choice, or score; noul needs an explicit adapter')


def _validate_state_row(row, seen_ids):
    if not isinstance(row, dict) or set(row) != {'id', 'state', 'questions'}:
        raise ValueError('Each state needs only id, state, and questions')
    state_id = row['id']
    if not nonempty(state_id) or state_id in seen_ids or len(state_id) > 128:
        raise ValueError('State IDs must be unique nonempty strings')
    seen_ids.add(state_id)
    if not isinstance(row['state'], (str, dict, list)) or not row['state']:
        raise ValueError('State must be nonempty text, an object, or an array')
    questions = row['questions']
    if not isinstance(questions, dict) or not questions:
        raise ValueError('Questions must be a nonempty object')
    path_count = 0
    for qid, question in questions.items():
        if not nonempty(qid) or len(qid) > 128 or not isinstance(question, dict):
            raise ValueError('Invalid question ID or object')
        if set(question) - {'type', 'instructions', 'criteria'} or not nonempty(question.get('instructions')):
            raise ValueError('Questions need textual instructions and supported fields')
        path_count += _validate_question_criteria(question)
    return len(questions), path_count


def validate_request(payload):
    if not isinstance(payload, dict) or set(payload) != {'states'}:
        raise ValueError('Expected only a states array')
    states = payload['states']
    if not isinstance(states, list) or not 1 <= len(states) <= MAX_STATES:
        raise ValueError('Expected 1..8 states')
    seen_ids = set()
    question_count = path_count = 0
    for row in states:
        row_questions, row_paths = _validate_state_row(row, seen_ids)
        question_count += row_questions
        path_count += row_paths
    if question_count > MAX_QUESTIONS or path_count > MAX_PATHS:
        raise ValueError('Local limit: 32 questions / 128 candidate paths')
    return states


def _candidate_options(question):
    kind = question['type']
    if kind == 'boolean':
        return ['false', 'true'], ['The proposition is true.']
    if kind == 'choice':
        ids = list(question['criteria'])
        return ids, [f"{key}: {question['criteria'][key]}" for key in ids]
    return [str(i) for i in range(len(question['criteria']))], question['criteria']


def _question_segments(state_value, question):
    kind = question['type']
    question_segment = f"Question type: {kind}\nQuestion:\n{question['instructions']}\n"
    if kind == 'boolean' and 'criteria' in question:
        for key, label in (('false', 'False'), ('true', 'True')):
            if key in question['criteria']:
                question_segment += f"{label} criterion: {question['criteria'][key]}\n"
    return [f"State:\n{state_value}\n", question_segment]


def prepare_examples(payload, tokenizer, max_length):
    states = validate_request(payload)
    if type(max_length) is not int or max_length <= 0 or type(tokenizer.eos_token_id) is not int:
        raise ValueError('Invalid token limit or EOS ID')
    examples, total_tokens = [], 0
    for row in states:
        for qid, q in row['questions'].items():
            ids, texts = _candidate_options(q)
            # Preserve upstream Python str state serialization and separate
            # segment tokenization. Do not substitute a chat template.
            segments = _question_segments(row['state'], q)
            prefix = sum([tokenizer.encode(x, add_special_tokens=False) for x in segments], [])
            leaves = [prefix + tokenizer.encode(f'Candidate:\n{x}\nDecision:', add_special_tokens=False) + [tokenizer.eos_token_id] for x in texts]
            if max(map(len, leaves)) > max_length:
                raise ValueError(f'Candidate path exceeds checkpoint limit {max_length}; no truncation applied')
            total_tokens += sum(map(len, leaves))
            examples.append({'state_id': row['id'], 'qid': qid, 'type': q['type'], 'candidate_ids': ids, 'leaf_tokens': leaves})
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
