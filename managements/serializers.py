from django.utils.translation import ugettext as _
from rest_framework import serializers
from .models import *


class ProjectBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class ActivityBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'


class WorkPackageSerializer(serializers.ModelSerializer):
    parent_package = serializers.PrimaryKeyRelatedField(
        queryset=WorkPackage.objects.select_related('parent_package').all(), default=None)

    class Meta:
        model = WorkPackage
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    work_package = WorkPackageSerializer(many=True, read_only=True)

    class Meta:
        model = Resource
        fields = '__all__'


class ActivityCreateUpdateSerializer(ActivityBaseSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    resource = serializers.PrimaryKeyRelatedField(queryset=Resource.objects.all(), required=False)
    work_package = serializers.PrimaryKeyRelatedField(many=True, queryset=WorkPackage.objects.all())

    def validate(self, attrs):
        resource = attrs.get('resource', None)
        quantity = attrs.get('quantity', None)
        labor_cnt = attrs.get('labor_cnt', None)
        duration = attrs.get('duration', None)

        if resource is None and quantity is not None:
            raise serializers.ValidationError(_('리소스가 없는 경우 물량은 존재할 수 없습니다.'))
        elif resource is not None and quantity is None:
            raise serializers.ValidationError(_('리소스가 존재하는 경우 반드시 물량이 존재해야 합니다. 데이터를 확인하십시오.'))

        # 제반 요건이 갖춰진 경우 productivity 는 아래 공식으로 무조건 채워져야 한다.
        if quantity and labor_cnt and duration:
            attrs['productivity'] = quantity / (labor_cnt * duration)
        return attrs


class ActivityRetrieveListSerializer(ActivityBaseSerializer):
    project = serializers.PrimaryKeyRelatedField(read_only=True)
    resource = ResourceSerializer(read_only=True)
    work_package = WorkPackageSerializer(many=True, read_only=True)
