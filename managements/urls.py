from django.urls import path, include
from rest_framework.routers import DefaultRouter
from managements import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'activities', views.ActivityViewSet, basename='activity')
router.register(r'work-packages', views.WorkPackageViewSet, basename='work-package')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]