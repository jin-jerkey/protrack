from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Utilisateur(db.Model):
    __tablename__ = 'utilisateur'
    Id_user = db.Column(db.Integer, primary_key=True)
    Nom_user = db.Column(db.String(100))
    Email = db.Column(db.String(150), unique=True)
    Mot_passe = db.Column(db.String(255))
    Role = db.Column(db.Enum('admin', 'client'))
    Date_creation = db.Column(db.DateTime)
    phone_user = db.Column(db.String(20))
    ActiviteClient = db.Column(db.String(150))
    PaysClient = db.Column(db.String(100))

    def set_password(self, password):
        self.Mot_passe = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.Mot_passe, password)

class Projet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_debut = db.Column(db.Date)
    date_fin_prevue = db.Column(db.Date)
    statut = db.Column(db.Enum('en_cours', 'termine', 'en_pause', name='statut_enum'), default='en_cours')
    avancement = db.Column(db.Integer, default=0)  # en pourcentage
    client_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=False)
    
    taches = db.relationship('Tache', backref='projet', lazy=True)
    documents = db.relationship('Document', backref='projet', lazy=True)
    messages = db.relationship('Message', backref='projet', lazy=True)

class Tache(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    intitule = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_debut_prevue = db.Column(db.Date)
    date_fin_prevue = db.Column(db.Date)
    date_fin_reelle = db.Column(db.Date)
    statut = db.Column(db.Enum('à_faire', 'en_cours', 'terminée', 'bloquée', name='statut_tache_enum'), default='à_faire')
    projet_id = db.Column(db.Integer, db.ForeignKey('projet.id'), nullable=False)

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    libelle = db.Column(db.String(150), nullable=False)
    date_partage = db.Column(db.DateTime, default=datetime.utcnow)
    chemin_fichier = db.Column(db.Text, nullable=False)
    taille = db.Column(db.BigInteger)
    type = db.Column(db.String(50))
    projet_id = db.Column(db.Integer, db.ForeignKey('projet.id'), nullable=False)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.Id_user'), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenu = db.Column(db.Text, nullable=False)
    date_message = db.Column(db.DateTime, default=datetime.utcnow)
    type = db.Column(db.Enum('commentaire', 'notification', 'message', name='type_message_enum'))
    projet_id = db.Column(db.Integer, db.ForeignKey('projet.id'), nullable=False)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.Id_user'), nullable=False)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type_notification = db.Column(db.Enum('email', 'portal', name='type_notification_enum'), nullable=False)
    date_envoi = db.Column(db.DateTime, default=datetime.utcnow)
    sujet = db.Column(db.String(255))
    contenu = db.Column(db.Text)
    lu = db.Column(db.Boolean, default=False)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.Id_user'), nullable=False)
    projet_id = db.Column(db.Integer, db.ForeignKey('projet.id'))

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)  # CREATE, UPDATE, DELETE
    table_affectee = db.Column(db.String(50), nullable=False)
    id_element = db.Column(db.Integer)
    details = db.Column(db.Text)
    date_action = db.Column(db.DateTime, default=datetime.utcnow)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.Id_user'), nullable=False)