"""Input-budget and transport-contract tests; no MLX import or model inference."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from laya_mlx_service import prepare_payload

class Tokenizer:
    cls_token_id=1
    sep_token_id=2
    mask_token_id=3
    mask_token='[MASK]'
    def __call__(self,text,**_):return {'input_ids':[ord(c)+10 for c in text]}

def options(q):
    if q['t']=='noul':return ['false: no','true: yes']
    if q['t']=='score':return ['level '+str(i)+': '+s for i,s in enumerate(q['crit'])]
    return [k+': '+v for k,v in q['crit'].items()]

class Agent:
    tok=Tokenizer()
    cfg={'max_len':1024,'head_max_len':256}
    def _to_internal(self,q):return {'t':q['type'],'ins':q['instructions'],'crit':q.get('criteria')}
    def prepare(self,state,questions):
        out=[]
        for q in questions.values():
            iq=self._to_internal(q);encode=lambda s:self.tok(s)['input_ids']
            ids=[1]+encode(iq['t']+' question: '+iq['ins'])+[2]
            for o in options(iq):ids += [3]+encode(' '+o)
            ids += [2]+encode(state)+[2]
            out.append({'ids':ids})
        return out,[]

class ContractTests(unittest.TestCase):
    def request(self,**patch):
        row={'id':'arena','state':'synthetic','questions':{'q':{'type':'boolean','instructions':'Is this a test?'}}};row.update(patch);return {'states':[row]}
    def plan(self,r):return prepare_payload(Agent(),r,options,lambda s:s)
    def test_valid_keeps_state_and_adapts_boolean_explicitly(self):
        plans,total=self.plan(self.request());self.assertEqual(plans[0][1]['q']['type'],'noul');self.assertEqual(plans[0][0]['state'],'synthetic');self.assertGreater(total,0)
    def test_no_silent_state_question_or_option_truncation(self):
        for r in [self.request(state='x'*2000),self.request(questions={'q':{'type':'boolean','instructions':'x'*300}}),self.request(questions={'q':{'type':'choice','instructions':'Choose','criteria':{'a':'x'*60,'b':'short'}}})]:
            with self.assertRaises(ValueError):self.plan(r)
    def test_reserved_tokens_and_unsupported_shapes_fail_closed(self):
        for r in [self.request(state='[MASK]'),self.request(questions={'q':{'type':'choice','instructions':'Choose','criteria':{str(i):'v' for i in range(21)}}}),{'states':[]}]:
            with self.assertRaises(ValueError):self.plan(r)
    def test_entire_request_prepared_before_any_inference(self):
        r=self.request();r['states'].append({'id':'later','state':'x'*2000,'questions':r['states'][0]['questions']})
        with self.assertRaises(ValueError):self.plan(r)
    def test_encoding_drift_is_rejected(self):
        a=Agent();a.prepare=lambda *_:([{'ids':[1,2]}],[])
        with self.assertRaisesRegex(ValueError,'encoding_mismatch'):prepare_payload(a,self.request(),options,lambda s:s)

if __name__=='__main__':unittest.main()
