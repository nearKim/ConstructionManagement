import io
import os

from django.conf import settings
import pandas as pd
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import IntegrityError
from django.db.models import Case, When, BooleanField
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.status import *

from ConstructionManagement.helper import batch_create_workpackages
from plannedschedules.serializers import *

from rest_framework import views, viewsets, status

INPUT_PATH = os.path.join(os.path.dirname(settings.BASE_DIR), 'import')
EXPORT_PATH = os.path.join(os.path.dirname(settings.BASE_DIR), 'export')


class AllocationFinishView(views.APIView):
    def post(self, request, format=None):
        # Debug가 True이면 403을 반환한다
        if settings.DEBUG:
            return Response(status=HTTP_403_FORBIDDEN, data='You are in DEBUG mode')

        try:
            # Allocation들을 모두 주어진 장소에 저장한다.
            allocations = list(Allocation.objects.all().values('activity_id', 'data_id', 'mode', 'is_productivity'))
            allocation_df = pd.DataFrame(allocations)
            allocation_df.rename(inplace=True, columns={
                'activity_id': 'activityID',
                'data_id': 'dataID',
                'is_productivity': 'isProductivity'
            })

            # Activity, DataInfo를 조합하여 원하는 dataframe을 만든 후
            activities = list(Activity.objects.all().values('activity_id', 'project_id', 'duration', 'productivity', 'data_id'))
            activity_df = pd.DataFrame(activities)

            datas = list(DataInfo.objects.annotate(
                is_productivity=Case(
                    When(use_duration=True, then=False),
                    When(use_duration=False, then=True),
                    output_field=BooleanField()
                )
            ).values('data_id', 'is_productivity'))
            data_df = pd.DataFrame(datas)
            merged_df = pd.merge(activity_df, data_df, how='inner', on='data_id')
            merged_df.rename(inplace=True, columns={
                "activity_id": "activityID",
                "data_id": "dataID",
                "project_id": "projectID",
                "is_productivity": "isProductivity"
            })

            # 원하는 곳에 CSV로 저장
            allocation_df.to_csv(os.path.join(INPUT_PATH, 'connection.csv'))
            merged_df.to_csv(os.path.join(INPUT_PATH, 'actualDB.csv'))

        except Exception as e:
            print(e)
            return Response(HTTP_500_INTERNAL_SERVER_ERROR, data=e)
        return Response(HTTP_200_OK, data='success')


class PlannedScheduleCSVimportAPIView(views.APIView):
    def post(self, request, format=None):
        # PlannedActivity csv파일과 ActivityResource파일을 받아서 변수에 저장한다.
        planned_activity = request.FILES.get('planned_activity', None)
        activity_resource = request.FILES.get('activity_resource', None)

        # 파일이 하나라도 없으면 404를 띄운다
        if not planned_activity or not activity_resource:
            return Response(data={'error': 'Lack of Files'}, status=status.HTTP_404_NOT_FOUND)

        # Production 상황에서는 들어온 파일들을 지정된 장소에 저장한다.
        if not settings.DEBUG:
            default_storage.save(os.path.join(INPUT_PATH, 'dependency.csv'), ContentFile(planned_activity.read()))
            default_storage.save(os.path.join(INPUT_PATH, 'resource.csv'), ContentFile(activity_resource.read()))

        decoded_file_planned = planned_activity.read().decode('utf-8')
        decoded_file_resource = activity_resource.read().decode('utf-8')
        io_file_planned = io.StringIO(decoded_file_planned)
        io_file_resource = io.StringIO(decoded_file_resource)

        non_work_packages = ['activityID', 'WBSID', 'activityName' 'duration', 'resourceID', 'quantity']

        # pandas dataframe으로 모두 변환한다
        planned_df = pd.read_csv(io_file_planned)
        resource_df = pd.read_csv(io_file_resource)

        # planned activity 중에 work_packge인 것과 아닌 것을 구분하여 work_package들을 만든다.
        parent_packages = batch_create_workpackages(planned_df[planned_df.columns.difference(non_work_packages)])

        # 파싱 결과를 넣어줄 dictionary를 초기화하고 200여부를 판단할 flag도 초기화한다.
        result = {
            'success': [],
            'integrity_error': [],
            'value_error': [],
            'unknown_error': []
        }
        status_200 = True

        # 두 dataframe을 activity_id기준으로 outer join한다. 빈값은 None으로 채운다
        df = pd.merge(planned_df, resource_df, how='outer')

        # PlannedSchedule을 생성한다.
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
                p, created = PlannedSchedules.objects.update_or_create(
                    activity_id=row['activityID'],
                    wbs_id=row['WBSID'],
                    name=row['activityName'],
                    duration=row['duration'],
                    resource_id=row['resourceID'],
                    quantity=row['quantity'],
                    data=None
                )
                p.work_package.add(*parent_packages, *child_packages)
                if created:
                    result['success'].append(index)
            except IntegrityError as e1:
                print(e1)
                status_200 = False
                result['integrity_error'].append(index)
            except ValueError as e2:
                print(e2)
                status_200 = False
                result['value_error'].append(index)
            except Exception as e:
                print(e)
                status_200 = False
                result['unknown_error'].append(index)

        # dataframe 자체를 json 형식으로 리턴한다
        result = {k: df[df.index.map(lambda x: x in v)].to_json(orient='records') for k, v in result.items()}

        if status_200:
            return Response(data=result)
        else:
            return Response(status=HTTP_207_MULTI_STATUS, data=result)


class PlannedScheduleViewSet(viewsets.ModelViewSet):

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return PlannedScheduleRetrieveListSerializer
        else:
            return PlannedScheduleCreateUpdateSerializer

    def get_queryset(self):
        query_string = self.request.query_params.get('work_package', None)
        queryset = PlannedSchedules.objects \
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

    @action(detail=True, methods=['GET'])
    def work_packages(self, request, pk=None):
        work_packages = self.get_object().work_package.all()
        serializer = WorkPackageSerializer(work_packages, many=True)
        return Response(serializer.data)


class AllocationViewSet(viewsets.ModelViewSet):
    serializer_class = AllocationSerializer

    def get_queryset(self):
        return Allocation.objects \
            .select_related('activity') \
            .prefetch_related('data') \
            .all()

    def create(self, request, *args, **kwargs):
        # 현재 들어온 모든 데이터를 뽑아낸다
        activity_ids = request.data.get('activity', None)
        data_id = request.data.get('data', None)
        is_productivity = request.data.get('is_productivity', None)
        mode = request.data.get('mode', None)

        # 사용할 객체들을 가져온다
        planned_schedules = PlannedSchedules.objects.filter(activity_id__in=activity_ids)
        data = DataInfo.objects.get(data_id=data_id)

        # PlannedSchedule의 data를 업데이트한다
        planned_schedules.update(data=data)

        # activityId들을 이용하여 bulk create한다
        allocation_list = list(
            map(lambda p: Allocation(activity=p, data=data, is_productivity=not data.use_duration, mode=mode),
                planned_schedules))
        allocations = Allocation.objects.bulk_create(allocation_list)

        # 결과를 직렬화하여 던져준다
        serializer = AllocationSerializer(allocations, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
