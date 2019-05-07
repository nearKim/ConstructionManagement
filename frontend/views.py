from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
import os

from rest_framework.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_200_OK, HTTP_400_BAD_REQUEST


def index(request):
    return render(request, 'frontend/index.html')


def planned_schedule(request):
    return render(request, 'frontend/planned_schedule.html')


def chart(request):
    return render(request, 'frontend/chart.html')


@csrf_exempt
def flushdb(request):
    if request.method == 'DELETE':
        try:
            cmd = 'python3 manage.py flush --noinput'
            os.system(cmd)
        except Exception as e:
            return HttpResponse(status=500)
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)
