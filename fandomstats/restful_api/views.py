from flask import render_template, jsonify, request
from fandomstats.restful_api import restful_api
from models import AO3data
from flask.ext.restful import reqparse, abort, Api, Resource
import sys
import re
from bs4 import BeautifulSoup
import urllib3
import urllib
import pdb

api = Api(restful_api)
parser = reqparse.RequestParser()
parser.add_argument('complete', type=str,dest='work_search[complete]',default='') 
#this thing is generally a filter that stores only the allowed query params (also good for "translating" into the AO3 param names?)

class TagStats(Resource):
  # ********* DATA FIELDS
  searchParams = {} #this isn't used anywhere, is it?
  numworks = -1
  popularity = {"kudos": -1, "hits": -1, "comments": -1, "bookmarks": -1} #not this either
  categories = {"rating": {"num": 5, "top": {}}, "warning": {"num": 6, "top": {}}, "category": {"num": 6, "top": {}}, "fandom": {"num": 10, "top": {}}, "character": {"num": 10, "top": {}}, "relationship": {"num": 10, "top": {}}, "freeform": {"num": 10, "top": {}}}
  htmlData = {}

  # METHOD: fetchHTML
  def fetchHTML(self,searchURL):
    if self.htmlData == {}:            
      http = urllib3.PoolManager()
      r = {}
      try:
        r = http.request('GET', searchURL)
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
  def get(self,tag_id):
    args = parser.parse_args()
    searchURL = self.createSearchURL(tag_id,args)
    #return searchURL
    for k in self.categories.keys():
      self.categories[k]["top"] = {}

    soup = self.fetchHTML(searchURL)

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
        
    return self.categories
 
  # METHOD: createSearchURL
  def createSearchURL(self,tag_id,args): 
    url = unicode('http://archiveofourown.org/works?tag_id=') + unicode(tag_id) +"&" + urllib.urlencode(args) #this adds all the parsed arguments and endcodes them
    return url.encode('utf-8')


##
## Actually setup the Api resource routing here
##
api.add_resource(TagStats, '/tagstats/<string:tag_id>')

# Tag Stats
@restful_api.route("/")
def getTagStats():
  return "blah random string"