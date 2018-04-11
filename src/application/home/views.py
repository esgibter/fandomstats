from flask import render_template, jsonify, request
from application import app
from application.home import home
#import urllib3
from google.appengine.api import urlfetch

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
  
  
# Testing urllib3 fetch of a https site
@home.route("/urllib3_test")
def urllib3_test():
  url = "http://portfolio.corvidism.com"
  ssl_url = "https://crowdraws.tumblr.com/"
  #http = urllib3.PoolManager(headers={'user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'})
  #r = {}
  #r = http.request('GET', ssl_url,redirect=False)
  try:
      result = urlfetch.fetch(ssl_url)
      if result.status_code == 200:
        output = str(result.headers)
      else:
          output = "error"
  except urlfetch.Error:
      logging.exception('Caught exception fetching url')

  return str(output)
