from django.contrib import admin
from .models import Tool, Project, Contact

@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'icon_path']
    list_filter = ['category']
    search_fields = ['name', 'description']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'link', 'created_at']
    list_filter = ['created_at', 'tools']
    search_fields = ['title', 'description']
    filter_horizontal = ['tools']

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'submitted_at']
    list_filter = ['submitted_at']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['submitted_at']
