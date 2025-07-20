from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from datetime import datetime
from db import create_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or not role:
        return jsonify({'error': 'Veuillez remplir tous les champs'}), 400

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion à la base de données'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM utilisateur WHERE Email=%s AND Role=%s",
            (email, role)
        )
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'Utilisateur ou rôle incorrect'}), 401

        if not check_password_hash(user['Mot_passe'], password):
            return jsonify({'error': 'Mot de passe incorrect'}), 401

        access_token = f"fake-token-{user['Id_user']}-{int(datetime.utcnow().timestamp())}"

        user_data = {
            "id": user['Id_user'],
            "name": user['Nom_user'],
            "email": user['Email'],
            "role": user['Role']
        }

        cursor.execute(
            "INSERT INTO audit_log (action, table_affectee, details, date_action, utilisateur_id) VALUES (%s, %s, %s, %s, %s)",
            ('CONNEXION', '', f"Utilisateur connecté: {email}", datetime.now(), user['Id_user'])
        )
        conn.commit()

        return jsonify({
            'access_token': access_token,
            'user': user_data
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Erreur serveur'}), 500
    finally:
        cursor.close()
        conn.close()