from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('api/projects/', views.projects_api, name='projects_api'),
    path('contact/', views.contact, name='contact'),
]