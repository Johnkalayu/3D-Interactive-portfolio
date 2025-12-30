"""
Portfolio models - Database models for the portfolio website
"""

from django.db import models


class Skill(models.Model):
    """Model to store skills/technologies"""
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=100, help_text="Icon class or image path")
    category = models.CharField(max_length=50, choices=[
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('devops', 'DevOps'),
        ('database', 'Database'),
        ('other', 'Other'),
    ])
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Project(models.Model):
    """Model to store portfolio projects"""
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    image = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    """Model to store contact form submissions"""
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message from {self.full_name} - {self.created_at.strftime('%Y-%m-%d')}"


class SiteSettings(models.Model):
    """Singleton model for site-wide settings"""
    author_name = models.CharField(max_length=100, default='Joni K')
    author_email = models.EmailField(default='johngezae@yahoo.com')
    author_title = models.CharField(max_length=200, default='AI Enthusiast')
    author_bio = models.TextField(blank=True)
    linkedin_url = models.URLField(default='https://www.linkedin.com/in/joni-kalayu/')
    github_url = models.URLField(default='https://github.com/Johnkalayu')
    resume_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return "Site Settings"

    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
