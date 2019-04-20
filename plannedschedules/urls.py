from django.urls import path, include
from rest_framework.routers import DefaultRouter
from plannedschedules import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'planned-schedules', views.PlannedScheduleViewSet, basename='planned')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('planned-schedules/csv-import/', views.PlannedScheduleCSVimportAPIView.as_view())
]