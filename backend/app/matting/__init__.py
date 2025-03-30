from flask import Blueprint

bp = Blueprint('matting', __name__, url_prefix='/matting')

from . import routes