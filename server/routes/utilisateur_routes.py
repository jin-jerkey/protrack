from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from db import create_db_connection

utilisateur_bp = Blueprint('utilisateur', __name__)

# Afficher tous les utilisateurs
@utilisateur_bp.route('/api/utilisateur/', methods=['GET'])
def get_utilisateurs():
    conn = create_db_connection()
    if not conn:
        return jsonify([]), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT Id_user as id, Nom_user as nom, Email as email, phone_user as telephone, Role as role, ActiviteClient as activite, PaysClient as pays FROM utilisateur")
        users = cursor.fetchall()
        return jsonify(users)
    finally:
        cursor.close()
        conn.close()

# Ajouter un utilisateur
@utilisateur_bp.route('/api/utilisateur/', methods=['POST'])
def add_utilisateur():
    data = request.get_json()
    nom = data.get('nom')
    email = data.get('email')
    password = data.get('password')
    telephone = data.get('telephone')
    role = data.get('role')
    activite = data.get('activite')
    pays = data.get('pays')

    if not (nom and email and password and role):
        return jsonify({'error': 'Champs requis manquants'}), 400

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT Id_user FROM utilisateur WHERE Email=%s", (email,))
        if cursor.fetchone():
            return jsonify({'error': 'Email déjà utilisé'}), 400

        hash_pwd = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO utilisateur (Nom_user, Email, Mot_passe, phone_user, Role, ActiviteClient, PaysClient) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (nom, email, hash_pwd, telephone, role, activite, pays)
        )
        conn.commit()
        return jsonify({'message': 'Utilisateur créé'}), 201
    finally:
        cursor.close()
        conn.close()

# Modifier un utilisateur
@utilisateur_bp.route('/api/utilisateur/<int:id>', methods=['PUT'])
def update_utilisateur(id):
    data = request.get_json()
    nom = data.get('nom')
    email = data.get('email')
    telephone = data.get('telephone')
    role = data.get('role')
    activite = data.get('activite')
    pays = data.get('pays')
    password = data.get('password')

    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        # Si password fourni, on le met à jour
        if password:
            hash_pwd = generate_password_hash(password)
            cursor.execute(
                "UPDATE utilisateur SET Nom_user=%s, Email=%s, phone_user=%s, Role=%s, ActiviteClient=%s, PaysClient=%s, Mot_passe=%s WHERE Id_user=%s",
                (nom, email, telephone, role, activite, pays, hash_pwd, id)
            )
        else:
            cursor.execute(
                "UPDATE utilisateur SET Nom_user=%s, Email=%s, phone_user=%s, Role=%s, ActiviteClient=%s, PaysClient=%s WHERE Id_user=%s",
                (nom, email, telephone, role, activite, pays, id)
            )
        conn.commit()
        return jsonify({'message': 'Utilisateur modifié'})
    finally:
        cursor.close()
        conn.close()

# Supprimer un utilisateur
@utilisateur_bp.route('/api/utilisateur/<int:id>', methods=['DELETE'])
def delete_utilisateur(id):
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM utilisateur WHERE Id_user=%s", (id,))
        conn.commit()
        return jsonify({'message': 'Utilisateur supprimé'})
    finally:
        cursor.close()
        conn.close()

# Récupérer le profil d'un utilisateur
@utilisateur_bp.route('/api/utilisateur/profile/<int:id>', methods=['GET'])
def get_user_profile(id):
    conn = create_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion BDD'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                Id_user as id,
                Nom_user as nom,
                Email as email,
                phone_user as telephone,
                Role as role,
                ActiviteClient as activite,
                PaysClient as pays,
                Date_creation as dateCreation
            FROM utilisateur 
            WHERE Id_user = %s
        """, (id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        return jsonify(user)
    finally:
        cursor.close()
        conn.close()