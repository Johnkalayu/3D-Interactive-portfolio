"""
Portfolio views - Handle all page rendering and form processing
"""

from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.mail import send_mail
from django.core.paginator import Paginator
from django.conf import settings
from django.contrib import messages
from django.db.models import Q

from .models import (
    Project, Skill, ContactMessage, SiteSettings,
    ProjectCategory, Technology,
    Tag, Article,
    WorkExperience, Education, Certification, ResumeSettings,
    Testimonial, Tool
)
from .forms import ContactForm


def get_site_context():
    """Get common context data for all views"""
    try:
        site_settings = SiteSettings.get_settings()
    except Exception:
        site_settings = None

    return {
        'site_settings': site_settings,
        'author': settings.SITE_CONFIG.get('author', 'Joni K'),
        'email': settings.SITE_CONFIG.get('email', 'johngezae@yahoo.com'),
        'social': settings.SITE_CONFIG.get('social', {}),
    }


def home(request):
    """Home page view - displays all sections"""
    context = get_site_context()

    # Use default projects (skip database for now)
    projects = get_default_projects()

    # Get project categories for filtering tabs
    categories = ProjectCategory.objects.all()

    # Get testimonials for homepage
    testimonials = Testimonial.objects.filter(show_on_homepage=True, is_featured=True)[:6]

    # Contact form
    form = ContactForm()

    context.update({
        'projects': projects,
        'categories': categories,
        'testimonials': testimonials,
        'skills': [],
        'form': form,
    })

    return render(request, 'home.html', context)


@require_POST
def contact_submit(request):
    """Handle contact form submission"""
    form = ContactForm(request.POST)

    if form.is_valid():
        # Save to database
        contact = ContactMessage.objects.create(
            full_name=form.cleaned_data['full_name'],
            email=form.cleaned_data['email'],
            message=form.cleaned_data['message']
        )

        # Send email notification
        try:
            send_mail(
                subject=f"Portfolio Contact: {form.cleaned_data['full_name']}",
                message=f"From: {form.cleaned_data['full_name']}\n"
                        f"Email: {form.cleaned_data['email']}\n\n"
                        f"Message:\n{form.cleaned_data['message']}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.SITE_CONFIG.get('email', 'johngezae@yahoo.com')],
                fail_silently=True,
            )
        except Exception:
            pass  # Email sending is optional

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'message': "Thank you! I'll get back to you as soon as possible."
            })

        messages.success(request, "Thank you! I'll get back to you as soon as possible.")
        return redirect('home')

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': False,
            'error': 'Please check all fields and try again.'
        }, status=400)

    messages.error(request, 'Please check all fields and try again.')
    return redirect('home')


def get_default_projects():
    """Return default projects when database is empty"""
    return [
        {
            'id': 'aidockerfileoptimizer',
            'title': 'AI Dockerfile Optimizer',
            'category': 'AI and DevOps',
            'description': 'AI-Docker-file-optimizer helps optimize Dockerfiles for smaller, more efficient images. Simply paste your Dockerfile, and the app analyzes it for best practices and size optimization tips.',
            'image': '/static/image/projects/aidockerfileoptimizer.png',
            'live_url': 'https://ai-docker-file-optimizer.netlify.app/',
            'github_url': 'https://github.com/Johnkalayu/AI-Docker-file-optimizer',
            'frontend_skills': ['JavaScript', 'Next.js', 'Tailwind', 'Vite'],
            'backend_skills': ['OpenAI', 'Netlify'],
        },
        {
            'id': 'financeme',
            'title': 'FinanceMe: DevOps Capstone Project',
            'category': 'DevOps in Banking and Finance',
            'description': 'Complete DevOps pipeline for a global banking provider. Demonstrates infrastructure provisioning, build automation, and continuous monitoring using AWS services.',
            'image': '/static/image/projects/financeme.png',
            'live_url': 'https://github.com/Johnkalayu/FinanceMe-Devops-Project-01',
            'github_url': 'https://github.com/Johnkalayu/FinanceMe-Devops-Project-01',
            'frontend_skills': ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'],
            'backend_skills': ['Java', 'Maven', 'PostgreSQL'],
        },
        {
            'id': 'portfolio',
            'title': 'My Portfolio',
            'category': 'Portfolio',
            'description': 'A creative digital playground where creativity meets code. Features beautiful 3D objects, space theme with floating particles, and interactive elements.',
            'image': '/static/image/projects/portfolio.png',
            'live_url': '#',
            'github_url': 'https://github.com/Johnkalayu/portfolio',
            'frontend_skills': ['Python', 'Django', 'HTML', 'Three.js', 'CSS'],
            'backend_skills': ['PostgreSQL'],
        },
        {
            'id': 'smartparkingassitant',
            'title': 'Smart Parking Assistant',
            'category': 'IoT',
            'description': 'IoT marvel powered by Arduino and IR sensors to detect and recommend the best parking spots in real-time. Features a sleek GUI for availability visualization.',
            'image': '/static/image/projects/smartparking.png',
            'live_url': 'https://github.com/Johnkalayu/smart-parking-assistant',
            'github_url': 'https://github.com/Johnkalayu/smart-parking-assistant',
            'frontend_skills': ['Python'],
            'backend_skills': ['C++', 'Arduino'],
        },
        {
            'id': 'smartjobtracker',
            'title': 'Smart Job Tracker',
            'category': 'Full Stack',
            'description': 'Track job applications effortlessly with a sleek, dark-themed app. Features Kanban board organization, status monitoring, and email reminders.',
            'image': '/static/image/projects/jobtracker.png',
            'live_url': 'https://job-tracker-application-eight.vercel.app/',
            'github_url': 'https://github.com/Johnkalayu/Job-tracker-application',
            'frontend_skills': ['JavaScript', 'Next.js', 'Tailwind', 'Vite'],
            'backend_skills': ['Firebase'],
        },
        {
            'id': 'clientportfolio',
            'title': 'Client Portfolio Website',
            'category': 'Web Development',
            'description': 'A responsive portfolio website built with modern tools. Features inspiring journey showcase, milestones, and services display.',
            'image': '/static/image/projects/clientportfolio.png',
            'live_url': '#',
            'github_url': 'https://github.com/Johnkalayu',
            'frontend_skills': ['JavaScript', 'Next.js', 'Tailwind', 'Vite'],
            'backend_skills': [],
        },
    ]


# =============================================================================
# Projects Page Views
# =============================================================================

def projects_list(request):
    """Projects page with filtering"""
    context = get_site_context()

    projects = Project.objects.all().prefetch_related('technologies', 'project_category')
    categories = ProjectCategory.objects.all()
    technologies = Technology.objects.all()

    # Server-side filtering (for direct URL access)
    search_query = request.GET.get('q', '')
    category_slug = request.GET.get('category', '')
    tech_slug = request.GET.get('tech', '')

    if search_query:
        projects = projects.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query)
        )

    if category_slug:
        projects = projects.filter(project_category__slug=category_slug)

    if tech_slug:
        projects = projects.filter(technologies__slug=tech_slug)

    projects = projects.distinct()

    context.update({
        'projects': projects,
        'categories': categories,
        'technologies': technologies,
        'search_query': search_query,
        'current_category': category_slug,
        'current_technology': tech_slug,
    })

    return render(request, 'projects.html', context)


# =============================================================================
# Blog Views
# =============================================================================

def blog_list(request):
    """Blog listing page with pagination"""
    context = get_site_context()

    articles = Article.objects.filter(status='published').prefetch_related('tags')
    featured_articles = articles.filter(is_featured=True)[:3]

    # Pagination
    paginator = Paginator(articles, 9)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # All tags for sidebar/filter
    tags = Tag.objects.all()

    context.update({
        'articles': page_obj,
        'featured_articles': featured_articles,
        'tags': tags,
        'page_obj': page_obj,
    })

    return render(request, 'blog/blog_list.html', context)


def article_detail(request, slug):
    """Individual article page"""
    context = get_site_context()

    article = get_object_or_404(Article, slug=slug, status='published')

    # Related articles (same tags)
    related_articles = Article.objects.filter(
        status='published',
        tags__in=article.tags.all()
    ).exclude(id=article.id).distinct()[:3]

    context.update({
        'article': article,
        'related_articles': related_articles,
    })

    return render(request, 'blog/article_detail.html', context)


def blog_by_tag(request, tag_slug):
    """Filter articles by tag"""
    context = get_site_context()

    tag = get_object_or_404(Tag, slug=tag_slug)
    articles = Article.objects.filter(status='published', tags=tag).prefetch_related('tags')

    paginator = Paginator(articles, 9)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    tags = Tag.objects.all()

    context.update({
        'articles': page_obj,
        'current_tag': tag,
        'tags': tags,
        'page_obj': page_obj,
    })

    return render(request, 'blog/blog_list.html', context)


# =============================================================================
# Resume View
# =============================================================================

def resume(request):
    """Resume/CV page view"""
    context = get_site_context()

    resume_settings = ResumeSettings.get_settings()
    work_experiences = WorkExperience.objects.all()
    education = Education.objects.all()
    certifications = Certification.objects.all()
    skills = Skill.objects.all()

    context.update({
        'resume_settings': resume_settings,
        'work_experiences': work_experiences,
        'education': education,
        'certifications': certifications,
        'skills_by_category': {
            'frontend': skills.filter(category='frontend'),
            'backend': skills.filter(category='backend'),
            'devops': skills.filter(category='devops'),
            'database': skills.filter(category='database'),
            'other': skills.filter(category='other'),
        },
    })

    return render(request, 'resume.html', context)


# =============================================================================
# Tools API
# =============================================================================

def get_default_tools():
    """Return default tools data when database is empty"""
    return [
        {'name': 'Docker', 'icon_url': '/static/image/tools/docker.png', 'description': 'Container platform for building, shipping, and running applications in isolated environments.', 'category': 'Containerization', 'color': '#2496ED', 'link': ''},
        {'name': 'Kubernetes', 'icon_url': '/static/image/tools/kubernetes.png', 'description': 'Container orchestration platform for automating deployment, scaling, and management.', 'category': 'Orchestration', 'color': '#326CE5', 'link': ''},
        {'name': 'Jenkins', 'icon_url': '/static/image/tools/jenkins.png', 'description': 'Open-source automation server for CI/CD pipelines.', 'category': 'CI/CD', 'color': '#D33833', 'link': ''},
        {'name': 'Terraform', 'icon_url': '/static/image/tools/terraform.png', 'description': 'Infrastructure as Code tool for building cloud infrastructure.', 'category': 'Infrastructure as Code', 'color': '#7B42BC', 'link': ''},
        {'name': 'AWS', 'icon_url': '/static/image/tools/aws.png', 'description': 'Amazon Web Services - comprehensive cloud computing platform.', 'category': 'Cloud', 'color': '#FF9900', 'link': ''},
        {'name': 'Azure', 'icon_url': '/static/image/tools/azure.png', 'description': 'Microsoft Azure cloud computing platform and services.', 'category': 'Cloud', 'color': '#0078D4', 'link': ''},
        {'name': 'Git', 'icon_url': '/static/image/tools/git.png', 'description': 'Distributed version control system for source code.', 'category': 'Version Control', 'color': '#F05032', 'link': ''},
        {'name': 'GitLab', 'icon_url': '/static/image/tools/gitlab.png', 'description': 'DevOps platform for the complete software development lifecycle.', 'category': 'CI/CD', 'color': '#FC6D26', 'link': ''},
        {'name': 'Ansible', 'icon_url': '/static/image/tools/ansible.png', 'description': 'Agentless automation tool for configuration management.', 'category': 'Configuration', 'color': '#EE0000', 'link': ''},
        {'name': 'Prometheus', 'icon_url': '/static/image/tools/prometheus.png', 'description': 'Open-source monitoring and alerting toolkit.', 'category': 'Monitoring', 'color': '#E6522C', 'link': ''},
        {'name': 'Grafana', 'icon_url': '/static/image/tools/grafana.png', 'description': 'Analytics and interactive visualization platform.', 'category': 'Monitoring', 'color': '#F46800', 'link': ''},
        {'name': 'Linux', 'icon_url': '/static/image/tools/linux.png', 'description': 'Open-source OS kernel powering most servers.', 'category': 'Operating System', 'color': '#FCC624', 'link': ''},
        {'name': 'Python', 'icon_url': '/static/image/tools/python.png', 'description': 'Programming language for automation and scripting.', 'category': 'Programming', 'color': '#3776AB', 'link': ''},
        {'name': 'Nginx', 'icon_url': '/static/image/tools/nginx.png', 'description': 'High-performance web server and reverse proxy.', 'category': 'Web Server', 'color': '#009639', 'link': ''},
        {'name': 'Helm', 'icon_url': '/static/image/tools/helm.png', 'description': 'Package manager for Kubernetes applications.', 'category': 'Orchestration', 'color': '#0F1689', 'link': ''},
        {'name': 'Bash', 'icon_url': '/static/image/tools/bash.png', 'description': 'Unix shell and command language for scripting.', 'category': 'Scripting', 'color': '#4EAA25', 'link': ''},
        {'name': 'Datadog', 'icon_url': '/static/image/tools/datadog.png', 'description': 'Monitoring and analytics platform for cloud apps.', 'category': 'Monitoring', 'color': '#632CA6', 'link': ''},
        {'name': 'SonarQube', 'icon_url': '/static/image/tools/sonarqube.png', 'description': 'Code quality and security analysis tool.', 'category': 'Security', 'color': '#4E9BCD', 'link': ''},
        {'name': 'Trivy', 'icon_url': '/static/image/tools/trivy.png', 'description': 'Container vulnerability scanner.', 'category': 'Security', 'color': '#1904DA', 'link': ''},
        {'name': 'Maven', 'icon_url': '/static/image/tools/mavne.png', 'description': 'Build automation tool for Java projects.', 'category': 'Build', 'color': '#C71A36', 'link': ''},
        {'name': 'Snyk', 'icon_url': '/static/image/tools/snyk.png', 'description': 'Developer security platform for finding vulnerabilities.', 'category': 'Security', 'color': '#4C4A73', 'link': ''},
        {'name': 'JFrog', 'icon_url': '/static/image/tools/jfrog.png', 'description': 'Universal artifact repository manager.', 'category': 'Artifacts', 'color': '#40BE46', 'link': ''},
    ]


def tools_api(request):
    """API endpoint to serve tools data as JSON"""
    tools = Tool.objects.filter(is_active=True)

    if tools.exists():
        tools_data = [tool.to_dict() for tool in tools]
    else:
        tools_data = get_default_tools()

    return JsonResponse({'tools': tools_data})
