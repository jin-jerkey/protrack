from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from app.models import AuditLog, db

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != role:
                return jsonify({'error': 'Permission refusée'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def audit_log(user_id, action_type, details):
    try:
        new_log = AuditLog(
            action=action_type,
            table_affectee='',
            details=details,
            utilisateur_id=user_id
        )
        db.session.add(new_log)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Erreur d'audit: {str(e)}")