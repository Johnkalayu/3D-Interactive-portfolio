from django.db import models

class Tool(models.Model):
    CATEGORY_CHOICES = [
        ('cloud', 'Cloud'),
        ('devops', 'DevOps'),
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('database', 'Database'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField()
    icon_path = models.CharField(max_length=200, help_text='Path relative to static/image/tools/')
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    link = models.URLField(blank=True, null=True)
    tools = models.ManyToManyField(Tool, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class Contact(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.name} - {self.submitted_at.strftime('%Y-%m-%d %H:%M')}"