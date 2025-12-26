from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Project

@require_GET
def projects_by_tool(request):
    tool_name = request.GET.get("tool", "").strip()
    qs = Project.objects.all().prefetch_related("tools")
    if tool_name:
        qs = qs.filter(tools__name__iexact=tool_name)

    def proj_to_dict(p):
        return {
            "title": p.title,
            "description": p.description,
            "link": p.link,
            "tools": [{"name": t.name, "category": t.category} for t in p.tools.all()],
        }

    return JsonResponse({"projects": [proj_to_dict(p) for p in qs]}, json_dumps_params={"ensure_ascii": False})
