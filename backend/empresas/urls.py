from django.urls import path
from .views import EmpresaListAPIView, EmpresaDetailAPIView

urlpatterns = [
    path('', EmpresaListAPIView.as_view(), name='empresa-list-api'),
    path('<int:pk>/', EmpresaDetailAPIView.as_view(), name='empresa-detail-api'),
]