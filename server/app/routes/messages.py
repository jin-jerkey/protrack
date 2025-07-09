from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Message, Projet, Notification
from app.utils import role_required, audit_log

bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@bp.route('/projet/<int:projet_id>', methods=['GET'])
@jwt_required()
def get_messages(projet_id):
    projet = Projet.query.get_or_404(projet_id)
    current_user = get_jwt_identity()
    
    # Vérifier les permissions
    if current_user['role'] != 'admin' and projet.client_id != current_user['id']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    messages = Message.query.filter_by(projet_id=projet_id).order_by(Message.date_message.desc()).all()
    
    return jsonify([{
        'id': m.id,
        'contenu': m.contenu,
        'date_message': m.date_message.isoformat(),
        'auteur': m.auteur.nom,
        'type': m.type
    } for m in messages]), 200

@bp.route('/', methods=['POST'])
@jwt_required()
def send_message():
    data = request.get_json()
    current_user = get_jwt_identity()
    projet = Projet.query.get_or_404(data['projet_id'])
    
    # Vérifier les permissions
    if current_user['role'] != 'admin' and projet.client_id != current_user['id']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    new_message = Message(
        contenu=data['contenu'],
        type='message',
        projet_id=data['projet_id'],
        utilisateur_id=current_user['id']
    )
    
    db.session.add(new_message)
    
    # Créer une notification
    destinataire_id = projet.client_id if current_user['role'] == 'admin' else None
    if destinataire_id:
        notification = Notification(
            type_notification='portal',
            sujet='Nouveau message',
            contenu=f"Nouveau message dans le projet {projet.nom}",
            utilisateur_id=destinataire_id,
            projet_id=projet.id
        )
        db.session.add(notification)
    
    db.session.commit()
    
    audit_log(current_user['id'], 'MESSAGE', f"Message envoyé sur le projet {projet.nom}")
    
    return jsonify({'message': 'Message envoyé avec succès'}), 201