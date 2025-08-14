from django.urls import path
from .views import CursoListAPIView, CursoDetailAPIView

urlpatterns = [
    path('', CursoListAPIView.as_view(), name='curso-list-api'),
    path('<int:pk>/', CursoDetailAPIView.as_view(), name='curso-detail-api'),
]