from django.db import models
from django.utils.translation import ugettext as _


class TimeStampedMixin(models.Model):
    created = models.DateTimeField(_('생성시간'), auto_now_add=True)
    modified = models.DateTimeField(_('수정시간'), auto_now=True)

    class Meta:
        abstract = True


class CaculatedMixin(TimeStampedMixin):
    data_cnt = models.PositiveIntegerField(_('데이터 갯수'), default=0)
    # TODO: mean, max, min은 모두 자동적으로 계산되어야 한다.
    mean = models.FloatField(_('평균'), default=0.0)
    maximum = models.FloatField(_('최대값'), default=0.0)
    minimum = models.FloatField(_('최소값'), default=0.0)

    class Meta:
        abstract = True
