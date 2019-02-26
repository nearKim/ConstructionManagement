from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import ugettext as _

from ConstructionManagement.mixins import TimeStampedMixin


class DataInfo(TimeStampedMixin):
    data_id = models.CharField(_('데이터 ID'), primary_key=True, max_length=30)
    data_cnt = models.PositiveIntegerField(_('데이터 갯수'), default=0)
    # TODO: mean, max, min은 모두 자동적으로 계산되어야 한다.
    mean = models.FloatField(_('평균'), default=0.0)
    maximum = models.FloatField(_('최대값'), default=0.0)
    minimum = models.FloatField(_('최소값'), default=0.0)
    use_duration = models.BooleanField(_('선택자'), default=False)
    description = models.TextField(_('설명'), blank=True)
    work_package = models.ManyToManyField('managements.WorkPackage', related_name='durations')

    def clean(self):
        if self.durationinfo and self.productivityinfo:
            raise ValidationError(_('DataInfo는 Duration와 Productivity 둘다 사용할 수 없습니다.'))
        if self.durationinfo and not self.use_duration:
            raise ValidationError(_('Duration을 사용하기로 선택된 경우 반드시 DurationInfo가 존재해야 합니다.'))
        elif self.productivityinfo and self.use_duration:
            raise ValidationError(_('Productivity를 사용하기로 선택된 경우 반드시 ProductivityInfo가 존재해야 합니다.'))


class DurationInfo(DataInfo):
    pass


class ProductivityInfo(DataInfo):
    pass