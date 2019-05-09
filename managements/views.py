import csv
import io
import json

import pandas as pd
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, detail_route
from rest_framework.response import Response
from rest_framework.status import HTTP_207_MULTI_STATUS, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR, HTTP_200_OK

from ConstructionManagement.constants import InfoType
from ConstructionManagement.helper import batch_create_workpackages, generate_data_id
from informations.models import DurationInfo, ProductivityInfo
from informations.serializers import ProductivityInfoSerializer, DurationInfoSerializer
from managements.models import *
from managements.serializers import (
    ActivityCreateUpdateSerializer,
    ActivityRetrieveListSerializer,
    WorkPackageSerializer,
)


class ActivityViewSet(viewsets.ModelViewSet):

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ActivityRetrieveListSerializer
        else:
            return ActivityCreateUpdateSerializer

    def get_queryset(self):
        query_string = self.request.query_params.get('work_package', None)
        queryset = Activity.objects \
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

    @action(detail=False, methods=['DELETE'])
    def delete(self, request):
        Activity.objects.filter(data=None).delete()
        return Response(HTTP_200_OK)

    @action(detail=True, methods=['GET'])
    def work_packages(self, request, pk=None):
        work_packages = self.get_object().work_package.all()
        serializer = WorkPackageSerializer(work_packages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'], url_path='information(?:/(?P<data_id>[a-zA-Z0-9_]+))?')
    def information(self, request, pk=None, data_id=None):
        # Activity와 activity가 가지고 있는 work package들을 불러온다
        activity = self.get_object()
        work_packages = activity.work_package.all()

        # Querystring 및 데이터들을 갖고온다
        link = json.loads(request.query_params.get('link', 'false'))
        value_type = request.query_params.get('type', None)
        description = request.data.get('description', '')

        # DataInfo의 ID를 지정한다
        id_root = generate_data_id(work_packages) + str(DataInfo.objects.count())

        # link가 없거나 false인 경우 새로 DataInfo를 생성하는 것이다.
        if not link:
            # type이 없으면 400을 띄운다.
            if not value_type:
                return Response(status=HTTP_400_BAD_REQUEST, data='No type')
            if value_type == InfoType.PRODUCTIVITY:
                # type이 productivity라면 ProductivityInfo를 생성한다.
                data = ProductivityInfo.objects.create(
                    data_id='p-' + id_root,
                    data_cnt=1,
                    mean=activity.productivity,
                    maximum=activity.productivity,
                    minimum=activity.productivity,
                    use_duration=False,
                    description=description
                )
                serializer = ProductivityInfoSerializer(data)
            elif value_type == InfoType.DURATION:
                # type이 duration이라면 DurationInfo를 생성한다.
                data = DurationInfo.objects.create(
                    data_id='d-' + id_root,
                    data_cnt=1,
                    mean=activity.duration,
                    maximum=activity.duration,
                    minimum=activity.duration,
                    use_duration=True,
                    description=description
                )
                serializer = DurationInfoSerializer(data)
            # work_package 등록
            data.work_package.add(*work_packages)

            # activity의 data 정보 업데이트
            activity.data = data
            activity.save()
            return Response(serializer.data)
        else:
            # link가 존재하는 경우 기존의 DataInfo와 링크하는 것이다.
            data = get_object_or_404(DataInfo, data_id=data_id)

            # Information의 use_duration 플래그는 현재 들어온 Activity의 타입과 반드시 일치해야 한다.
            if value_type == InfoType.DURATION and not data.use_duration:
                return Response(status=HTTP_400_BAD_REQUEST,
                                data='ProductivityInfo cannot be updated with Duration type.')
            elif value_type == InfoType.PRODUCTIVITY and data.use_duration:
                return Response(status=HTTP_400_BAD_REQUEST,
                                data='DurationInfo cannot be updated with Productivity type.')


            # activity의 data 정보 업데이트
            activity.data = data
            activity.save()

            # 데이터 갯수는 어떠한 경우에도 업데이트 한다
            data.data_cnt = data.data_cnt + 1
            # Data를 업데이트할 타겟 값은 type에 따라 다르게 선택한다
            # FIXME: 엉뚱한 문자열도 Productivity로 진행할 가능성이 있다
            target_value = activity.duration if value_type == InfoType.DURATION else activity.productivity

            # mean, max, min을 모두 업데이트 한다
            data.mean = (data.mean * (data.data_cnt - 1) + target_value) / data.data_cnt
            data.maximum = max(data.maximum, target_value)
            data.minimum = min(data.minimum, target_value)

            # 데이터 업데이트
            data.save()

            # 리스폰스로 던져주기 위한 데이터 serialization
            if isinstance(data.cast(), DurationInfo):
                serializer = DurationInfoSerializer(data)
            elif isinstance(data.cast(), ProductivityInfo):
                serializer = ProductivityInfoSerializer(data)
            else:
                # Dangling BaseClass...
                return Response(data={'error': 'No superclass for input data found. Check your DB data.'},
                                status=status.HTTP_404_NOT_FOUND)
            return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def csv_import(self, request):
        file = request.FILES.get('file', None)
        # 파일이 없으면 404를 띄운다
        if not file:
            return Response(data={'error': 'No file submitted'}, status=status.HTTP_404_NOT_FOUND)
        decoded_file = file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)

        non_work_packages = ['activityID', 'name', 'description', 'project', 'duration', 'productivity', 'resource',
                             'numofLabour', 'quantity']

        df = pd.read_csv(io_string)

        # 먼저 WorkPackage 컬럼만으로 구성된 dataframe을 사용해서 WorkPackage들을 생성하고 대분류를 가져온다.
        parent_packages = batch_create_workpackages(df[df.columns.difference(non_work_packages)])

        # 파싱 결과를 넣어줄 dictionary를 초기화하고 200여부를 판단할 flag도 초기화한다.
        result = {
            'success': [],
            'integrity_error': [],
            'value_error': [],
            'unknown_error': []
        }
        status_200 = True

        for index, row in df.iterrows():
            # 지금 iteration 돌고있는 row에 해당하는 소분류 Work Package 리스트를 모은다. 이 때 nan이라면 무시한다.
            child_packages = list(
                map(
                    lambda p: WorkPackage.objects.get(parent_package=p,
                                                      package_name=row[p.package_name]) if not pd.isna(
                        row[p.package_name]) else None,
                    parent_packages
                )
            )
            try:
                # quantity가 Null이거나 Nan이라면 명시적으로 None을 넣어준다
                quantity = None if pd.isnull(row['quantity']) or pd.isna(row['quantity']) else row['quantity']
                productivity = row['quantity'] / row['duration'] if quantity else None

                # Activity를 생성하면서 대분류, 소분류를 모두 넣어준다.
                a, created = Activity.objects.update_or_create(
                    activity_id=row['activityID'],
                    name=row['name'],
                    description=row['description'],
                    duration=row['duration'],
                    quantity=quantity,
                    productivity=productivity,
                    labor_cnt=row['numofLabour'],
                    project=row['project'],
                    resource=row['resource'],
                    data=None
                )
                a.work_package.add(*parent_packages, *child_packages)
                if created:
                    result['success'].append(index)

            except IntegrityError as e1:
                # work package가 null일 경우
                status_200 = False
                result['integrity_error'].append(index)
            except ValueError as e2:
                # Nan 등이 들어온 경우
                status_200 = False
                result['value_error'].append(index)
            except Exception as e:
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

