"""
Portfolio models - Database models for the portfolio website
"""

from django.db import models
from django.utils.text import slugify


# =============================================================================
# Project Filtering Models
# =============================================================================

class ProjectCategory(models.Model):
    """Model for project categories"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Project Categories'

    def __str__(self):
        return self.name


class Technology(models.Model):
    """Model for technologies/tools used in projects"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=[
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('devops', 'DevOps'),
        ('database', 'Database'),
        ('other', 'Other'),
    ], default='other')

    class Meta:
        ordering = ['category', 'name']
        verbose_name_plural = 'Technologies'

    def __str__(self):
        return self.name


# =============================================================================
# Blog Models
# =============================================================================

class Tag(models.Model):
    """Model to store article tags"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Article(models.Model):
    """Model to store blog articles"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    excerpt = models.TextField(max_length=500, blank=True,
        help_text="Brief summary for listing pages")
    content = models.TextField(help_text="Supports Markdown formatting")
    featured_image_url = models.URLField(blank=True,
        help_text="URL for the featured image")
    featured_image_file = models.ImageField(
        upload_to='articles/images/',
        blank=True,
        null=True,
        help_text="Upload featured image directly (recommended: 1200x630)"
    )

    tags = models.ManyToManyField(Tag, blank=True, related_name='articles')

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    reading_time = models.PositiveIntegerField(default=5,
        help_text="Estimated reading time in minutes")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.content:
            word_count = len(self.content.split())
            self.reading_time = max(1, word_count // 200)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('article_detail', kwargs={'slug': self.slug})

    def get_featured_image(self):
        """Return image URL - prefers uploaded file over external URL"""
        if self.featured_image_file:
            return self.featured_image_file.url
        return self.featured_image_url or '/static/image/default-article.png'


# =============================================================================
# Resume Models
# =============================================================================

class WorkExperience(models.Model):
    """Model to store work experience entries"""
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="Leave blank if current")
    is_current = models.BooleanField(default=False)
    description = models.TextField(help_text="Use bullet points, one per line")
    technologies = models.CharField(max_length=500, blank=True,
        help_text="Comma-separated list of technologies used")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['-is_current', '-start_date', 'order']
        verbose_name = 'Work Experience'
        verbose_name_plural = 'Work Experiences'

    def __str__(self):
        return f"{self.position} at {self.company}"

    def get_technologies_list(self):
        if self.technologies:
            return [t.strip() for t in self.technologies.split(',')]
        return []


class Education(models.Model):
    """Model to store education entries"""
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    gpa = models.CharField(max_length=20, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['-is_current', '-start_date', 'order']
        verbose_name = 'Education'
        verbose_name_plural = 'Education'

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Certification(models.Model):
    """Model to store certifications"""
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    badge_image_url = models.URLField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['-issue_date', 'order']

    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"

    def get_badge_image(self):
        return self.badge_image_url or None


class ResumeSettings(models.Model):
    """Singleton model for resume-specific settings"""
    headline = models.CharField(max_length=200, default='DevOps & Cloud Engineer')
    summary = models.TextField(blank=True, help_text="Professional summary paragraph")
    resume_pdf_url = models.URLField(blank=True, help_text="URL to downloadable PDF resume")
    show_skills_section = models.BooleanField(default=True)
    last_updated = models.DateField(auto_now=True)

    class Meta:
        verbose_name = 'Resume Settings'
        verbose_name_plural = 'Resume Settings'

    def __str__(self):
        return "Resume Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


# =============================================================================
# Testimonials Model
# =============================================================================

class Testimonial(models.Model):
    """Model to store testimonials"""
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200, help_text="Job title")
    company = models.CharField(max_length=200, blank=True)
    quote = models.TextField()
    photo_url = models.URLField(blank=True, help_text="URL to profile photo")
    linkedin_url = models.URLField(blank=True)

    is_featured = models.BooleanField(default=True)
    show_on_homepage = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.name} - {self.company or self.role}"

    def get_photo(self):
        return self.photo_url or None

    def get_initials(self):
        parts = self.name.split()
        if len(parts) >= 2:
            return f"{parts[0][0]}{parts[1][0]}".upper()
        return self.name[0:2].upper()


# =============================================================================
# Existing Models
# =============================================================================

class Skill(models.Model):
    """Model to store skills/technologies"""
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=100, help_text="Icon class or image path")
    icon_file = models.ImageField(
        upload_to='skills/icons/',
        blank=True,
        null=True,
        help_text="Upload skill icon directly (recommended: 64x64 or 128x128 PNG)"
    )
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

    def get_icon_url(self):
        """Return icon URL - prefers uploaded file over icon path"""
        if self.icon_file:
            return self.icon_file.url
        if self.icon and (self.icon.startswith('/') or self.icon.startswith('http')):
            return self.icon
        return None

    def get_icon_class(self):
        """Return icon class if icon field contains a CSS class name"""
        if self.icon and not self.icon.startswith('/') and not self.icon.startswith('http'):
            return self.icon
        return None


class Tool(models.Model):
    """Model for 3D orbit tools display"""
    CATEGORY_CHOICES = [
        ('containerization', 'Containerization'),
        ('orchestration', 'Orchestration'),
        ('ci_cd', 'CI/CD'),
        ('iac', 'Infrastructure as Code'),
        ('cloud', 'Cloud'),
        ('version_control', 'Version Control'),
        ('configuration', 'Configuration'),
        ('monitoring', 'Monitoring'),
        ('security', 'Security'),
        ('programming', 'Programming'),
        ('web_server', 'Web Server'),
        ('scripting', 'Scripting'),
        ('build', 'Build'),
        ('artifacts', 'Artifacts'),
        ('os', 'Operating System'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(help_text="Brief description of the tool")
    icon_url = models.CharField(
        max_length=255,
        help_text="Static path like /static/image/tools/terraform.png"
    )
    icon_file = models.ImageField(
        upload_to='tools/icons/',
        blank=True,
        null=True,
        help_text="Upload tool icon directly (recommended: 128x128 PNG)"
    )
    color = models.CharField(
        max_length=7,
        default='#6366f1',
        help_text="Hex color code for the tool sphere"
    )
    link = models.URLField(blank=True, help_text="Optional link to tool website")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def get_icon_url(self):
        """Return icon URL - prefers uploaded file over static path"""
        if self.icon_file:
            return self.icon_file.url
        return self.icon_url

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'name': self.name,
            'category': self.get_category_display(),
            'description': self.description,
            'icon_url': self.get_icon_url(),
            'color': self.color,
            'link': self.link,
        }


class Project(models.Model):
    """Model to store portfolio projects"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    project_category = models.ForeignKey(
        ProjectCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projects'
    )
    category = models.CharField(max_length=100, blank=True)  # Keep for backward compat
    description = models.TextField()
    image = models.URLField(blank=True, help_text="External image URL (optional)")
    image_file = models.ImageField(
        upload_to='projects/images/',
        blank=True,
        null=True,
        help_text="Upload project image directly"
    )
    icon_file = models.ImageField(
        upload_to='projects/icons/',
        blank=True,
        null=True,
        help_text="Upload project icon (recommended: 64x64 or 128x128)"
    )
    live_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    technologies = models.ManyToManyField(
        Technology,
        blank=True,
        related_name='projects'
    )
    is_featured = models.BooleanField(default=False)
    show_on_homepage = models.BooleanField(default=False, help_text="Display this project on the homepage")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_category_display_name(self):
        """Return category name from FK or text field"""
        if self.project_category:
            return self.project_category.name
        return self.category

    def get_image_url(self):
        """Return image URL - prefers uploaded file over external URL"""
        if self.image_file:
            return self.image_file.url
        return self.image or '/static/image/default-project.png'

    def get_icon_url(self):
        """Return icon URL if available"""
        if self.icon_file:
            return self.icon_file.url
        return None


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
