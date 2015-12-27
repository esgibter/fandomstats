from flask import render_template, jsonify, request
from application.home import home

# Homepage
@home.route("/")
def index():
  return render_template('homepage.html')
