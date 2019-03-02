from django.urls import path, include
from rest_framework.routers import DefaultRouter
from managements import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet)
router.register(r'activities', views.ActivityViewSet)
router.register(r'resources', views.ResourceViewSet)
router.register(r'work-packages', views.WorkPackageViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]