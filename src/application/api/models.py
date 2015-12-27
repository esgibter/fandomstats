import sys
import re
from bs4 import BeautifulSoup
import urllib3
import urllib
import pdb
import inspect
from flask.ext.restful import abort


class AO3url:
  # default filters object
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
    self.filters = {
               "type":"works",
               "params": {
                          "tag_id": "",
                          "page": 1,
                          "sort_direction": "asc",
                          "work_search": {}
                          }
               }    
    for k, v in urlArgs.iteritems():
      if v != None:
        if k == "tag_id" or k == "page" or k == "sort_direction":
          self.filters["params"][k] = v
        else:
          self.filters["params"]["work_search"][k] = v

class AO3data:
  # ********* DATA FIELDS
  htmlData = {}
  request_url = ""
  
  def __init__(self,req_url):
      self.request_url = req_url 
      #save the request url to generate proper API url if the tag is non-canonical. Currently not used.            
      
  # METHOD: fetchHTML
  def fetchHTML(self, url):
    
    if self.htmlData == {}:            
      http = urllib3.PoolManager()
      r = {}
      try:
        r = http.request('GET', url,redirect=False)
        status = r.getheader('status')
         
        if status == "200 OK": #everything is okay
            soup = BeautifulSoup(r.data)
            soup.prettify()                
            self.htmlData = soup
        elif status == "302 Found": #this isn't a canonical tag, but it's synned to one
            canonical_url = r.getheader('location')
            canonical_list = canonical_url.split("/") 
            canonical_tag = canonical_list[len(canonical_list)-2]
            canonical_tag = urllib.unquote_plus(canonical_tag)
            raise Exception(302,canonical_tag) 
        elif status == "404 Not Found": # = malformed url or the tag doesn't exist
            #you can't abort from a try..catch block (http://stackoverflow.com/questions/17746897/flask-abort-inside-try-block-behaviour), so I'll throw an exception and handle that later.
            raise Exception(400,"")
        else: #??? something else
            raise Exception(500,"")
        
        #Returning from the if DOES NOT WORK. It has to be here. I DON'T KNOW WHY. #blackmagiccode
        return self.htmlData
        
      except Exception as err:
          code, canonical = err.args
          if code ==302:
              #proper_api_request = re.sub("tag_id=(.*)&",canonical,self.request_url)
              #The above is the proper API url with the canonical tag. In ideal world, we would return a 3xx page that would redirect to it. Sadly, Flask development isn't an ideal world. TODO: Rewrite this whole thing so we can throw our own response/abort pages.
              abort(501, status=501,message="Cannot process non-canonical (redirecting) tag. Canonical tag: '{}'".format(canonical)); #HTTP Status Code: 501 Not Implemented.        
          elif code == 400:
              abort(400, status=400, message="Malformed Ao3 URL. No results found at {}".format(url)) #HTTP Status Code: 400 Bad request. Do not re-run again without modifying.
          else:
              abort(500, status=500, message="HTTP request failed when trying to scrape Ao3!") #HTTP Status Code: 500 Internal Server Error. Something went wrong on our side.
    else:
      return self.htmlData

  # Scrape the top 10 ratings, etc from sidebar
  def getTopInfo(self, url):
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

    soup = self.fetchHTML(url)
   
    for k in topInfo["stats"].keys():
      idstring = "tag_category_" + k

      try:
        top = soup.findAll("dd", {"id" : idstring})[0]
      except:
        abort(400, status=400, message="Malformed Ao3 URL. No results found at {}".format(url))

      labels = top.find_all("label")
      for L in labels:
        tmp = re.compile('(.*) \(([0-9]+)\)')
        m = tmp.match(L.text)
        topInfo["stats"][k][m.group(1)] = int(m.group(2))

    # Scrape the number of works returned
    try:
      tag = soup.find_all(text=re.compile("Work(s)*( found)* in"))[0]
    except AttributeError:
      topInfo["numworks"] = -2
      return

    nums = re.findall('([0-9]+)', tag)
    topInfo["numworks"] = int(nums[-1])

    return topInfo
