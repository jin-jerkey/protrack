import requests
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
import os
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from db import create_db_connection
from routes.auth_routes import auth_bp
from routes.utilisateur_routes import utilisateur_bp
from routes.projet_route import projet_bp
from routes.equipe_route import equipe_bp
from routes.audit_route import audit_bp
from routes.notification_route import notification_bp
from routes.planification_route import planification_bp
from routes.document_route import document_bp
from routes.employe_route import employe_bp
from routes.message_route import message_bp
from routes.dashboard_route import dashboard_bp



app = Flask(__name__)

# Configuration CORS détaillée
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "User-Id"],  # Ajout de User-Id
        "supports_credentials": True
    }
})
 
# Configuration de la base de données
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'protrack'
}

# Fonction pour créer une connexion à la base de données
def create_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        print("Connexion à MySQL réussie")
        return connection
    except Error as e:
        print(f"Erreur lors de la connexion à MySQL: {e}")
        return None

# Route exemple pour la page d'accueil
@app.route('/')
def home():
    return jsonify({"message": "Bienvenue sur le serveur!"})

# Route exemple pour une requête POST
@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.json
    return jsonify({"status": "success", "received": data})


# Enregistre les blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(utilisateur_bp)
app.register_blueprint(projet_bp)
app.register_blueprint(equipe_bp)
app.register_blueprint(audit_bp)
app.register_blueprint(notification_bp)
app.register_blueprint(planification_bp)
app.register_blueprint(document_bp)
app.register_blueprint(employe_bp)
# Enregistrer le blueprint des messages
app.register_blueprint(message_bp)
app.register_blueprint(dashboard_bp)

if __name__ == '__main__':
    # Démarrer le serveur sur le port 5000
    app.run(debug=True, port=5000)
