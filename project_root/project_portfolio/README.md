# project_portfolio

## Install & Run
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python manage.py makemigrations portfolio
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Static:
- CSS: static/css/style.css
- Three.js: static/js/global_scene.js
- Tool icons: static/image/tools/<tool>.png
