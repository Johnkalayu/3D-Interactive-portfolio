"""
Management command to create a blog post about the portfolio project.
Run with: python manage.py create_portfolio_blog
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from portfolio.models import Article, Tag


class Command(BaseCommand):
    help = 'Creates a blog post about building the portfolio website'

    def handle(self, *args, **options):
        # Create tags
        tags_data = ['Django', 'Python', 'Three.js', 'DevOps', 'Portfolio', 'Web Development']
        tags = []
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(
                name=tag_name,
                defaults={'slug': tag_name.lower().replace(' ', '-').replace('.', '')}
            )
            tags.append(tag)
            if created:
                self.stdout.write(f'Created tag: {tag_name}')

        # Blog post content
        content = """
## Introduction

Building a personal portfolio website is one of the most rewarding projects for any developer. It's not just a showcase of your work—it's a reflection of your skills, creativity, and attention to detail. In this post, I'll walk you through how I built my DevOps portfolio website using Django, Three.js, and modern CSS techniques.

## The Vision

I wanted to create something that stood out from typical portfolio templates. My goals were:

- **Interactive 3D visualization** of my DevOps skills
- **Modern glassmorphism design** with smooth animations
- **Fast and responsive** across all devices
- **Easy to maintain** with a Django admin panel

## Tech Stack Choices

### Backend: Django

Django was the obvious choice for several reasons:

1. **Rapid development** - Django's "batteries included" philosophy meant I could focus on features
2. **Admin panel** - Built-in admin for managing projects and blog posts
3. **Security** - Production-ready security features out of the box
4. **Scalability** - Easy to deploy with Gunicorn and PostgreSQL

### Frontend: Three.js + Glassmorphism

For the frontend, I combined:

- **Three.js** for the 3D rotating spheres displaying DevOps tools
- **CSS glassmorphism** for modern, translucent UI components
- **Vanilla JavaScript** for interactivity without framework overhead

## Key Features

### 1. 3D DevOps Tools Visualization

The centerpiece of the portfolio is an interactive 3D scene built with Three.js. Each sphere represents a tool I work with:

```javascript
// Creating a tool sphere
const geometry = new THREE.SphereGeometry(0.5, 32, 32);
const material = new THREE.MeshPhongMaterial({
    color: tool.color,
    transparent: true,
    opacity: 0.9
});
const sphere = new THREE.Mesh(geometry, material);
```

The spheres orbit around a central point, and hovering reveals tool information with a smooth tooltip animation.

### 2. Glass Modal for Projects

When you click on a project card, a beautiful glass modal opens with:

- Project screenshot with zoom capability
- Technology tags grouped by category
- Full description
- Links to live site and GitHub

The modal features smooth fade + slide animations and can be closed via X button, clicking outside, or pressing ESC.

### 3. Responsive Design

Every component is fully responsive:

```css
@media (max-width: 768px) {
    .project-modal {
        max-height: 100vh;
        border-radius: 0;
    }

    .tech-categories {
        flex-direction: column;
    }
}
```

## The Glassmorphism Effect

The glass effect is achieved through a combination of CSS properties:

```css
.glass-container {
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
}
```

On hover, elements get a beautiful white glow:

```css
.project-card:hover {
    box-shadow:
        0 0 20px rgba(255, 255, 255, 0.6),
        0 0 60px rgba(255, 255, 255, 0.35),
        0 0 120px rgba(139, 92, 246, 0.25);
}
```

## Deployment

The portfolio is containerized with Docker for easy deployment:

```dockerfile
FROM python:3.14-slim AS builder
WORKDIR /portfolio/app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.14-slim AS final
COPY --from=builder /usr/local/lib/python3.14/site-packages ...
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "project_portfolio.wsgi:application"]
```

Production security settings are automatically enabled when `DEBUG=False`:

- HTTPS redirect
- Secure cookies
- HSTS headers
- Content security policies

## Lessons Learned

1. **Start with mobile** - Designing mobile-first saved countless hours of responsive fixes
2. **Performance matters** - Three.js can be heavy; optimize geometry and limit particle counts
3. **Accessibility** - Don't forget keyboard navigation and screen reader support
4. **Keep it simple** - Resist the urge to over-engineer; users want to see your work, not wait for animations

## What's Next

Future improvements I'm planning:

- **Dark/Light theme toggle**
- **Blog search and filtering**
- **Project case studies** with detailed breakdowns
- **Performance metrics dashboard**

## Conclusion

Building this portfolio was an incredible learning experience. It pushed me to combine backend development, 3D graphics, and modern CSS into a cohesive, professional website.

If you're building your own portfolio, my advice is: **make it uniquely yours**. Don't just copy a template—add something that showcases your personality and skills.

Feel free to explore the [source code on GitHub](https://github.com/Johnkalayu/project_portfolio) and reach out if you have questions!

---

*Thanks for reading! Connect with me on [LinkedIn](https://www.linkedin.com/in/joni-kalayu/) or check out my other projects on [GitHub](https://github.com/Johnkalayu).*
"""

        # Create or update the article
        article, created = Article.objects.update_or_create(
            slug='building-my-devops-portfolio-with-django-and-threejs',
            defaults={
                'title': 'Building My DevOps Portfolio with Django and Three.js',
                'excerpt': 'A deep dive into creating a modern, interactive portfolio website featuring 3D visualizations, glassmorphism design, and smooth animations using Django, Three.js, and CSS.',
                'content': content.strip(),
                'featured_image_url': '/static/image/projects/portfolio-preview.png',
                'status': 'published',
                'is_featured': True,
                'published_at': timezone.now(),
            }
        )

        # Add tags
        article.tags.set(tags)

        if created:
            self.stdout.write(self.style.SUCCESS(f'Successfully created blog post: {article.title}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully updated blog post: {article.title}'))
