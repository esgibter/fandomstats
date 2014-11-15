from flask import Blueprint, render_template, jsonify, request

home = Blueprint(
    'home',
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/home/static'
)

import views