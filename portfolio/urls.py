from django.urls import path
from . import views, api

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/', views.submit_contact, name='submit_contact'),
    path('api/projects/', api.get_projects_by_tool, name='api_projects'),
]