from django.shortcuts import render


def index(request):
    return render(request, 'frontend/index.html')


def planned_schedule(request):
    return render(request, 'frontend/planned_schedule.html')


def chart(request):
    return render(request, 'frontend/chart.html')
