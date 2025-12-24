from django.urls import path
from .views import home
from .api import projects_by_tool

urlpatterns = [
    path("", home, name="home"),
    path("api/projects/", projects_by_tool, name="api_projects_by_tool"),
]
