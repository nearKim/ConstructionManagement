import io
import pandas as pd
from django.db import IntegrityError
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.status import HTTP_207_MULTI_STATUS

from ConstructionManagement.helper import batch_create_workpackages
from plannedschedules.serializers import *
from rest_framework import views, viewsets, status


class PlannedScheduleCSVimportAPIView(views.APIView):
    def post(self, request, format=None):
        # PlannedActivity csv파일과 ActivityResource파일을 받아서 변수에 저장한다.
        planned_activity = request.FILES.get('planned_activity', None)
        activity_resource = request.FILES.get('activity_resource', None)

        # 파일이 하나라도 없으면 404를 띄운다
        if not planned_activity or not activity_resource:
            return Response(data={'error': 'Lack of Files'}, status=status.HTTP_404_NOT_FOUND)

        decoded_file_planned = planned_activity.read().decode('utf-8')
        decoded_file_resource = activity_resource.read().decode('utf-8')
        io_file_planned = io.StringIO(decoded_file_planned)
        io_file_resource = io.StringIO(decoded_file_resource)

        non_work_packages = ['activityID', 'WBSID', 'activityName' 'Original Duration(d)', 'resourceID', 'quantity']

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

        print(df)
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
                    duration=row['Original Duration(d)'],
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
