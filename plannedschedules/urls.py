from django.urls import path, include
from rest_framework.routers import DefaultRouter
from plannedschedules import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'planned-schedules', views.PlannedScheduleViewSet, basename='planned')
router.register(r'allocations', views.AllocationViewSet, basename='planned')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    # csv-import가 반드시 먼저 와야 한다
    path('histogram/', views.HistogramView.as_view()),
    path('planned-schedules/csv-import/', views.PlannedScheduleCSVimportAPIView.as_view()),
    path('allocations/finish/', views.AllocationFinishView.as_view()),
    path('', include(router.urls)),
]
