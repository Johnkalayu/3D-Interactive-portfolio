from django.db import models

class Tool(models.Model):
    CATEGORY_CHOICES = [
        ('Cloud', 'Cloud'),
        ('CI/CD', 'CI/CD'),
        ('Monitoring', 'Monitoring'),
        ('Security', 'Security'),
        ('IaC', 'Infrastructure as Code'),
        ('Scripting', 'Scripting'),
        ('Container', 'Container Orchestration'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    icon_path = models.CharField(max_length=200, default='')
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']


class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    link = models.URLField(blank=True)
    tools = models.ManyToManyField(Tool, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.submitted_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-submitted_at']