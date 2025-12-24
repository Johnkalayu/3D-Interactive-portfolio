from django.contrib import admin
from .models import Tool, Project, Contact

@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ("name", "category")
    search_fields = ("name", "category")

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "created_at")
    search_fields = ("title",)
    list_filter = ("created_at",)
    filter_horizontal = ("tools",)

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "submitted_at")
    search_fields = ("name", "email")

