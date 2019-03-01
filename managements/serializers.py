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
    resource = serializers.PrimaryKeyRelatedField(queryset=Resource.objects.all())
    work_package = serializers.PrimaryKeyRelatedField(many=True, queryset=WorkPackage.objects.all())


class ActivityRetrieveListSerializer(ActivityBaseSerializer):
    project = serializers.PrimaryKeyRelatedField(read_only=True)
    resource = ResourceSerializer(read_only=True)
    work_package = WorkPackageSerializer(many=True, read_only=True)
