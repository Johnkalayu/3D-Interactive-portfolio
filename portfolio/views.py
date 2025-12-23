from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Tool, Project, Contact

def home(request):
    tools = Tool.objects.all()
    projects = Project.objects.all()[:6]
    
    context = {
        'tools': tools,
        'projects': projects,
    }
    return render(request, 'home.html', context)

def submit_contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')
        
        if name and email and message:
            Contact.objects.create(
                name=name,
                email=email,
                message=message
            )
            messages.success(request, 'Thank you for your message! I will get back to you soon.')
        else:
            messages.error(request, 'Please fill in all fields.')
        
        return redirect('home')
    
    return redirect('home')