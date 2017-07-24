import os,sys,json
sys.path.insert(1, os.path.join(os.path.abspath('.'), 'lib'))
import application as fandomstats
import unittest
import requests
import tempfile
from werkzeug import datastructures 

#basic smoke test - checks if everything returns the right status codes
class ApiTest(unittest.TestCase):
    
    def setUp(self):
      fandomstats.app.config['TESTING'] = True
      fandomstats.app.config['DEBUG'] = True
      self.app = fandomstats.app.test_client()
      self.maxDiff = None
   
    def test_simple_call(self):
        response = self.app.get('/api/v1.0/stats?tag_id=Harry+Potter')
        self.assertEqual(response.status_code,200)
        
    def test_nonexistent_tag(self):
        response = self.app.get('/api/v1.0/stats?tag_id=yoink')
        self.assertEqual(response.status_code,404)
    
    @unittest.skip("currently untestable - aborts internally and throws an error") 
    def test_synonym_tag(self):
        response = self.app.get('/api/v1.0/stats?tag_id=Imperator+Furiosa')
        self.assertEqual(response.status_code,501)
    
    def test_multiple_tags(self):
        response = self.app.get('/api/v1.0/stats?tag_id=Harry+Potter&other_tag_names=Draco+Malfoy&other_tag_names=Sirius+Black')
        self.assertEqual(response.status_code,200)
        
    def test_bracket_tags(self):
        response = self.app.get('/api/v1.0/stats?tag_id=Harry+Potter&other_tag_names[]=Draco+Malfoy&other_tag_names[]=Sirius+Black')
        self.assertEqual(response.status_code,200)
    
    def test_bracket_tags_mixed(self):
        response = self.app.get('/api/v1.0/stats?tag_id=Harry+Potter&other_tag_names[]=Draco+Malfoy&other_tag_names[]=Sirius+Black')
        self.assertEqual(response.status_code,200)        

if __name__ == '__main__':
    unittest.main()
