from flask_restful import Api
from flask import Blueprint
from .resource import Stats, MediaCategories, MediaStats

api = Blueprint(
    'api',
    __name__,
    template_folder='templates',
    static_folder='static',
    url_prefix='/api'
)

# VIEWS


version_base = '/v1.0'
a = Api(api, prefix=version_base)

# API routing
a.add_resource(Stats, "/stats")
a.add_resource(MediaStats, "/stats/media")
a.add_resource(MediaCategories, "/stats/media/list")
