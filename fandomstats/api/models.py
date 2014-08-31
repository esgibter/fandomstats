import sys
import re
from bs4 import BeautifulSoup
import urllib3
import urllib
import pdb

class AO3url:
  # default filters object
  filters = {
    "type":"works",
    "params": {
      "tag_id": "",
      "page": 1,
      "sort_direction": "asc",
      "work_search": {
        "query": "",
        "title": "",
        "creator": "",
        "revised_at": "",
        "complete": 0,
        "single_chapter": 0,
        "rating_ids": [],
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

  def getFilters(self):
    return self.filters

  def getUrl(self, filters=None):
    if filters is None:
      filters = self.filters
    else:
      self.filters = filters
    # Creates URL from search parameters
    url = "http://archiveofourown.org/"
    url += self.filters['type'] + "?"
    for k, v in self.filters['params'].iteritems():
      if type(v) is dict:
        for wk, wv in v.iteritems():
          if type(wv) is list:
            # go through each value in the list
            for xv in wv:
              url += urllib.quote_plus("work_search[" + wk + "][]") + "=" + urllib.quote_plus(str(xv), '+') + "&"
          else:
            url += urllib.quote_plus("work_search[" + wk + "]") + "=" + urllib.quote_plus(str(wv), '+') + "&"
      else:
        url += k + "=" + urllib.quote_plus(str(v), '+') + "&" 
    return url[:-1]
 
  def setFilters(self, urlArgs):
    # This sets the filters object from a list of URL arguments
    for k, v in urlArgs.iteritems():
      if v != None:
        if k == "tag_id" or k == "page" or k == "sort_direction":
          self.filters["params"][k] = v
        else:
          self.filters["params"]["work_search"][k] = v

class AO3data:
  # ********* DATA FIELDS
  numworks = -1
  popularity = {"kudos": -1, "hits": -1, "comments": -1, "bookmarks": -1}
  categories = {"rating": {"num": 5, "top": {}}, "warning": {"num": 6, "top": {}}, "category": {"num": 6, "top": {}}, "fandom": {"num": 10, "top": {}}, "character": {"num": 10, "top": {}}, "relationship": {"num": 10, "top": {}}, "freeform": {"num": 10, "top": {}}}
  htmlData = {}

  # METHOD: fetchHTML
  def fetchHTML(self):
    if self.htmlData == {}:            
      http = urllib3.PoolManager()
      r = {}
      try:
        r = http.request('GET', self.searchURL)
        soup = BeautifulSoup(r.data)
        soup.prettify()                
        self.htmlData = soup
        return soup
      except:
        # TODO: flask error handling
        # print "ERROR: failure to fetch URL: ", self.searchURL
        return
    else:
      return self.htmlData

  # METHOD: getTopInfo -- scrape the top 10 ratings, etc from sidebar
  def getTopInfo(self):
    for k in self.categories.keys():
      self.categories[k]["top"] = {}

    soup = self.fetchHTML()

    for k in self.categories.keys():
      idstring = "tag_category_" + k

      try:
        topList = soup.findAll("dd", {"id" : idstring})
      except AttributeError:
        # print "ERROR: empty HTML data: ", self.searchURL
        self.numworks = -2
        return
      
      try:
        top = topList[0]
      except:
        # print "ERROR! " + k  
        return
      
      labels = top.find_all("label")
      for L in labels:
        tmp = re.compile('(.*) \(([0-9]+)\)')
        m = tmp.match(L.text)
        self.categories[k]["top"][m.group(1)] = int(m.group(2))
