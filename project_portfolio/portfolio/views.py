"""
Portfolio views - Handle all page rendering and form processing
"""

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages

from .models import Project, Skill, ContactMessage, SiteSettings
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

    # Contact form
    form = ContactForm()

    context.update({
        'projects': projects,
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
