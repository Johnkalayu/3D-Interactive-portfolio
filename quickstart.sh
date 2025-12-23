# Install dependencies
pip install Django>=4.2.0

# Create directory structure
mkdir -p portfolio/management/commands
mkdir -p static/img/{devops,tools}
mkdir -p portfolio_project

# Create __init__.py files
touch portfolio/__init__.py
touch portfolio/management/__init__.py
touch portfolio/management/commands/__init__.py
touch portfolio_project/__init__.py

# Setup database
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data

# Run server
python manage.py runserver