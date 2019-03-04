import csv
import io

import pandas as pd
from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.status import HTTP_207_MULTI_STATUS

from ConstructionManagement.helper import batch_create_workpackages
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

    @action(detail=False, methods=['POST'])
    def csv_import(self, request):
        file = request.FILES.get('file', None)
        # 파일이 없으면 404를 띄운다
        if not file:
            return Response(content={'error': 'No file submitted'}, status=status.HTTP_404_NOT_FOUND)
        decoded_file = file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)

        # FIXME: name, description을 추가한 리스트로 교체하기
        # STANDARD = ['activityID','name', 'description', 'projectID', 'duration', 'productivity', 'resourceID', 'numofLabour']
        STANDARD = ['activityID', 'projectID', 'duration', 'productivity', 'resourceID', 'numofLabour']

        df = pd.read_csv(io_string)

        # 먼저 WorPackage 컬럼만으로 구성된 dataframe을 사용해서 WorkPackage들을 생성하고 대분류를 가져온다.
        parent_packages = batch_create_workpackages(df[df.columns.difference(STANDARD)])

        # 파싱 결과를 넣어줄 dictionary를 초기화하고 200여부를 판단할 flag도 초기화한다.
        result = {
            'success': [],
            'integrity_error': [],
            'value_error': [],
            'unknown_error': []
        }
        status_200 = True

        for index, row in df.iterrows():
            # 지금 iteration 돌고있는 row에 해당하는 소분류 Work Package 리스트를 모은다.
            child_packages = list(
                map(
                    lambda p: WorkPackage.objects.get(parent_package=p, package=row[p.package]),
                    parent_packages
                )
            )
            try:
                # Activity를 생성하면서 대분류, 소분류를 모두 넣어준다.
                Activity.objects.update_or_create(
                    activity_id=row['activityID'],
                    # FIXME: name, description, quantity 대체하기
                    name='TEMP_NAME',
                    description='TEMP_DESCRIPTION',
                    duration=row['duration'],
                    quantity=10,
                    productivity=row['productivity'],
                    labor_cnt=row['numofLabour'],
                    project_id=row['projectID'],
                    resource_id=row['resourceID'],
                    data=None
                ).add(*parent_packages, *child_packages)

                result['success'].append(index)

            except IntegrityError as e1:
                status_200 = False
                result['integrity_error'].append(index)
            except ValueError as e2:
                status_200 = False
                result['value_error'].append(index)
            except Exception as e:
                print(e)
                status_200 = False
                result['unknown_error'].append(index)

        # 결과(Key)에 따라 Dataframe을 쪼갠 후 json으로 변환한다
        result = {k: df[df.index.map(lambda x: x in v)].to_json(orient='records') for k, v in result.items()}

        if status_200:
            return Response(data=result)
        else:
            return Response(status=HTTP_207_MULTI_STATUS, data=result)


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
