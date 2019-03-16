from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action

from informations.models import DurationInfo, ProductivityInfo
from informations.serializers import DurationInfoSerializer, ProductivityInfoSerializer


class DurationInfoViewSet(viewsets.ModelViewSet):
    serializer_class = DurationInfoSerializer

    def get_queryset(self):
        query_string = self.request.query_params.get('work_package', None)
        queryset = DurationInfo.objects \
            .select_related('datainfo_ptr') \
            .prefetch_related('work_package') \
            .all()

        if query_string:
            work_packages = [query_string] if not isinstance(query_string, list) else query_string
            return queryset.filter(work_package__in=work_packages)
        return queryset


class ProductivityInfoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductivityInfoSerializer

    def get_queryset(self):
        query_string = self.request.query_params.get('work_package', None)
        queryset = ProductivityInfo.objects \
            .select_related('datainfo_ptr') \
            .prefetch_related('work_package') \
            .all()

        if query_string:
            work_packages = [query_string] if not isinstance(query_string, list) else query_string
            return queryset.filter(work_package__in=work_packages)
        return queryset
