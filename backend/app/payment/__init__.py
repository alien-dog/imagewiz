from flask import Blueprint

bp = Blueprint('payment', __name__, url_prefix='/api/payment')

from . import routes