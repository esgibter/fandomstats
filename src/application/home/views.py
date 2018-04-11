from flask import render_template, jsonify, request
from application import app
from application.home import home

# Homepage
@home.route("/")
def index():
  return render_template('homepage.html')
  
# AO3 Bookmark Viewer
@home.route("/ao3-bookmark-viewer")
def bookmark_viewer():
  return render_template('bookmark-viewer.html')
  
# AO3 Tag Stats
@home.route("/ao3-tag-stats")
def tag_stats():
  return render_template('tag-stats.html')

# Fandom Research Directory
@home.route("/fandom-research-directory")
def linkspam():
  return render_template('linkspam.html')

# About
@home.route("/about")
def about():
  return render_template('about.html')
  
# About
@home.route("/reading-the-data")
def howto():
  return render_template('reading-the-data.html')

# Google Search Console verification file
@home.route("/google137e022a821ce1e1.html")
def GSC_file():
  return app.send_static_file('google137e022a821ce1e1.html')
