from django.urls import path
from .views import EmpresaListAPIView

urlpatterns = [
    path('', EmpresaListAPIView.as_view(), name='empresa-list-api'),
]