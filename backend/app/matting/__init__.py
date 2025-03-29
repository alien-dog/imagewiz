from flask import Blueprint

matting_bp = Blueprint('matting', __name__)

from app.matting import routes