echo "# protrack" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/jin-jerkey/protrack.git
git push -u origin main




or push an existing repository from the command line

git remote add origin https://github.com/jin-jerkey/protrack.git
git branch -M main
git push -u origin main



flask-backend/
├── app/
│   ├── __init__.py
│   ├── models.py
│   ├── routes/
│   │   ├── utilisateur.py
│   │   ├── projet.py
│   │   └── auth.py
│   └── utils.py
├── config.py
├── run.py
├── requirements.txt
├── .env
