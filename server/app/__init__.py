from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.routes import auth, projets, messages, livrables

# Initialisation des extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialisation des extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Enregistrement des blueprints
    from app.routes import auth, projets, messages, livrables
    app.register_blueprint(auth.bp)
    app.register_blueprint(projets.bp)
    app.register_blueprint(messages.bp)
    app.register_blueprint(livrables.bp)
    
    # Création des tables (pour le développement)
    with app.app_context():
        db.create_all()
    
    return app