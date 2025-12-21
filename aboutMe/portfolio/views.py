from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from .models import Project

def home(request):
    return render(request, 'home.html')


def contact(request):
    if request.method == "POST":
        return redirect("")
    return
def projects_api(request):
    """
    Optional query: ?tool=docker
    """
    tool_key = request.GET.get("tool")
    qs = Project.objects.all().prefetch_related("tools").order_by("-created_at")

    if tool_key:
        qs = qs.filter(tools__key=tool_key)

    data = []
    for p in qs:
        data.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "link": p.link,
            "tools": [{"key": t.key, "name": t.name} for t in p.tools.all()],
        })

    return JsonResponse({"projects": data})