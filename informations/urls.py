from django.urls import path, include
from rest_framework.routers import DefaultRouter
from informations import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'duration-infos', views.DurationInfoViewSet, basename='duration-info')
router.register(r'productivity-infos', views.ProductivityInfoViewSet, basename='productivity-info')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]