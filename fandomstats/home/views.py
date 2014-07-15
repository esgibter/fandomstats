from flask import render_template, jsonify, request
from fandomstats.home import home

# Homepage
@home.route("/")
def index():
  return render_template('index.html')