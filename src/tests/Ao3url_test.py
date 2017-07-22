# coding=utf-8

import os,sys
sys.path.insert(1, os.path.join(os.path.abspath('.'), 'lib'))
import application as fandomstats
import unittest
import tempfile
from werkzeug import datastructures 
from application.api.models import AO3url

class Ao3urlTestCase(unittest.TestCase):
    
    def setUp(self):
      fandomstats.app.config['TESTING'] = True
      self.app = fandomstats.app.test_client()
      self.maxDiff = None

    def test_getUrl_basic(self):
      t = {
            "type":"works",
            "params": {
              "tag_id":"Harry Potter"
            }
          }
      expected = "http://archiveofourown.org/works?tag_id=Harry+Potter"
      url = AO3url().getUrl(t)
      self.assertEqual(url, expected)
      
    def test_getUrl_UTF8(self):
      t = {
            "type":"works",
            "params": {
              "tag_id":"방탄소년단 | Bangtan Boys | BTS"
            }
          }
      expected = "http://archiveofourown.org/works?tag_id=%EB%B0%A9%ED%83%84%EC%86%8C%EB%85%84%EB%8B%A8+%7C+Bangtan+Boys+%7C+BTS"
      url = AO3url().getUrl(t)
      self.assertEqual(url, expected)
    
    
    def test_getUrl_other_tag_names(self):
        t = {
             "type":"works",
             "params": {
                "tag_id":"Fluff",
                "work_search": {
                  "other_tag_names":"Angst"
                }
              }
             }  
        expected = "http://archiveofourown.org/works?work_search%5Bother_tag_names%5D=Angst&tag_id=Fluff"
        url = AO3url().getUrl(t)
        self.assertEqual(url, expected)
          
    def test_getUrl_moderately_complex(self):
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
      expected = "http://archiveofourown.org/works?work_search%5Bsort_column%5D=hits&work_search%5Bwarning_ids%5D=16%2C14%2C18&work_search%5Brating_ids%5D=11&work_search%5Bcomplete%5D=1&tag_id=Harry+Potter"
      url = AO3url().getUrl(t)
      self.assertEqual(url, expected)

    def test_getUrl_complex(self):
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
      expected = 'http://archiveofourown.org/works?work_search%5Bcomplete%5D=0&work_search%5Bsort_column%5D=revised_at&work_search%5Bcategory_ids%5D=23&work_search%5Bcharacter_ids%5D=1803%2C1589%2C1048&work_search%5Bfandom_ids%5D=136512&work_search%5Bother_tag_names%5D=Draco+Malfoy%2CHarry+Potter&work_search%5Brating_ids%5D=13&page=3&tag_id=Draco+Malfoy%2FHarry+Potter'
      url = AO3url().getUrl(t)
      self.assertEqual(url, expected)

    def test_setFilters(self):
      args = { 
        "page":3,
        "tag_id":"Harry Potter",
        "rating_ids":[12,13],
        "complete":1,
        "sort_direction":"desc"
      }
      expected = {
        "type":"works",
        "params": {
          "page": 3,
          "tag_id": "Harry Potter",
          "utf8":"✓",
          "sort_direction":"desc",
          "work_search": {
            "complete": 1,
            "rating_ids": [12, 13],
          }
        } 
      }
      a = AO3url()
      a.setFilters(args)
      self.assertEqual(a.getFilters(), expected)

if __name__ == '__main__':
    unittest.main()
