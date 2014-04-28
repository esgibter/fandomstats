"""
  Fandom Stats
"""

from flask import Flask, request, render_template, jsonify
import AO3search

# Create app
app = Flask(__name__)

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

# Run app
if __name__ == "__main__":
  app.debug = True 
  app.run()
