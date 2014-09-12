from flask import Flask

app = Flask(__name__)
from fandomstats.api import api
from fandomstats.home import home
from fandomstats.bobble import bobble

app = Flask(__name__)

app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(home)
app.register_blueprint(bobble,url_prefix='/bobble')
