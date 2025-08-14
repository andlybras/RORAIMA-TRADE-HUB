from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmpresaListAPIView,
    EmpresaDetailAPIView,
    RegisterView,
    LoginView,
    MyEmpresaAPIView,
    ProdutoViewSet # Importe o nosso novo ViewSet
)

# Cria um roteador
router = DefaultRouter()
# Regista o nosso ProdutoViewSet com o roteador
router.register(r'produtos', ProdutoViewSet, basename='produto')

# As nossas URLs antigas para as empresas continuam as mesmas
urlpatterns = [
    path('', EmpresaListAPIView.as_view(), name='empresa-list-api'),
    path('<int:pk>/', EmpresaDetailAPIView.as_view(), name='empresa-detail-api'),
    path('register/', RegisterView.as_view(), name='register-api'),
    path('login/', LoginView.as_view(), name='login-api'),
    path('my-empresa/', MyEmpresaAPIView.as_view(), name='my-empresa-api'),

    # Adiciona as URLs geradas automaticamente pelo roteador para os produtos
    path('', include(router.urls)),
]