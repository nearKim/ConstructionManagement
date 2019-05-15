from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import ugettext as _

from ConstructionManagement.mixins import TimeStampedMixin


class DataInfo(TimeStampedMixin):
    data_id = models.CharField(_('데이터 ID'), primary_key=True, max_length=30)
    data_cnt = models.PositiveIntegerField(_('데이터 갯수'), default=0)
    mean = models.FloatField(_('평균'), default=0.0)
    maximum = models.FloatField(_('최대값'), default=0.0)
    minimum = models.FloatField(_('최소값'), default=0.0)
    use_duration = models.BooleanField(_('선택자'), default=False)
    name = models.CharField(_('데이터 이름'), max_length=300)
    description = models.TextField(_('설명'), null=True)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='durations')

    def cast(self):
        for name in dir(self):
            try:
                attr = getattr(self, name)
                if isinstance(attr, self.__class__):
                    return attr
            except:
                pass
        return self


class DurationInfo(DataInfo):
    pass


class ProductivityInfo(DataInfo):
    pass
