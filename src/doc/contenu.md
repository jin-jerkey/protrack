Voici un résumé des contenus attendus pour chaque page principale du projet, selon le fichier plan.md :

1. Page de Login / Authentification
- Formulaire de connexion sécurisé (email + mot de passe)
- Sélection du rôle (client ou admin)
- Message d’erreur en cas d’identifiants invalides
- Lien vers la page d’inscription

2. Page d’Inscription (Register)
- Formulaire de création de compte client (nom, email, mot de passe, téléphone, activité, pays)
- Message de succès ou d’erreur
- Lien vers la page de connexion

3. Tableau de bord Client (/client/dashboard)
- Liste des projets du client
- Avancement de chaque projet (en % ou étapes)
- Derniers livrables disponibles (téléchargeables)
- Notifications récentes
- Accès à la messagerie projet

4. Détail d’un projet Client (/client/projets/[id])
- Description du projet
- Échéances et statut (En cours / En pause / Terminé)
- Liste des livrables téléchargeables
- Historique des étapes livrées
- Messagerie ou commentaires liés au projet

5. Tableau de bord Administrateur (/admi/dashboard)
- Vue globale : nombre total de clients, nombre de projets (par statut), alertes ou retards
- Statistiques et rapports de suivi
- Notifications importantes

6. Gestion des clients (Admin) (/admi/clients)
- Liste des clients
- Ajout, modification, suppression de clients

7. Gestion des projets (Admin) (/admi/projets)
- Liste de tous les projets
- Création et affectation de projets à un client
- Définition des étapes et échéances
- Téléversement de livrables

8. Messagerie projet
- Espace d’échange de messages entre client et équipe projet
- Historique des échanges

9. Notifications
- Liste des notifications (portail ou email)
- Alertes sur les retards, nouveaux livrables, nouveaux messages

10. Statistiques et rapports (Admin)
- Graphiques et indicateurs sur l’avancement des projets, clients actifs, etc.

Fonctions transversales
- Journalisation des actions importantes (audit log)
- Interface responsive (adaptée mobile et desktop)
- Gestion des rôles et permissions (accès restreint selon profil)
- Sauvegarde automatique de la base de données

Chaque page doit respecter le thème visuel (rouge foncé, design moderne, navigation claire) et afficher les informations selon le rôle de l’utilisateur connecté.