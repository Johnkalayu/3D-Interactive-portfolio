from django import forms
from .models import Contact

class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ["name", "email", "message"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Your Name"}),
            "email": forms.EmailInput(attrs={"placeholder": "you@example.com"}),
            "message": forms.Textarea(attrs={"rows": 5, "placeholder": "Tell me about your project..."}),
        }
