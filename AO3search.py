import sys
import re
from bs4 import BeautifulSoup
import urllib3
import pdb

class AO3data:
  # ********* DATA FIELDS
  searchParams = {}
  numworks = -1
  popularity = {"kudos": -1, "hits": -1, "comments": -1, "bookmarks": -1}
  categories = {"rating": {"num": 5, "top": {}}, "warning": {"num": 6, "top": {}}, "category": {"num": 6, "top": {}}, "fandom": {"num": 10, "top": {}}, "character": {"num": 10, "top": {}}, "relationship": {"num": 10, "top": {}}, "freeform": {"num": 10, "top": {}}}
  htmlData = {}

  def statsToJSON(self):
    self.stats = {}
    print self.categories

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
        print "ERROR: failure to fetch URL: ", self.searchURL
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
 
  # METHOD: createSearchURL
  def createSearchURL(self):
    url = unicode('http://archiveofourown.org/works?tag_id=') + unicode(self.tag_id)
    self.searchURL = url.encode('utf-8')
