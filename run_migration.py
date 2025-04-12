from flask import Flask
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import scoped_session, sessionmaker

# Create a simple Flask app
app = Flask(__name__)

# Configure SQLAlchemy database URI from environment variable
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Create a database connection
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

try:
    # Execute the migration directly using raw SQL
    with engine.connect() as connection:
        connection.execute(text('ALTER TABLE cms_tags ADD COLUMN IF NOT EXISTS description VARCHAR(255)'))
        connection.commit()
    print('Migration successful: Added description column to cms_tags table')
except Exception as e:
    print(f'Error during migration: {str(e)}')
finally:
    # Close session
    db_session.remove()