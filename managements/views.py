from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response

from managements.models import *
from managements.serializers import ProjectBaseSerializer, ActivityCreateUpdateSerializer, \
    ActivityRetrieveListSerializer, WorkPackageSerializer, ResourceRetrieveListSerializer, \
    ResourceCreateUpdateSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectBaseSerializer


class ActivityViewSet(viewsets.ModelViewSet):

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ActivityRetrieveListSerializer
        else:
            return ActivityCreateUpdateSerializer

    def get_queryset(self):
        query_string = self.request.query_params.get('work_package', None)
        queryset = Activity.objects \
            .select_related('project') \
            .prefetch_related('resource') \
            .prefetch_related('work_package') \
            .all()

        if query_string:
            work_packages = [query_string] if not isinstance(query_string, list) else query_string
            return queryset.filter(work_package__in=work_packages)
        return queryset

    def update(self, request, *args, **kwargs):
        # PATCH와 PUT을 통합한다
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)


class WorkPackageViewSet(viewsets.ModelViewSet):
    queryset = WorkPackage.objects \
        .select_related('parent_package') \
        .all()
    serializer_class = WorkPackageSerializer

    def update(self, request, *args, **kwargs):
        # PATCH와 PUT을 통합한다
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)


class ResourceViewSet(viewsets.ModelViewSet):
    # queryset = Resource.objects.all()

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return ResourceRetrieveListSerializer
        else:
            return ResourceCreateUpdateSerializer

    def get_queryset(self):
        query_string = self.request.query_params.get('work_package', None)
        if query_string:
            work_packages = [query_string] if not isinstance(query_string, list) else query_string
            return Resource.objects.filter(work_package__in=work_packages).all()
        return Resource.objects.all()

    def update(self, request, *args, **kwargs):
        # PATCH와 PUT을 통합한다
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
