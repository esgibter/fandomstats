from flask import render_template, jsonify, request
from fandomstats import app

# Homepage
@app.route("/")
def index():
  return render_template('index.html')