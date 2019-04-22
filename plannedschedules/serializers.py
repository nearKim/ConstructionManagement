from django.utils.translation import ugettext as _
from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField

from informations.models import DataInfo
from managements.models import WorkPackage, Activity
from managements.serializers import WorkPackageSerializer
from .models import *


class PlannedScheduleBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlannedSchedules
        fields = '__all__'


class PlannedScheduleCreateUpdateSerializer(PlannedScheduleBaseSerializer):
    work_package = serializers.PrimaryKeyRelatedField(many=True, queryset=WorkPackage.objects.all())

    def validate(self, attrs):
        resource = attrs.get('resource', None)
        quantity = attrs.get('quantity', None)
        duration = attrs.get('duration', None)

        if resource is None and quantity is not None:
            raise serializers.ValidationError(_('리소스가 없는 경우 물량은 존재할 수 없습니다.'))
        elif resource is not None and quantity is None:
            raise serializers.ValidationError(_('리소스가 존재하는 경우 반드시 물량이 존재해야 합니다. 데이터를 확인하십시오.'))

        # 제반 요건이 갖춰진 경우 productivity 는 아래 공식으로 무조건 채워져야 한다.
        if quantity and duration:
            attrs['productivity'] = quantity / duration
        return attrs


class PlannedScheduleRetrieveListSerializer(PlannedScheduleBaseSerializer):
    work_package = WorkPackageSerializer(many=True, read_only=True)


class AllocationSerializer(serializers.ModelSerializer):
    activity = PrimaryKeyRelatedField(read_only=True)
    data = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Allocation
        fields = '__all__'

    def validate(self, attrs):
        mode = attrs.get('mode', None)

        if mode is None:
            raise serializers.ValidationError(_('Mode는 무조건 들어와야 합니다.'))
        if mode not in [1, 2, 3, 4, 5]:
            raise serializers.ValidationError(_('Mode는 무조건 1,2,3,4,5중 하나여야 합니다.'))

        return attrs


