from django.urls import path
from .views import (
    EmpresaListAPIView,
    EmpresaDetailAPIView,
    RegisterView,
    LoginView,
    MyEmpresaAPIView
)

urlpatterns = [
    path('', EmpresaListAPIView.as_view(), name='empresa-list-api'),
    path('<int:pk>/', EmpresaDetailAPIView.as_view(), name='empresa-detail-api'),
    path('register/', RegisterView.as_view(), name='register-api'),
    path('login/', LoginView.as_view(), name='login-api'),
    path('my-empresa/', MyEmpresaAPIView.as_view(), name='my-empresa-api'),
]