from .home import home
from .api import api
from flask import Flask
import os

def jinja_filter_get_env(value, key):
  # the "filtered" value serves as a fallback
  return os.getenv(key, value)

def create_app():
  current_dir = os.path.dirname(os.path.abspath(__file__))
  static_dir = os.path.join(current_dir,'static')
  app = Flask('application', static_folder=static_dir, static_url_path='/static')

  app.jinja_env.add_extension('jinja2.ext.loopcontrols')
  app.jinja_env.filters['env'] = jinja_filter_get_env

  app.register_blueprint(home)

  is_static = (os.getenv('F_STATIC', 'False') == 'True')

  if not is_static:
    app.register_blueprint(api, url_prefix='/api')

  return app
