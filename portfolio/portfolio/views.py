from django.shortcuts import render 
from django.http import HttpRequest 
from django.urls import reverse

def home(request):
    return render(request, 'home.html')


def project(request, id):
    return render(request, 'porject.html')



def contact(request ):
    return render(request, 'contact.html')
    