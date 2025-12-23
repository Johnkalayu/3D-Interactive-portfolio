<<<<<<< HEAD
# 3D-Interactive-portfolio
=======
Django 3D DevOps Portfolio
A production-ready Django portfolio website featuring a single global Three.js scene for interactive 3D visualization of DevOps tools and skills.
Features

Single Global Three.js Scene: One renderer and scene shared across multiple sections using viewport masking
Interactive Skills Section: Hover over DevOps tools to see details, click to view related projects
Glassmorphism UI: Modern dark theme with glass-effect panels
Animated Star Background: Subtle parallax star field
Django Backend: Server-rendered templates with SQLite database
RESTful API: Fetch projects by tool dynamically
Contact Form: Working contact submission with Django forms

Project Structure
project_root/
├── manage.py
├── requirements.txt
├── portfolio_project/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── portfolio/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── api.py
│   ├── admin.py
│   └── management/
│       └── commands/
│           └── seed_data.py
├── templates/
│   ├── base.html
│   └── home.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
    |    ├── global_scene.js
    |    └── stars.js
    |__ img/
         |-- devops/
         |       |__ devops_infinty.png
         |__ tools/
               |   
Installation
1. Create Virtual Environment
bashpython -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
2. Install Dependencies
bashpip install -r requirements.txt
3. Create Required Directories
bashmkdir -p portfolio/management/commands
mkdir -p static/img/devops
mkdir -p static/img/tools
mkdir -p portfolio_project
4. Create Empty init.py Files
bashtouch portfolio/__init__.py
touch portfolio/management/__init__.py
touch portfolio/management/commands/__init__.py
touch portfolio_project/__init__.py
5. Run Migrations
bashpython manage.py makemigrations
python manage.py migrate
6. Create Superuser
bashpython manage.py createsuperuser
7. Seed Database
bashpython manage.py seed_data
8. Add Tool Icons (Optional)
Place PNG icons in static/img/tools/ named exactly as the tool names in lowercase:

ansible.png
aws.png
azure.png
bash.png
etc.

If icons are missing, colored placeholders will be used.
9. Run Development Server
bashpython manage.py runserver
Visit http://127.0.0.1:8000 to see your portfolio.
Usage
Admin Panel
Access the Django admin at http://127.0.0.1:8000/admin/ to:

Add/edit DevOps tools
Create/manage projects
View contact form submissions

API Endpoint
Get projects by tool:
GET /api/projects/?tool=Kubernetes
Returns JSON with tool info and related projects.
Customization
Change Colors
Edit CSS variables in static/css/style.css:
css:root {
    --purple-1: #8b5cf6;
    --purple-2: #6d28d9;
    /* etc. */
}
Add More Tools

Add tool via Django admin
Place icon in static/img/tools/
Refresh page

Modify 3D Animation
Edit static/js/global_scene.js:

Change orbit radius: const radius = 3.5;
Adjust rotation speed: const angle = tool.userData.angle + time * 0.3;
Modify hover scale: this.hoveredTool.scale.set(1.5, 1.5, 1);

Production Deployment
1. Update Settings
In portfolio_project/settings.py:
pythonDEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
SECRET_KEY = 'your-production-secret-key'
2. Collect Static Files
bashpython manage.py collectstatic
3. Use Production Database
Replace SQLite with PostgreSQL or MySQL for production.
4. Configure Web Server
Use Gunicorn + Nginx:
bashpip install gunicorn
gunicorn portfolio_project.wsgi:application --bind 0.0.0.0:8000
Key Technologies

Backend: Django 4.2+
Frontend: HTML, CSS, JavaScript
3D Engine: Three.js r128
Database: SQLite (dev) / PostgreSQL (prod)

Architecture Highlights
Global Scene System
The GlobalScene class creates ONE Three.js renderer and scene:
javascriptclass GlobalScene {
    constructor() {
        // Single canvas for entire page
        this.canvas = document.getElementById('global-canvas');
        this.renderer = new THREE.WebGLRenderer({...});
        this.scene = new THREE.Scene();
        
        // Multiple containers register for rendering
        this.containers = [];
    }
    
    registerContainer(id, interactive, speed) {
        // Each section gets a viewport slice
    }
    
    animate() {
        // Render scene into each container using scissor test
        this.containers.forEach(container => {
            this.renderer.setViewport(...);
            this.renderer.setScissor(...);
            this.renderer.render(this.scene, this.camera);
        });
    }
}
Interaction Flow

User hovers over tool in Skills section
Raycaster detects intersection
Tool scales up, glow appears
Sidebar updates with tool info
User clicks tool
Django API fetches related projects
Modal displays project details

License
MIT License - feel free to use for your own portfolio!
Credits
Built with Django and Three.js for DevOps engineers who want to showcase their skills with style.
>>>>>>> b2b14d8 (made some changes)
