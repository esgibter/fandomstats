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
        print "url: {}".format(url)
        r = http.request('GET', url,redirect=False)
        redirect_loc = r.get_redirect_location()
         
        if redirect_loc == False: #no redirection
            soup = BeautifulSoup(r.data)
            soup.prettify()                
            self.htmlData = soup
        elif isinstance(redirect_loc,basestring): #redirecting somewhere
            if (redirect_loc.find("/works") == -1): #it's a tag that can't be filtered on
                raise Exception(404,"")
            else: #it's a synned tag 
                canonical_url = redirect_loc
                canonical_list = canonical_url.split("/") 
                canonical_tag = canonical_list[len(canonical_list)-2]
                canonical_tag = urllib.unquote_plus(canonical_tag)
                raise Exception(302,canonical_tag)
        else: #???something else
            raise Exception(500,"")
        
        #Returning from the if DOES NOT WORK. It has to be here. I DON'T KNOW WHY. #blackmagiccode
        return self.htmlData
        
      except Exception as err:
          code, canonical = err.args
          if code ==302:
              #proper_api_request = re.sub("tag_id=(.*)&",canonical,self.request_url)
              #The above is the proper API url with the canonical tag. In ideal world, we would return a 3xx page that would redirect to it. Sadly, Flask development isn't an ideal world. TODO: Rewrite this whole thing so we can throw our own response/abort pages.
              abort(501, status=501,message="Cannot process non-canonical (redirecting) tag. Canonical tag: '{}'".format(canonical)); #HTTP Status Code: 501 Not Implemented.        
          elif code == 404:
              abort(404, status=404, message="This tag cannot be filtered on.") #HTTP Status Code: 404 Not Found
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
        #this catches also when the tag doesn't exist (404)

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
