from flask import Blueprint

bp = Blueprint('cms', __name__, url_prefix='/api/cms')

from . import routes