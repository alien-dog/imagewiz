from flask import Blueprint

bp = Blueprint('matting', __name__, url_prefix='/api/matting')

from . import routes