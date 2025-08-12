from django.urls import path
from .views import EmpresaListAPIView, EmpresaDetailAPIView, RegisterView # Importe a RegisterView

urlpatterns = [
    path('', EmpresaListAPIView.as_view(), name='empresa-list-api'),
    path('<int:pk>/', EmpresaDetailAPIView.as_view(), name='empresa-detail-api'),
    path('register/', RegisterView.as_view(), name='register-api'), # Adicione esta linha
]