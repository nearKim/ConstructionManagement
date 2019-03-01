from django.shortcuts import render
from rest_framework import viewsets

from informations.models import DurationInfo, ProductivityInfo
from informations.serializers import DurationInfoSerializer


class DurationInfoViewSet(viewsets.ModelViewSet):
    serializer_class = DurationInfoSerializer
    queryset = DurationInfo.objects.select_related('datainfo_ptr').all()


class ProductivityInfoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductivityInfo
    queryset = ProductivityInfo.objects.select_related('datainfo_ptr').all()
