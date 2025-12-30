"""
Portfolio forms - Contact form and other forms
"""

from django import forms
from .models import ContactMessage


class ContactForm(forms.Form):
    """Contact form for visitors to send messages"""
    full_name = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Your Name',
            'required': True,
        })
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-input',
            'placeholder': 'you@example.com',
            'required': True,
        })
    )
    message = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'form-textarea',
            'placeholder': 'Tell me about your project...',
            'rows': 5,
            'required': True,
        })
    )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            return email.lower()
        return email
