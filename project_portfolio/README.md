# Personal Portfolio Website

A production-ready Django portfolio website with a continuous Three.js background scene featuring an interactive orbiting tools visualization.

## Features

- **Full 3D Interactive Experience**: Rotating 3D cubes with tool icons orbit in an infinity (∞) shape
- **Advanced Lighting**: Point lights and ambient lighting create depth and atmosphere
- **Hover & Scale Effects**: 3D cubes smoothly scale to 1.8x with glowing edges on hover
- **Click to View Projects**: Click any orbiting tool to see related projects in a modal
- **Global Interactions**: 3D interactions work everywhere on the page - not limited to one section
- **Animated Wireframe Globe**: Central rotating icosahedron with inner glow sphere
- **Responsive Design**: Fully responsive with mobile hamburger menu
- **PostgreSQL Database**: Stores tools, projects, and contact form submissions
- **Production Ready**: WhiteNoise for static files, environment-based configuration
- **Auto-seed Command**: Populate database with DevOps tools and sample projects

## Tech Stack

- **Backend**: Python 3, Django 4.2
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **3D Graphics**: Three.js r128
- **Static Files**: WhiteNoise

## Project Structure

```
project_root/
  project_portfolio/
    project_portfolio/       # Main Django project
      settings.py
      urls.py
      wsgi.py
    portfolio/              # Main app
      models.py
      views.py
      admin.py
      urls.py
      forms.py
    templates/              # HTML templates
      base.html
      home.html
    static/                 # Static assets
      css/
        style.css
      js/
        global_scene.js
        stars.js
      image/
        tools/              # Tool icon PNGs
          aws.png
          terraform.png
          docker.png
    manage.py
    requirements.txt
```

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip

### 1. Clone and Setup

```bash
cd project_portfolio
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. PostgreSQL Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'your_password';
ALTER ROLE portfolio_user SET client_encoding TO 'utf8';
ALTER ROLE portfolio_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE portfolio_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=portfolio_db
DB_USER=portfolio_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Add Tool Icons

**IMPORTANT**: Place PNG icons in `static/image/tools/` directory with lowercase filenames matching tool names exactly.

Required icon files:
```
static/image/tools/aws.png
static/image/tools/docker.png
static/image/tools/kubernetes.png
static/image/tools/terraform.png
static/image/tools/jenkins.png
static/image/tools/gitlab.png
static/image/tools/ansible.png
static/image/tools/prometheus.png
static/image/tools/grafana.png
static/image/tools/python.png
static/image/tools/django.png
static/image/tools/postgresql.png
static/image/tools/redis.png
static/image/tools/nginx.png
static/image/tools/react.png
```

**Icon specifications**:
- Format: PNG with transparent background
- Size: 256x256px or 512x512px recommended
- Download from: [Simple Icons](https://simpleicons.org/) or [DevIcon](https://devicon.dev/)

See `ICON_SETUP.md` for detailed instructions.

### 7. Seed Database with DevOps Tools

Run the custom management command to populate the database:

```bash
python manage.py seed_tools
```

This creates:
- 15 DevOps/development tools with categories and descriptions
- 5 sample projects linked to relevant tools

Alternatively, you can manually add data via the admin panel.

Run the development server:

```bash
python manage.py runserver
```

Visit `http://localhost:8000/admin` and add:
- **Tools**: Name, category, description, icon path (e.g., `image/tools/aws.png`)
- **Projects**: Title, description, link, and associate with tools

### 9. Collect Static Files (Production)

```bash
python manage.py collectstatic --noinput
```

## Usage

### Development

```bash
python manage.py runserver
```

Visit `http://localhost:8000`

### Admin Panel

`http://localhost:8000/admin`

Manage:
- Tools (name, category, description, icon)
- Projects (title, description, tools used)
- Contact submissions

## API Endpoints

### Get Projects by Tool

```
GET /api/projects/?tool=<tool_name>
```

Response:
```json
{
  "tool": "AWS",
  "projects": [
    {
      "id": 1,
      "title": "Cloud Infrastructure",
      "description": "...",
      "link": "https://...",
      "tools": ["AWS", "Terraform"]
    }
  ]
}
```

## Customization

### Update Personal Info

Edit `templates/home.html`:
- Hero section: Your name and title
- About section: Your description
- Projects section: Featured projects

### Styling

Modify `static/css/style.css`:
- CSS variables in `:root`
- Section layouts
- Color schemes

### 3D Scene

Adjust `static/js/global_scene.js`:
- Globe size and appearance (icosahedron vs sphere)
- Infinity orbit radius and shape parameters (currently 6 units)
- 3D cube size (currently 1.2x1.2x1.2)
- Tool rotation speeds (X, Y, Z axes)
- Hover scale factor (default: 1.8x)
- Lighting positions and intensities
- Edge glow opacity and animation speed

## Deployment

### Environment Setup

1. Set production environment variables:
```env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECRET_KEY=<generate-strong-key>
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Collect static files:
```bash
python manage.py collectstatic --noinput
```

### WSGI Server

Use Gunicorn for production:

```bash
pip install gunicorn
gunicorn project_portfolio.wsgi:application --bind 0.0.0.0:8000
```

### Nginx Configuration

Example Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /static/ {
        alias /path/to/project/staticfiles/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Performance Optimization

- Texture caching for tool icons
- Pixel ratio capped at 2
- Delta time clamping for smooth animation
- Reduced geometry segments for performance
- WhiteNoise compression for static files

## Features Breakdown

### Full 3D Interactive Experience

- **3D Rotating Cubes**: Each tool is represented by a textured 3D cube (not flat sprites)
- **Infinity Path (∞)**: Tools follow a mathematical lemniscate curve in 3D space
- **Multi-axis Rotation**: Each cube rotates independently on X, Y, and Z axes
- **Edge Glow Effect**: Hovering activates animated glowing edges on cubes
- **Smooth Animations**: Delta-time based for consistent speed across devices
- **Scale on Hover**: Cubes smoothly scale to 1.8x when hovered
- **Performance Optimized**: Texture caching, clamped delta time, efficient geometry

### Lighting System

- **Ambient Light**: Base illumination (60% intensity)
- **Point Light 1**: Primary purple light (100% intensity) from top-right
- **Point Light 2**: Secondary violet light (80% intensity) from bottom-left
- **Creates depth**: Realistic shadows and highlights on 3D cubes

### Central Globe Animation

- **Icosahedron Geometry**: Low-poly wireframe sphere
- **Dual Rotation**: Rotates on both Y and X axes
- **Inner Glow Sphere**: Pulsating glow effect inside the globe
- **Orbit Line**: Animated infinity path visualization

### Interactive Features (Works Everywhere)

- Tool cubes orbit continuously in 3D space
- **Hover**: Shows detailed tooltip with tool info (works on entire page)
- **Scale Effect**: Hovered cube grows smoothly to 1.8x size with glowing edges
- **Click**: Opens modal displaying all projects using that tool
- **Smooth Cursor**: Pointer cursor appears when hovering over tools
- **No Section Limits**: Interactions work anywhere, not just in Skills section

### Database Models

- **Tool**: name, category, description, icon_path
- **Project**: title, description, link, many-to-many tools
- **Contact**: name, email, message, timestamp

## Troubleshooting

### Static files not loading

```bash
python manage.py collectstatic --noinput
```

### Database connection errors

Check `.env` file and PostgreSQL service status

### Three.js not rendering

Check browser console for errors and ensure CDN is accessible

### Icons not appearing

Verify icon files exist in `static/image/tools/` with correct filenames

## License

MIT License - Feel free to use for your own portfolio!