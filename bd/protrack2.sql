-- Table UTILISATEUR
CREATE TABLE UTILISATEUR (
    Id_user INT PRIMARY KEY AUTO_INCREMENT,
    Nom_user VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Mot_passe VARCHAR(255) NOT NULL,
    Date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone_user VARCHAR(20),
    Role ENUM('admin', 'client') NOT NULL,  -- Retirer 'developpeur'
    -- Champs spécifiques clients
    ActiviteClient VARCHAR(150),
    PaysClient VARCHAR(100)
);

-- Table PROJET
CREATE TABLE PROJET (
    ID_projet INT PRIMARY KEY AUTO_INCREMENT,
    NomProjet VARCHAR(150) NOT NULL,
    Description TEXT,
    DateCreationProjet TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DateDebut DATE,
    DateFinPrevue DATE,
    Statut_projet ENUM('en_cours', 'termine', 'en_pause') DEFAULT 'en_cours',
    Avancement TINYINT UNSIGNED DEFAULT 0,  -- Ajout pour suivi en %
    IdClient INT NOT NULL,
    FOREIGN KEY (IdClient) REFERENCES UTILISATEUR(Id_user) ON DELETE CASCADE
);

-- Table TACHES
CREATE TABLE TACHES (
    IdTache INT PRIMARY KEY AUTO_INCREMENT,
    IntituleTache VARCHAR(150) NOT NULL,
    Description TEXT,
    DateCreationTache TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DateDebutPrevue DATE,
    DateFinPrevue DATE,
    DateFinReelle DATE,
    Statut ENUM('à_faire', 'en_cours', 'terminée', 'bloquée') DEFAULT 'à_faire',
    ID_projet INT NOT NULL,
    FOREIGN KEY (ID_projet) REFERENCES PROJET(ID_projet) ON DELETE CASCADE
);

-- Table DOCUMENT
CREATE TABLE DOCUMENT (
    IdDocument INT PRIMARY KEY AUTO_INCREMENT,
    LibelleDocument VARCHAR(150) NOT NULL,
    DatePartage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CheminFichier TEXT NOT NULL,
    Taille BIGINT,
    Type VARCHAR(50),
    ID_projet INT NOT NULL,
    Id_user INT NOT NULL,  -- Qui a uploadé
    FOREIGN KEY (ID_projet) REFERENCES PROJET(ID_projet) ON DELETE CASCADE,
    FOREIGN KEY (Id_user) REFERENCES UTILISATEUR(Id_user) ON DELETE CASCADE
);

-- Table MESSAGE
CREATE TABLE MESSAGE (
    IdMessage INT PRIMARY KEY AUTO_INCREMENT,
    Contenu TEXT NOT NULL,
    DateMessage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Type ENUM('commentaire', 'notification', 'message'),
    ID_projet INT NOT NULL,
    Id_user INT NOT NULL,  -- Auteur
    FOREIGN KEY (ID_projet) REFERENCES PROJET(ID_projet) ON DELETE CASCADE,
    FOREIGN KEY (Id_user) REFERENCES UTILISATEUR(Id_user) ON DELETE CASCADE
);

-- Table NOTIFICATION
CREATE TABLE NOTIFICATION (
    IDNotif INT PRIMARY KEY AUTO_INCREMENT,
    Type ENUM('email', 'portal') NOT NULL,  -- Canal de notification
    Date_envoie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Sujet VARCHAR(255),
    Contenu TEXT,
    Lu BOOLEAN DEFAULT FALSE,
    Id_user INT NOT NULL,
    ID_projet INT,
    FOREIGN KEY (Id_user) REFERENCES UTILISATEUR(Id_user) ON DELETE CASCADE,
    FOREIGN KEY (ID_projet) REFERENCES PROJET(ID_projet) ON DELETE SET NULL
);

-- Table AUDIT_LOG
CREATE TABLE AUDIT_LOG (
    IdLog INT PRIMARY KEY AUTO_INCREMENT,
    ActionType VARCHAR(50) NOT NULL,  -- CREATE, UPDATE, DELETE
    TableAffectee VARCHAR(50) NOT NULL,  -- PROJET, DOCUMENT, etc.
    IdElement INT,
    Details TEXT,
    DateAction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Id_user INT NOT NULL,
    FOREIGN KEY (Id_user) REFERENCES UTILISATEUR(Id_user) ON DELETE CASCADE
);