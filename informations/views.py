from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action

from informations.models import DurationInfo, ProductivityInfo
from informations.serializers import DurationInfoSerializer, ProductivityInfoSerializer


class DurationInfoViewSet(viewsets.ModelViewSet):
    serializer_class = DurationInfoSerializer
    queryset = DurationInfo.objects.select_related('datainfo_ptr').all()


class ProductivityInfoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductivityInfoSerializer
    queryset = ProductivityInfo.objects.select_related('datainfo_ptr').all()
