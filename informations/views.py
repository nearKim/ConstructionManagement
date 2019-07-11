from django.db.models import Sum, Max, Min
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from informations.models import DurationInfo, ProductivityInfo
from informations.serializers import DurationInfoSerializer, ProductivityInfoSerializer
from managements.models import Activity
from managements.serializers import ActivityRetrieveListSerializer


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

    @action(detail=True, methods=['GET', 'POST'])
    def activities(self, request, pk=None):
        if request.method == 'GET':
            # GET으로 요청시 현재 duration info를 생성한 activity들을 반환한다.
            information = self.get_object()
            activities = Activity.objects.filter(data=information)
            serializer = ActivityRetrieveListSerializer(activities, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            # 현재 data와 링크시킬 activity들의 id들을 가져온다
            activity_ids = request.data.get('activities', None)
            description = request.data.get('description', '')
            name = request.data.get('name', '')

            data = self.get_object().datainfo_ptr

            # 만일 링크하라고 activity 중 이미 현재 data에 배정된 경우 빼준다
            activities = Activity.objects.filter(activity_id__in=activity_ids).exclude(data=data)

            # activity가 결과적으로 없을 경우 그냥 아무것도 하지 않는다.
            if activities.count() == 0:
                return Response(HTTP_200_OK)

            # 만일 현재 선택한 데이터가 아닌 데이터와 링크되어있는 액티비티가 들어왔으면 400을 띄운다
            if not len(set(activities.values_list('data', flat=True)) - {None, data.data_id}) == 0:
                return Response(status=HTTP_400_BAD_REQUEST)

            # data의 name, description 업데이트
            data.name = name if name else data.name
            data.description = description if description else data.description

            # 현재 들어온 Activity의 duration 값의 기초 통계량을 구한다
            stat = activities.aggregate(Sum('duration'), Max('duration'), Min('duration'))
            # data 통계량 업데이트
            data.mean = round((data.mean * data.data_cnt + stat['duration__sum']) / \
                              (data.data_cnt + activities.count()), 2)
            data.maximum = max(stat['duration__max'], data.maximum)
            data.minimum = min(stat['duration__min'], data.minimum)
            data.data_cnt = data.data_cnt + activities.count()
            data.save()

            # 현재 들어온 Activity의 data info를 업데이트
            activities.update(data=data)

            # Response로 던져줍시다
            serializer = DurationInfoSerializer(data)
            return Response(serializer.data)


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

    @action(detail=True, methods=['GET', 'POST'])
    def activities(self, request, pk=None):
        if request.method == 'GET':
            # GET으로 요청시 현재 duration info를 생성한 activity들을 반환한다.
            information = self.get_object()
            activities = Activity.objects.filter(data=information)
            serializer = ActivityRetrieveListSerializer(activities, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            # 현재 data와 링크시킬 activity들의 id들을 가져온다
            activity_ids = request.data.get('activities', None)
            data = self.get_object().datainfo_ptr
            description = request.data.get('description', '')
            name = request.data.get('name', '')

            activities = Activity.objects.filter(activity_id__in=activity_ids).exclude(data=data)

            # activity가 결과적으로 없을 경우 그냥 아무것도 하지 않는다.
            if activities.count() == 0:
                return Response(HTTP_200_OK)

            # 만일 현재 선택한 데이터가 아닌 데이터와 링크되어있는 액티비티가 들어왔으면 400을 띄운다
            if not len(set(activities.values_list('data', flat=True)) - {None, data.data_id}) == 0:
                return Response(status=HTTP_400_BAD_REQUEST)

            # 현재 들어온 Activity의 duration 값의 기초 통계량을 구한다
            stat = activities.aggregate(Sum('productivity'), Max('productivity'), Min('productivity'))

            # data의 name, description 업데이트
            data.name = name
            data.description = description

            # data 통계량 업데이트
            data.mean = round((data.mean * data.data_cnt + stat['productivity__sum']) / \
                              (data.data_cnt + len(activity_ids)), 2)
            data.maximum = max(stat['productivity__max'], data.maximum)
            data.minimum = min(stat['productivity__min'], data.minimum)
            data.data_cnt = data.data_cnt + len(activity_ids)
            data.save()

            # 현재 들어온 Activity의 data info를 업데이트
            activities.update(data=data)

            # Response로 던져줍시다
            serializer = ProductivityInfoSerializer(data)
            return Response(serializer.data)
