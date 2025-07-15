from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Projet, Tache, AuditLog
from app.utils import role_required, audit_log

bp = Blueprint('projets', __name__, url_prefix='/api/projets')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_projets():
    current_user = get_jwt_identity()
    
    if current_user['role'] == 'admin':
        projets = Projet.query.all()
    else:
        projets = Projet.query.filter_by(client_id=current_user['id']).all()
    
    return jsonify([{
        'id': p.id,
        'nom': p.nom,
        'statut': p.statut,
        'avancement': p.avancement,
        'date_creation': p.date_creation.isoformat(),
        'client_id': p.client_id
    } for p in projets]), 200

@bp.route('/<int:projet_id>', methods=['GET'])
@jwt_required()
def get_projet_details(projet_id):
    projet = Projet.query.get_or_404(projet_id)
    current_user = get_jwt_identity()
    
    # Vérifier les permissions
    if current_user['role'] != 'admin' and projet.client_id != current_user['id']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    taches = [{
        'id': t.id,
        'intitule': t.intitule,
        'statut': t.statut,
        'date_fin_prevue': t.date_fin_prevue.isoformat() if t.date_fin_prevue else None
    } for t in projet.taches]
    
    return jsonify({
        'projet': {
            'id': projet.id,
            'nom': projet.nom,
            'description': projet.description,
            'statut': projet.statut,
            'avancement': projet.avancement,
            'date_debut': projet.date_debut.isoformat() if projet.date_debut else None,
            'date_fin_prevue': projet.date_fin_prevue.isoformat() if projet.date_fin_prevue else None
        },
        'taches': taches
    }), 200

@bp.route('/', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_projet():
    data = request.get_json()
    current_user = get_jwt_identity()
    
    new_projet = Projet(
        nom=data['nom'],
        description=data.get('description'),
        client_id=data['client_id'],
        date_debut=data.get('date_debut'),
        date_fin_prevue=data.get('date_fin_prevue')
    )
    
    db.session.add(new_projet)
    db.session.commit()
    
    audit_log(current_user['id'], 'CREATION', f"Projet créé: {new_projet.nom}")
    
    return jsonify({
        'message': 'Projet créé avec succès',
        'projet_id': new_projet.id
    }), 201