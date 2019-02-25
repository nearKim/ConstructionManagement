from django.shortcuts import render
from rest_framework import viewsets

from managements.models import *
from managements.serializers import ProjectBaseSerializer, ActivityFullSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectBaseSerializer


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects \
        .select_related('project') \
        .prefetch_related('resource') \
        .prefetch_related('work_package') \
        .all()
    serializer_class = ActivityFullSerializer

    # def retrieve(self, request, *args, **kwargs):
    #     print("fuck!")
    #     print(request.query_params)
    #     print(args)
    #     print(kwargs)

