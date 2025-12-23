from django.http import JsonResponse
from .models import Tool, Project

def get_projects_by_tool(request):
    tool_name = request.GET.get('tool', '')
    
    if not tool_name:
        return JsonResponse({'error': 'Tool parameter required'}, status=400)
    
    try:
        tool = Tool.objects.get(name__iexact=tool_name)
        projects = tool.projects.all()
        
        projects_data = [{
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'link': p.link,
            'tools': [t.name for t in p.tools.all()]
        } for p in projects]
        
        return JsonResponse({
            'tool': tool.name,
            'category': tool.category,
            'description': tool.description,
            'projects': projects_data
        })
    
    except Tool.DoesNotExist:
        return JsonResponse({'error': 'Tool not found'}, status=404)