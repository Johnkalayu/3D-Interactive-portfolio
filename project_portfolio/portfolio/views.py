from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from .models import Tool, Project
from .forms import ContactForm

def home(request):
    tools = Tool.objects.all()
    
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Thank you for your message! I will get back to you soon.')
            return redirect('home')
    else:
        form = ContactForm()
    
    context = {
        'tools': tools,
        'form': form,
    }
    return render(request, 'home.html', context)

def get_projects_by_tool(request):
    tool_name = request.GET.get('tool', '')
    
    if not tool_name:
        return JsonResponse({'error': 'Tool parameter is required'}, status=400)
    
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
            'projects': projects_data
        })
    except Tool.DoesNotExist:
        return JsonResponse({'error': f'Tool "{tool_name}" not found'}, status=404)