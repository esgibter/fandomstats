import os
import fandomstats
import unittest
import tempfile
from werkzeug import datastructures 
from fandomstats.api.models import AO3url 

class FandomstatsTestCase(unittest.TestCase):
    
    def setUp(self):
      fandomstats.app.config['TESTING'] = True
      self.app = fandomstats.app.test_client()
      self.maxDiff = None

    def test_tag_search(self):
      t = {
            "type":"works",
            "params": {
              "tag_id":"Harry Potter"
            }
          }
      expected = "http://archiveofourown.org/works?tag_id=Harry+Potter"
      url = AO3url().getUrl(t)
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
      url = AO3url().getUrl(t)
      self.assertEqual(url, expected)

    def test_tag_search_complex(self):
      t = {
            "type":"works",
            "params": {
              "page":3,
              "tag_id":"Draco Malfoy/Harry Potter",
              "work_search": {
                "sort_column": "revised_at",
                "rating_ids": [13],
                "category_ids": [23],
                "fandom_ids":[136512],
                "character_ids":[1803,1589,1048],
                "other_tag_names":["Draco Malfoy", "Harry Potter"],
                "complete":0
              }
            }
          }
      expected = 'http://archiveofourown.org/works?work_search%5Bcomplete%5D=0&work_search%5Bsort_column%5D=revised_at&work_search%5Bcategory_ids%5D%5B%5D=23&work_search%5Bcharacter_ids%5D%5B%5D=1803&work_search%5Bcharacter_ids%5D%5B%5D=1589&work_search%5Bcharacter_ids%5D%5B%5D=1048&work_search%5Bfandom_ids%5D%5B%5D=136512&work_search%5Bother_tag_names%5D%5B%5D=Draco+Malfoy&work_search%5Bother_tag_names%5D%5B%5D=Harry+Potter&work_search%5Brating_ids%5D%5B%5D=13&page=3&tag_id=Draco+Malfoy%2FHarry+Potter'
      url = AO3url().getUrl(t)
      self.assertEqual(url, expected)

    def test_create_filters(self):
      args = datastructures.ImmutableMultiDict([
        ("page",3),
        ("tag_id","Harry Potter"),
        ("rating_ids",12),
        ("rating_ids",13),
        ("complete",1),
        ("sort_direction","desc")
      ])
      expected = {
        "type":"works",
        "params": {
          "page": 3,
          "tag_id": "Harry Potter",
          "sort_direction":"desc",
          "work_search": {
            "query": "",
            "title": "",
            "creator": "",
            "revised_at": "",
            "complete": 1,
            "single_chapter": 0,
            "rating_ids": [12, 13],
            "warning_ids": [],
            "category_ids": [],
            "fandom_names": [],
            "fandom_ids": [],
            "character_names": [],
            "character_ids": [],
            "relationship_names": [],
            "relationship_ids": [],
            "freeform_names": [],
            "freeform_ids": [],
            "other_tag_names": [],
            "other_tag_ids": [],
            "sort_column": ""
          }
        } 
      }
      a = AO3url()
      a.setFilters(args)
      self.assertEqual(a.getFilters(), expected)

if __name__ == '__main__':
    unittest.main()
