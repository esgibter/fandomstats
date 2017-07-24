import os,sys,json
sys.path.insert(1, os.path.join(os.path.abspath('.'), 'lib'))
import application as fandomstats
import unittest
import requests
import tempfile
from werkzeug import datastructures 

#tries to test numbers of returned works - should catch bugs when AO3 ignores params and loads non-filtered tag
class ApiTest(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        fandomstats.app.config['TESTING'] = True
        fandomstats.app.config['DEBUG'] = True
        tmp_app = fandomstats.app.test_client()
        response_all = tmp_app.get('/api/v1.0/stats?tag_id=Harry+Potter')
        json_data_all = json.loads(response_all.data)
        cls._hp_numworks = json_data_all['numworks'] 
        
    def setUp(self):
        self.app = fandomstats.app.test_client()
        self.maxDiff = None             
       
    def test_multiple_tags(self):
        response = self.app.get('/api/v1.0/stats?tag_id=Harry+Potter&other_tag_names=Draco+Malfoy&other_tag_names=Sirius+Black')
        json_data = json.loads(response.data)
        numworks = json_data['numworks']
        self.assertNotAlmostEqual(self._hp_numworks,numworks,delta=numworks/100)
        
    def test_bracket_tags(self):
        response = self.app.get('/api/v1.0/stats?tag_id=Harry+Potter&other_tag_names[]=Draco+Malfoy&other_tag_names[]=Sirius+Black')
        json_data = json.loads(response.data)
        numworks = json_data['numworks']
        self.assertNotAlmostEqual(self._hp_numworks,numworks,delta=numworks/100)
    
    def test_bracket_tags_mixed(self):
        response = self.app.get('/api/v1.0/stats?tag_id=Harry+Potter&other_tag_names[]=Draco+Malfoy&other_tag_names[]=Sirius+Black')
        json_data = json.loads(response.data)
        numworks = json_data['numworks']
        self.assertNotAlmostEqual(self._hp_numworks,numworks,delta=numworks/100)
        

if __name__ == '__main__':
    unittest.main()
