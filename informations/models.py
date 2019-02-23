from django.db import models
from django.utils.translation import ugettext as _

from ConstructionManagement.mixins import CaculatedMixin


class DurationInfo(CaculatedMixin):
    description = models.TextField(_('기간 설명'), blank=True)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='durations')


class ProductivityInfo(CaculatedMixin):
    description = models.TextField(_('생산성 설명'), blank=True)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='productivities')
