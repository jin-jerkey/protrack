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
    
    user = Utilisateur.query.filter_by(Email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Identifiants invalides'}), 401
    
    access_token = create_access_token(identity={
        'id': user.Id_user,
        'role': user.Role,
        'email': user.Email
    })
    
    audit_log(user.Id_user, 'CONNEXION', f"Utilisateur connecté: {user.Email}")
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.Id_user,
            'nom': user.Nom_user,
            'email': user.Email,
            'role': user.Role
        }
    }), 200

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Vérifier si l'email existe déjà
    if Utilisateur.query.filter_by(Email=data['email']).first():
        return jsonify({'error': 'Email déjà utilisé'}), 400
    
    new_user = Utilisateur(
        Nom_user=data['nom'],
        Email=data['email'],
        phone_user=data.get('telephone'),
        Role='client',
        ActiviteClient=data.get('activite'),
        PaysClient=data.get('pays')
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    audit_log(new_user.Id_user, 'CREATION', f"Nouvel utilisateur: {new_user.Email}")
    
    return jsonify({'message': 'Compte créé avec succès'}), 201