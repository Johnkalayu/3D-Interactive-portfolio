from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from .models import Tool, Project
from .forms import ContactForm

@require_http_methods(["GET", "POST"])
def home(request):
    tools = Tool.objects.all()
    projects = Project.objects.all()[:6]
    form = ContactForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect("home")

    return render(request, "home.html", {"tools": tools, "projects": projects, "form": form})
