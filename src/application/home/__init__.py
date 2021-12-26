from flask import Blueprint, render_template, jsonify, request
from flask import current_app as app

home = Blueprint(
    'home',
    __name__,
    template_folder='templates'
)

# VIEWS

@home.route("/")
def index():
  return render_template('homepage.html')

# AO3 Bookmark Viewer


@home.route("/ao3-bookmark-viewer/")
def bookmark_viewer():
  return render_template('bookmark-viewer.html')

@home.route("/ao3-random-work/")
def random_work():
  return render_template('random-work.html')

# AO3 Tag Stats


@home.route("/ao3-tag-stats/")
def tag_stats():
  return render_template('tag-stats.html')

# Fandom Research Directory


@home.route("/fandom-research-directory/")
def linkspam():
  return render_template('linkspam.html')

# About


@home.route("/about/")
def about():
  return render_template('about.html')

# Reading the Data


@home.route("/reading-the-data/")
def howto():
  return render_template('reading-the-data.html')

# Resources


@home.route("/resources/")
def resources():
  return render_template('resources.html')

# Resources: AO3 daily activity data


@home.route("/ao3-activity-data/")
def activity_data():
  return render_template('ao3-activity-data.html')


# Google Search Console verification file
@home.route("/google137e022a821ce1e1.html")
def GSC_file():
  return render_template('google137e022a821ce1e1.html')
