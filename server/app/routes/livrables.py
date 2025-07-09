from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from flask import current_app 
from app.models import Document, Projet, Notification
from app.utils import role_required, audit_log, allowed_file

bp = Blueprint('livrables', __name__, url_prefix='/api/livrables')

@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_livrable():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nom de fichier vide'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        data = request.form
        projet = Projet.query.get_or_404(data['projet_id'])
        current_user = get_jwt_identity()
        
        # Vérifier les permissions (admin seulement)
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Permission refusée'}), 403
        
        new_doc = Document(
            libelle=data.get('libelle', filename),
            chemin_fichier=filepath,
            type=file.mimetype,
            taille=os.path.getsize(filepath),
            projet_id=projet.id,
            utilisateur_id=current_user['id']
        )
        
        db.session.add(new_doc)
        
        # Créer une notification pour le client
        notification = Notification(
            type_notification='email',
            sujet='Nouveau livrable disponible',
            contenu=f"Un nouveau livrable est disponible pour le projet {projet.nom}",
            utilisateur_id=projet.client_id,
            projet_id=projet.id
        )
        db.session.add(notification)
        
        db.session.commit()
        
        audit_log(current_user['id'], 'UPLOAD', f"Livrable uploadé: {filename}")
        
        return jsonify({
            'message': 'Fichier uploadé avec succès',
            'document_id': new_doc.id
        }), 201
        
    return jsonify({'error': 'Type de fichier non autorisé'}), 400

@bp.route('/download/<int:doc_id>', methods=['GET'])
@jwt_required()
def download_livrable(doc_id):
    document = Document.query.get_or_404(doc_id)
    current_user = get_jwt_identity()
    projet = document.projet
    
    # Vérifier les permissions
    if current_user['role'] != 'admin' and projet.client_id != current_user['id']:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    audit_log(current_user['id'], 'DOWNLOAD', f"Téléchargement: {document.libelle}")
    
    return send_file(
        document.chemin_fichier,
        as_attachment=True,
        download_name=document.libelle
    )