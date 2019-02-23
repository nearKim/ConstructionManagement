from django.db import models
from django.utils.translation import ugettext as _

from ConstructionManagement.mixins import TimeStampedMixin, CaculatedMixin


class Project(TimeStampedMixin):
    name = models.CharField( _('프로젝트 이름'), max_length=300)
    description = models.TextField(_('프로젝트 설명'), blank=True)


class Activity(TimeStampedMixin):
    name = models.CharField(_('액티비티 이름'), max_length=300)
    description = models.TextField(_('액티비티 설명'), blank=True)
    duration = models.PositiveIntegerField(_('기간'), default=0)
    productivity = models.FloatField(_('생산성'), default=0.0)
    labor_cnt = models.PositiveIntegerField(_('인력 총원'), default=0)

    project = models.ForeignKey('managements.Project', related_name='activities', on_delete=models.CASCADE)
    resource = models.ForeignKey('managements.Resource', related_name='activities', on_delete=models.PROTECT)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='activities')


class Resource(TimeStampedMixin):
    name = models.CharField(_('리소스 이름'), max_length=300)
    productivity = models.FloatField(_('생산성'), default=0.0)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='resources')


class WorkPackage(TimeStampedMixin):
    package = models.CharField(_('Work Package'), max_length=300)
