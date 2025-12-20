from django.db import models


class project(models.Model):
    id = models.models.CharField(_(""), max_length=50)
    banner = models.models.ImageField(_(""), upload_to=None, height_field=None, width_field=None, max_length=None)


    def __str__(self):
        return self.name


