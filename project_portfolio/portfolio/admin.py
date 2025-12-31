"""
Portfolio admin configuration
"""

from django.contrib import admin
from django.utils import timezone
from .models import (
    Skill, Project, ContactMessage, SiteSettings,
    ProjectCategory, Technology,
    Tag, Article,
    WorkExperience, Education, Certification, ResumeSettings,
    Testimonial, Tool
)


# =============================================================================
# Project Filtering Admin
# =============================================================================

@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('order',)
    search_fields = ('name',)


@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'category')
    list_filter = ('category',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


# =============================================================================
# Blog Admin
# =============================================================================

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'is_featured', 'published_at', 'reading_time')
    list_filter = ('status', 'is_featured', 'tags', 'created_at')
    search_fields = ('title', 'content', 'excerpt')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'excerpt', 'content')
        }),
        ('Media', {
            'fields': ('featured_image_url',),
            'classes': ('collapse',)
        }),
        ('Categorization', {
            'fields': ('tags', 'is_featured')
        }),
        ('Publishing', {
            'fields': ('status', 'published_at')
        }),
    )

    actions = ['publish_articles', 'unpublish_articles']

    def publish_articles(self, request, queryset):
        queryset.update(status='published', published_at=timezone.now())
    publish_articles.short_description = "Publish selected articles"

    def unpublish_articles(self, request, queryset):
        queryset.update(status='draft')
    unpublish_articles.short_description = "Unpublish selected articles"


# =============================================================================
# Resume Admin
# =============================================================================

@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ('position', 'company', 'start_date', 'is_current', 'order')
    list_filter = ('is_current',)
    search_fields = ('position', 'company', 'description')
    ordering = ('-is_current', '-start_date', 'order')
    list_editable = ('order',)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('degree', 'institution', 'start_date', 'is_current', 'order')
    list_filter = ('is_current',)
    search_fields = ('degree', 'institution', 'field_of_study')
    ordering = ('-is_current', '-start_date', 'order')
    list_editable = ('order',)


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('name', 'issuing_organization', 'issue_date', 'expiry_date', 'order')
    list_filter = ('issuing_organization',)
    search_fields = ('name', 'issuing_organization')
    ordering = ('-issue_date', 'order')
    list_editable = ('order',)


@admin.register(ResumeSettings)
class ResumeSettingsAdmin(admin.ModelAdmin):
    list_display = ('headline', 'last_updated')

    def has_add_permission(self, request):
        return not ResumeSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


# =============================================================================
# Testimonials Admin
# =============================================================================

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'company', 'is_featured', 'show_on_homepage', 'order')
    list_filter = ('is_featured', 'show_on_homepage')
    search_fields = ('name', 'role', 'company', 'quote')
    list_editable = ('is_featured', 'show_on_homepage', 'order')
    ordering = ('order', '-created_at')


# =============================================================================
# Existing Admin
# =============================================================================

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'order')
    list_filter = ('category',)
    search_fields = ('name',)
    ordering = ('order', 'name')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'project_category', 'is_featured', 'order', 'created_at')
    list_filter = ('project_category', 'is_featured', 'technologies')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('technologies',)
    ordering = ('order', '-created_at')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'created_at', 'read')
    list_filter = ('read', 'created_at')
    search_fields = ('full_name', 'email', 'message')
    readonly_fields = ('full_name', 'email', 'message', 'created_at')
    ordering = ('-created_at',)

    def has_add_permission(self, request):
        return False


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'author_email')

    def has_add_permission(self, request):
        # Only allow one instance
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active', 'order')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    list_editable = ('is_active', 'order')
    ordering = ('order', 'name')
