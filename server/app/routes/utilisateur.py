from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Utilisateur
from app.utils import audit_log, role_required

bp = Blueprint('utilisateur', __name__, url_prefix='/api/utilisateur')

# Afficher tous les utilisateurs
@bp.route('/', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_utilisateurs():
    utilisateurs = Utilisateur.query.all()
    result = []
    for user in utilisateurs:
        result.append({
            'id': user.Id_user,
            'nom': user.Nom_user,
            'email': user.Email,
            'telephone': user.phone_user,
            'role': user.Role,
            'activite': user.ActiviteClient,
            'pays': user.PaysClient
        })
    return jsonify(result), 200

# Créer un utilisateur
@bp.route('/', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_utilisateur():
    try:
        data = request.get_json()
        
        # Validation des champs requis
        if not data or not data.get('nom') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Nom, email et mot de passe sont requis'}), 400
        
        # Vérifier si l'email existe déjà
        if Utilisateur.query.filter_by(Email=data['email']).first():
            return jsonify({'error': 'Email déjà utilisé'}), 400
        
        # Créer le nouvel utilisateur
        new_user = Utilisateur(
            Nom_user=data['nom'],
            Email=data['email'],
            phone_user=data.get('telephone'),
            Role=data.get('role', 'client'),  # Valeur par défaut
            ActiviteClient=data.get('activite'),
            PaysClient=data.get('pays')
        )
        
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        
        audit_log(get_jwt_identity()['id'], 'CREATION', f"Nouvel utilisateur: {new_user.Email}")
        return jsonify({'message': 'Utilisateur créé avec succès'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la création: {str(e)}'}), 500

# Modifier un utilisateur
@bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_utilisateur(user_id):
    try:
        user = Utilisateur.query.get_or_404(user_id)
        data = request.get_json()
        
        # Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
        if data.get('email') and data['email'] != user.Email:
            if Utilisateur.query.filter_by(Email=data['email']).first():
                return jsonify({'error': 'Email déjà utilisé'}), 400
        
        # Mise à jour des champs
        user.Nom_user = data.get('nom', user.Nom_user)
        user.Email = data.get('email', user.Email)
        user.phone_user = data.get('telephone', user.phone_user)
        user.Role = data.get('role', user.Role)
        user.ActiviteClient = data.get('activite', user.ActiviteClient)
        user.PaysClient = data.get('pays', user.PaysClient)
        
        if data.get('password'):
            user.set_password(data['password'])
        
        db.session.commit()
        audit_log(get_jwt_identity()['id'], 'MODIFICATION', f"Utilisateur modifié: {user.Email}")
        return jsonify({'message': 'Utilisateur modifié avec succès'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de la modification: {str(e)}'}), 500