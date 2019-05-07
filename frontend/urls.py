from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('eliminate/', views.flushdb),
    path('planned-schedule/', views.planned_schedule),
    path('chart/', views.chart),
]
