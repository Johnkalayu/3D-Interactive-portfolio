from django.db import models

# Create your models here.
from django.db import models

class Tool(models.Model):
    key = models.SlugField(unique=True)     # e.g. "docker"
    name = models.CharField(max_length=60)  # e.g. "Docker"
    icon = models.ImageField(upload_to="tool_icons/", blank=True, null=True)  # optional

    def __str__(self):
        return self.name


class Project(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    link = models.URLField(blank=True)
    tools = models.ManyToManyField(Tool, related_name="projects", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title