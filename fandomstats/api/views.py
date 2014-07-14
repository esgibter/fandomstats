from flask import render_template, jsonify, request
from fandomstats.api import api
from models import AO3data

version_base = '/v1.0' 

# Tag Stats
@api.route(version_base+"/stats/tag/<tag_id>", methods=['GET'])
def getTagStats(tag_id):
  # todo: add error handling for empty tagid
  s = AO3data()
  s.tag_id = tag_id
  s.createSearchURL()
  s.getTopInfo()
  return jsonify({ 'stats': s.categories })