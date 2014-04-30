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
  
# simple output page
@app.route("/simple/")
@app.route("/simple/<tag_id>", methods=['GET'])
def simple(tag_id=''):
    fakeReply = { 'character':
              {'Clint Barton':26,
               'Greer (Reign)':17,
               'Kenna (Reign)':12
               }
              }
    s = AO3search.AO3data()
    s.tag_id = tag_id
    s.createSearchURL()
    s.getTopInfo()
    reply = s.categories
    #aaaaaand... this is BAD. I should be using the API, not the internal function, because that's why we're doing this right? Riiiiight. 
    topten = {
              'characters':sorted(reply['character']['top'].iteritems(),key=lambda x: x[1],reverse=True)
              }
    return render_template('simple.html',
                           title = 'Simple API output',
                           tag_id=tag_id,
                           topten = topten,
                           )
