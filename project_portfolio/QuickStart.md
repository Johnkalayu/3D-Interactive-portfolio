# Quick Start Guide

Get your portfolio running in 5 minutes!

## Prerequisites Checklist

- [ ] Python 3.8+ installed
- [ ] PostgreSQL installed and running
- [ ] Virtual environment activated

## Step-by-Step Setup

### 1. Install Dependencies (1 min)

```bash
cd project_portfolio
pip install -r requirements.txt
```

### 2. Setup PostgreSQL (2 min)

```bash
# Login to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
\q
```

### 3. Configure Environment (30 sec)

Create `.env` file:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=portfolio_db
DB_USER=portfolio_user
DB_PASSWORD=mypassword
DB_HOST=localhost
DB_PORT=5432
```

### 4. Setup Django (1 min)

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5. Download Icons (Manual - 5 min)

Visit [Simple Icons](https://simpleicons.org/) and download PNG logos for:

- AWS, Docker, Kubernetes, Terraform, Jenkins
- GitLab, Ansible, Prometheus, Grafana
- Python, Django, PostgreSQL, Redis, Nginx, React

**Save them as**: `static/image/tools/<toolname>.png` (lowercase!)

Example: `static/image/tools/aws.png`

### 6. Seed Database (30 sec)

```bash
python manage.py seed_tools
```

This creates 15 tools and 5 sample projects!

### 7. Run the Server (10 sec)

```bash
python manage.py runserver
```

Visit: `http://localhost:8000`

## What You'll See

### Hero Section
- Your name and title
- Call-to-action buttons

### About Section
- Brief introduction
- Background information

### Skills Section ⭐
- **3D Infinity Orbit Animation**: Tools orbiting in ∞ shape
- **Hover Effect**: Icons scale up when you hover over them
- **Click to View**: Click any tool to see related projects
- Skill cards grid below

### Projects Section
- Featured projects showcase
- Sample projects with tech tags

### Contact Section
- Contact form (saves to database)
- Success messages

## Interactive Features

### 3D Animation Controls

**In Skills Section:**
- Move mouse to hover over orbiting tools
- Hover → Tool scales to 1.5x + tooltip appears
- Click → Modal opens showing related projects
- ESC or X → Close modal

**Outside Skills Section:**
- Animation continues but interactions are disabled
- This prevents accidental clicks while scrolling

## Customization Quick Tips

### Update Personal Info

Edit `templates/home.html`:
- Line 8: Your name
- Line 9: Your title/roles
- Lines 16-23: About section

### Change Colors

Edit `static/css/style.css`:
```css
:root {
    --primary: #6366f1;      /* Main brand color */
    --secondary: #8b5cf6;    /* Accent color */
    --text: #e5e7eb;         /* Text color */
}
```

### Adjust 3D Settings

Edit `static/js/global_scene.js`:
```javascript
const orbitRadius = 5;           // Size of infinity orbit
orbiter.targetScale = 1.5;       // Hover scale effect
orbiter.speed = 0.15;            // Orbit speed
```

## Admin Panel

Visit: `http://localhost:8000/admin`

### Add New Tool
1. Go to Tools → Add Tool
2. Fill in: name, category, description
3. Icon path: `image/tools/toolname.png`
4. Save

### Add New Project
1. Go to Projects → Add Project
2. Fill in: title, description, link
3. Select related tools (hold Ctrl/Cmd)
4. Save

### View Contact Submissions
1. Go to Contacts
2. See all form submissions with timestamps

## Troubleshooting

### Icons not showing?
```bash
# Check if files exist
ls -la static/image/tools/

# Verify filenames are lowercase
# Example: aws.png, docker.png (NOT AWS.png)
```

### Database errors?
```bash
# Check PostgreSQL is running
psql -l

# Verify .env credentials match database
cat .env
```

### Static files not loading?
```bash
# Collect static files
python manage.py collectstatic --noinput

# Clear browser cache
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

### Three.js not rendering?
- Open browser console (F12)
- Check for JavaScript errors
- Verify Three.js CDN is accessible
- Check if icons exist in correct path

## Next Steps

### Deployment
- Follow deployment section in README.md
- Use Gunicorn for WSGI server
- Configure Nginx as reverse proxy
- Enable HTTPS with Let's Encrypt

### Content
- Replace placeholder text with your info
- Add real project screenshots
- Update contact information
- Add social media links

### Enhancement Ideas
- Add more tools to the orbit
- Create project detail pages
- Add blog section
- Implement project filtering
- Add animations to project cards

## Support

### Documentation
- `README.md` - Complete setup guide
- `ICON_SETUP.md` - Icon requirements
- Django docs: https://docs.djangoproject.com/

### Resources
- Three.js docs: https://threejs.org/docs/
- PostgreSQL docs: https://www.postgresql.org/docs/
- Simple Icons: https://simpleicons.org/

## Summary

You should now have:
- ✅ Working Django server on port 8000
- ✅ PostgreSQL database with seeded data
- ✅ 3D infinity orbit animation with 15 tools
- ✅ Interactive hover and click effects
- ✅ Admin panel for content management
- ✅ Contact form saving to database

Enjoy your new portfolio! 🚀