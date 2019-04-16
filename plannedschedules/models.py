from django.db import models
from django.utils.translation import ugettext as _

from ConstructionManagement.mixins import TimeStampedMixin


class PlannedSchedules(TimeStampedMixin):
    activity_id = models.CharField(_('액티비티 Id'), max_length=100, primary_key=True)
    wbs_id = models.CharField(_('WBS Id'), max_length=300)
    name = models.CharField(_('액티비티 이름'), max_length=300)
    duration = models.PositiveIntegerField(_('기간'), default=0)
    resource = models.ForeignKey('managements.Resource',
                                 null=True,
                                 related_name='planned_schedules',
                                 on_delete=models.SET_NULL)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='planned_schedules')
    quantity = models.IntegerField(_('물량'), default=0, null=True, blank=True)
    data = models.ForeignKey('informations.DataInfo',
                             null=True,
                             related_name='planned_schedules',
                             on_delete=models.SET_NULL)


# class Allocation(TimeStampedMixin):
#     """
#     activity = models.OneToOneField
#     data  = models.ForeignKey
#     isProductivity = data에 따라서
#     mode = 유저 인풋
#     => 이게 Table로 front에 보여줘야 한다.
#     """
