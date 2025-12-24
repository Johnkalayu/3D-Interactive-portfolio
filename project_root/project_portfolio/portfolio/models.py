from django.db import models

class Tool(models.Model):
    CATEGORY_CHOICES = [
        ("Cloud", "Cloud"),
        ("CI/CD", "CI/CD"),
        ("Monitoring", "Monitoring"),
        ("Security", "Security"),
        ("IaC", "Infrastructure as Code"),
        ("Scripting", "Scripting"),
        ("Container", "Container Orchestration"),
        ("OS", "Operating System"),
        ("Build", "Build"),
        ("Web", "Web/Proxy"),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="Cloud")
    description = models.TextField(blank=True)
    icon_path = models.CharField(max_length=200, blank=True, default="")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    link = models.URLField(blank=True)
    tools = models.ManyToManyField(Tool, related_name="projects", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.name} - {self.submitted_at:%Y-%m-%d}"
