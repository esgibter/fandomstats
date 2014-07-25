from flask import Flask

app = Flask(__name__)
from fandomstats.api import api
from fandomstats.home import home
from fandomstats.restful_api import restful_api

app = Flask(__name__)

app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(restful_api, url_prefix='/restful_api')
app.register_blueprint(home)