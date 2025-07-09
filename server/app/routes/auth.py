from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from app import db
from app.models import Utilisateur
from app.utils import audit_log

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = Utilisateur.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.mot_de_passe, password):
        return jsonify({'error': 'Identifiants invalides'}), 401
    
    # Création du token JWT
    access_token = create_access_token(identity={
        'id': user.id,
        'role': user.role,
        'email': user.email
    })
    
    audit_log(user.id, 'CONNEXION', f"Utilisateur connecté: {user.email}")
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'nom': user.nom,
            'email': user.email,
            'role': user.role
        }
    }), 200

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Vérifier si l'email existe déjà
    if Utilisateur.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email déjà utilisé'}), 400
    
    new_user = Utilisateur(
        nom=data['nom'],
        email=data['email'],
        telephone=data.get('telephone'),
        role='client',
        activite=data.get('activite'),
        pays=data.get('pays')
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    audit_log(new_user.id, 'CREATION', f"Nouvel utilisateur: {new_user.email}")
    
    return jsonify({'message': 'Compte créé avec succès'}), 201