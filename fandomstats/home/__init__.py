from flask import Blueprint, render_template, jsonify, request

home = Blueprint(
    'home',
    __name__,
    template_folder='templates',
    static_folder='static'
)

# Homepage
@home.route("/")
def index():
  return render_template('index.html')