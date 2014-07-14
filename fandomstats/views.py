#TODO: put this into proper models/views folder structure before it gets messy.
from flask import render_template, jsonify, request
from fandomstats import app
from fandomstats import AO3search

# Homepage
@app.route("/")
def index():
    return render_template('index.html')

# Tag Stats
@app.route("/api/v1.0/stats/tag/<tag_id>", methods=['GET'])
def getTagStats(tag_id):
  # todo: add error handling for empty tagid
  s = AO3search.AO3data()
  s.tag_id = tag_id
  s.createSearchURL()
  s.getTopInfo()
  return jsonify({ 'stats': s.categories })