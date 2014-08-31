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
      "work_search": {}
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
  topInfo = {
    "numworks": -1,
    "stats": {
      "rating": {},
      "warning": {},
      "category": {},
      "fandom": {},
      "character": {},
      "relationship": {},
      "freeform": {}
    }
  }
  htmlData = {}

  # METHOD: fetchHTML
  def fetchHTML(self, url):
    if self.htmlData == {}:            
      http = urllib3.PoolManager()
      r = {}
      try:
        r = http.request('GET', url)
        soup = BeautifulSoup(r.data)
        soup.prettify()                
        self.htmlData = soup
        return soup
      except:
        # TODO: flask error handling
        # print "ERROR: failure to fetch URL: ", url 
        return
    else:
      return self.htmlData

  # Scrape the top 10 ratings, etc from sidebar
  def getTopInfo(self, url):
    soup = self.fetchHTML(url)

    for k in self.topInfo["stats"].keys():
      idstring = "tag_category_" + k

      try:
        top = soup.findAll("dd", {"id" : idstring})[0]
      except AttributeError:
        # TODO: flask error handling
        # print "ERROR: empty HTML data"
        return
      
      labels = top.find_all("label")
      for L in labels:
        tmp = re.compile('(.*) \(([0-9]+)\)')
        m = tmp.match(L.text)
        self.topInfo["stats"][k][m.group(1)] = int(m.group(2))

    # Scrape the number of works returned
    try:
      tag = soup.find_all(text=re.compile("Work(s)*( found)* in"))[0]
    except AttributeError:
      # TODO: flask error handling
      # print "ERROR: empty HTML data"
      self.topInfo["numworks"] = -2
      return

    nums = re.findall('([0-9]+)', tag)
    self.topInfo["numworks"] = nums[-1]

    return self.topInfo
