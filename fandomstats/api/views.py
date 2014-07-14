#TODO: put this into proper models/views folder structure before it gets messy.
from flask import render_template, jsonify, request
from api import api
from fandomstats import AO3search

# Tag Stats
@api.route("/api/v1.0/stats/tag/<tag_id>", methods=['GET'])
def getTagStats(tag_id):
  # todo: add error handling for empty tagid
  s = AO3search.AO3data()
  s.tag_id = tag_id
  s.createSearchURL()
  s.getTopInfo()
  return jsonify({ 'stats': s.categories })