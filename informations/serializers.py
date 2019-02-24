from rest_framework import serializers

from informations.models import DurationInfo, ProductivityInfo


class DurationInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DurationInfo
        fields = '__all__'


class ProductivityInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductivityInfo
        fields = '__all__'
