from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import ugettext as _

from ConstructionManagement.mixins import TimeStampedMixin
from informations.models import DataInfo


class Project(TimeStampedMixin):
    name = models.CharField(_('프로젝트 이름'), max_length=300)
    description = models.TextField(_('프로젝트 설명'), blank=True)


class Activity(TimeStampedMixin):
    name = models.CharField(_('액티비티 이름'), max_length=300)
    description = models.TextField(_('액티비티 설명'), blank=True)
    duration = models.PositiveIntegerField(_('기간'), default=0)
    productivity = models.FloatField(_('생산성'), default=0.0)
    labor_cnt = models.PositiveIntegerField(_('인력 총원'), default=0)

    project = models.ForeignKey('managements.Project', related_name='activities', on_delete=models.CASCADE)
    resource = models.ForeignKey('managements.Resource',
                                 null=True,
                                 related_name='activities',
                                 on_delete=models.SET_NULL)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='activities')
    data = models.ForeignKey('informations.DataInfo',
                             null=True,
                             related_name='activities',
                             on_delete=models.SET_NULL)
    quantity = models.IntegerField(_('물량'), default=0, null=True, blank=True)

    def clean(self):
        if self.resource is None and self.quantity is not None:
            raise ValidationError(_('리소스가 없는 경우 물량은 존재할 수 없습니다.'))
        if self.resource is not None and self.quantity is None:
            raise ValidationError(_('리소스가 존재하는 경우 반드시 물량이 존재해야 합니다. 데이터를 확인하십시오.'))

    def save(self, *args, **kwargs):
        self.full_clean()

        # productivity 는 아래 공식으로 무조건 채워져야 한다.
        self.productivity = self.quantity / (self.labor_cnt * self.duration)
        return super(Activity, self).save(*args, **kwargs)


class Resource(TimeStampedMixin):
    name = models.CharField(_('리소스 이름'), max_length=300)
    productivity = models.FloatField(_('생산성'), default=0.0)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='resources')


class WorkPackage(TimeStampedMixin):
    package = models.CharField(_('워크 패키지'), max_length=300)
    parent_package = models.ForeignKey('self', null=True, on_delete=models.CASCADE)
