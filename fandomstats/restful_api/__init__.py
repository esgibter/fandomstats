from flask import Blueprint

restful_api = Blueprint(
    'restful_api',
    __name__,
    template_folder='templates',
    static_folder='static'
)

import views