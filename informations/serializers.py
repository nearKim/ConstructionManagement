from django.utils.translation import ugettext as _
from rest_framework import serializers
from informations.models import DurationInfo, ProductivityInfo
from managements.serializers import WorkPackageSerializer


class DurationInfoSerializer(serializers.ModelSerializer):
    work_package = WorkPackageSerializer(many=True, read_only=True)

    class Meta:
        model = DurationInfo
        fields = '__all__'

    def validate(self, attrs):
        if not attrs['use_duration']:
            raise serializers.ValidationError(_('Duration을 사용하기로 선택된 경우 반드시 use_duration이 True여야 합니다.'))
        return attrs


class ProductivityInfoSerializer(serializers.ModelSerializer):
    work_package = WorkPackageSerializer(many=True, read_only=True)

    class Meta:
        model = ProductivityInfo
        fields = '__all__'

    def validate(self, attrs):
        if attrs['use_duration']:
            raise serializers.ValidationError(_('Productivity를 사용하기로 선택된 경우 반드시 use_duration이 False여야 합니다.'))
        return attrs
