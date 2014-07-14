from flask import Flask

app = Flask(__name__)
from fandomstats.api import api
from fandomstats.home import home

app = Flask(__name__)

app.register_blueprint(api, subdomain='api')
app.register_blueprint(home)