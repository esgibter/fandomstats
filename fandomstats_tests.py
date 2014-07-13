import os
import fandomstats
import unittest
import tempfile
from fandomstats import AO3url

class FandomstatsTestCase(unittest.TestCase):
    
    def setUp(self):
      fandomstats.app.config['TESTING'] = True
      self.app = fandomstats.app.test_client()

    def test_tag_search(self):
      t = {
            "type":"works",
            "params": {
              "tag_id":"Harry Potter"
            }
          }
      expected = "http://archiveofourown.org/works?tag_id=Harry+Potter"
      a = AO3url.AO3url(t)
      url = a.getUrl()
      self.assertEqual(url, expected)
        
    def test_tag_search_moderately_complex(self):
      t = {
            "type":"works",
            "params": {
              "tag_id":"Harry Potter",
              "work_search": {
                "sort_column": "hits",
                "rating_ids": [11],
                "warning_ids": [16,14,18],
                "complete":1
              }
            }
          }
      expected = "http://archiveofourown.org/works?work_search%5Bsort_column%5D=hits&work_search%5Bwarning_ids%5D%5B%5D=16&work_search%5Bwarning_ids%5D%5B%5D=14&work_search%5Bwarning_ids%5D%5B%5D=18&work_search%5Brating_ids%5D%5B%5D=11&work_search%5Bcomplete%5D=1&tag_id=Harry+Potter"
      a = AO3url.AO3url(t)
      url = a.getUrl()
      self.assertEqual(url, expected)

    def test_tag_search_complex(self):
      t = {
            "type":"works",
            "params": {
              "page":3,
              "tag_id":"Harry Potter",
              "work_search": {
                "sort_column": "revised_at",
                "rating_ids": [11],
                "warning_ids": [16,14,18],
                "relationship_ids":[11006,5672,264659],
                "other_tag_names":[],
                "language_id":"",
                "query":"Hermione",
                "complete":1
              }
            }
          }
      expected = 'http://archiveofourown.org/works?work_search%5Blanguage_id%5D=&work_search%5Bwarning_ids%5D%5B%5D=16&work_search%5Bwarning_ids%5D%5B%5D=14&work_search%5Bwarning_ids%5D%5B%5D=18&work_search%5Bcomplete%5D=1&work_search%5Bquery%5D=Hermione&work_search%5Bsort_column%5D=revised_at&work_search%5Brating_ids%5D%5B%5D=11&work_search%5Brelationship_ids%5D%5B%5D=11006&work_search%5Brelationship_ids%5D%5B%5D=5672&work_search%5Brelationship_ids%5D%5B%5D=264659&page=3&tag_id=Harry+Potter'
      a = AO3url.AO3url(t)
      url = a.getUrl()
      self.assertEqual(url, expected)

if __name__ == '__main__':
    unittest.main()
