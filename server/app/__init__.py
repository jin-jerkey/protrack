from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Importer les blueprints ici, après l'init des extensions
    from app.routes import auth, projets, messages, livrables, utilisateur
    app.register_blueprint(auth.bp)
    app.register_blueprint(projets.bp)
    app.register_blueprint(messages.bp)
    app.register_blueprint(livrables.bp)
    app.register_blueprint(utilisateur.bp)
    

    # with app.app_context():
    #     db.create_all()

    return app