"""
Portfolio URL configuration
"""

from django.urls import path
from . import views

urlpatterns = [
    # Home
    path('', views.home, name='home'),
    path('contact/', views.contact_submit, name='contact_submit'),

    # Projects
    path('projects/', views.projects_list, name='projects_list'),

    # Blog
    path('blog/', views.blog_list, name='blog_list'),
    path('blog/<slug:slug>/', views.article_detail, name='article_detail'),
    path('blog/tag/<slug:tag_slug>/', views.blog_by_tag, name='blog_by_tag'),

    # Resume
    path('resume/', views.resume, name='resume'),

    # API
    path('api/tools/', views.tools_api, name='tools_api'),
]
