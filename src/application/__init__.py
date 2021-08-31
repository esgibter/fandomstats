from .home import home
from .api import api
from flask import Flask
import os

def create_app(static=False):
  current_dir = os.path.dirname(os.path.abspath(__file__))
  static_dir = os.path.join(current_dir,'static')
  app = Flask('application', static_folder=static_dir, static_url_path='/static')

  app.jinja_env.add_extension('jinja2.ext.loopcontrols')

  app.register_blueprint(home)

  if not static:
    app.register_blueprint(api, url_prefix='/api')

  return app
