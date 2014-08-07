from flask import render_template, jsonify, request
from fandomstats.api import api
from models import AO3data, AO3url

version_base = '/v1.0' 

# Stats for any search filter
@api.route(version_base+"/stats", methods=['GET'])
def getStats():
  # Returns stats for any list of search arguments
  s = AO3data()
  url = AO3url()
  url.setFilters(request.args)
  s.searchURL = url.getUrl()
  s.getTopInfo()
  return jsonify({ 'stats': s.categories })

# Tag Stats
@api.route(version_base+"/stats/tag/<tag_id>", methods=['GET'])
def getTagStats(tag_id):
  # todo: possibly remove completely? possibly unnecessary?
  # todo: add error handling for empty tagid
  params = {
    "type": "works",
    "params": {
      "tag_id": tag_id
    } 
  }
  s = AO3data()
  s.searchURL = AO3url().getUrl(params) 
  s.getTopInfo()
  return jsonify({ 'stats': s.categories })
