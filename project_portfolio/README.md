# Joni K Portfolio

A modern, interactive portfolio website built with Django, featuring a stunning 3D DevOps tools visualization, glassmorphism UI design, and smooth animations.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2-green.svg)
![Three.js](https://img.shields.io/badge/Three.js-r128-black.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

### Interactive 3D Skills Visualization
- Rotating 3D spheres displaying DevOps tools and technologies
- Hover effects with tool information tooltips
- Built with Three.js for smooth WebGL rendering

### Glassmorphism Design
- Modern glass-effect UI components
- Backdrop blur and transparency effects
- Smooth hover animations with white glow effects

### Interactive Project Modal
- Click project cards to open detailed glass modal
- Project images with zoom functionality
- Technology tags grouped by Frontend/Backend/DevOps
- GitHub and live site links
- Smooth fade + slide animations
- Close with X button, click outside, or ESC key

### Additional Features
- Responsive design for all devices
- Dark theme with animated star background
- Contact form with email notifications
- Blog section with markdown support
- Resume/CV page with work experience and certifications
- Testimonials carousel
- Project filtering by category and technology

## Tech Stack

### Backend
- **Python 3.9+**
- **Django 4.2** - Web framework
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **Gunicorn** - WSGI HTTP Server
- **WhiteNoise** - Static file serving

### Frontend
- **HTML5/CSS3** - Semantic markup and styling
- **JavaScript (ES6+)** - Interactive functionality
- **Three.js** - 3D graphics and animations
- **Glassmorphism** - Modern UI design pattern

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD (optional)
- **Nginx** - Reverse proxy (production)

## Project Structure

```
project_portfolio/
├── portfolio/              # Main Django app
│   ├── models.py          # Database models
│   ├── views.py           # View functions
│   ├── urls.py            # URL routing
│   └── admin.py           # Admin configuration
├── project_portfolio/      # Django project settings
│   ├── settings.py        # Configuration
│   ├── urls.py            # Root URL config
│   └── wsgi.py            # WSGI application
├── templates/              # HTML templates
│   ├── base.html          # Base template
│   ├── home.html          # Homepage
│   ├── projects.html      # Projects page
│   ├── blog/              # Blog templates
│   └── resume.html        # Resume page
├── static/                 # Static assets
│   ├── css/style.css      # Main stylesheet
│   ├── js/                # JavaScript files
│   │   ├── stars.js       # Star background
│   │   └── devops_scene.js # 3D visualization
│   └── image/             # Images and icons
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── .env.example           # Environment template
└── manage.py              # Django CLI
```

## Installation

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- PostgreSQL (for production) or SQLite (for development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Johnkalayu/project_portfolio.git
   cd project_portfolio
   ```

2. **Create virtual environment**
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

8. **Run development server**
   ```bash
   python manage.py runserver
   ```

9. **Open in browser**
   ```
   http://127.0.0.1:8000/
   ```

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t portfolio .
   ```

2. **Run the container**
   ```bash
   docker run -d -p 8000:8000 \
     -e DEBUG=False \
     -e DJANGO_SECRET_KEY=your-secret-key \
     -e ALLOWED_HOSTS=yourdomain.com \
     portfolio
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `True` |
| `DJANGO_SECRET_KEY` | Django secret key | (required) |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `POSTGRES_NAME` | Database name | - |
| `POSTGRES_USER` | Database user | - |
| `POSTGRES_PASSWORD` | Database password | - |
| `POSTGRES_HOST` | Database host | `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `EMAIL_HOST_USER` | SMTP email | - |
| `EMAIL_HOST_PASSWORD` | SMTP password | - |

## Usage

### Admin Panel
Access the Django admin at `/admin/` to manage:
- Projects and categories
- Blog articles and tags
- Work experience and education
- Certifications
- Testimonials
- Site settings

### Adding Projects
1. Log in to admin panel
2. Go to Projects > Add Project
3. Fill in title, description, and URLs
4. Add technologies (create new ones if needed)
5. Upload project image
6. Save

### Writing Blog Posts
1. Go to Articles > Add Article
2. Write content in Markdown format
3. Add tags and featured image
4. Set status to "Published"
5. Save

## Customization

### Changing Colors
Edit `static/css/style.css`:
- Primary accent: `#8b5cf6` (purple)
- Background: Dark gradient
- Glass effects: `rgba(0, 0, 0, 0.65)` with blur

### Modifying 3D Scene
Edit `static/js/devops_scene.js` to:
- Change tool icons and colors
- Adjust rotation speed
- Modify sphere sizes and positions

### Adding New Sections
1. Create template in `templates/`
2. Add view in `portfolio/views.py`
3. Add URL in `portfolio/urls.py`
4. Style in `static/css/style.css`

## Production Deployment

### Security Checklist
- [ ] Set `DEBUG=False`
- [ ] Generate secure `DJANGO_SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up HTTPS with SSL certificate
- [ ] Configure `CSRF_TRUSTED_ORIGINS`
- [ ] Use environment variables for secrets
- [ ] Enable security middleware (already configured)

### Performance
- WhiteNoise for static file compression
- Database connection pooling
- Gunicorn with multiple workers

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Joni Kalayu**
- LinkedIn: [linkedin.com/in/joni-kalayu](https://www.linkedin.com/in/joni-kalayu/)
- GitHub: [github.com/Johnkalayu](https://github.com/Johnkalayu)
- Email: johngezae@yahoo.com

## Acknowledgments

- [Three.js](https://threejs.org/) for 3D graphics
- [Django](https://www.djangoproject.com/) for the web framework
- [Font Awesome](https://fontawesome.com/) for icons
- Glassmorphism design inspiration from various UI/UX designers
