from django.db import models
from django.utils.translation import ugettext as _


class TimeStampedMixin(models.Model):
    created = models.DateTimeField(_('생성시간'), auto_now_add=True)
    modified = models.DateTimeField(_('수정시간'), auto_now=True)

    class Meta:
        abstract = True


