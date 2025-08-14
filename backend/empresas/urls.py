from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmpresaListAPIView, EmpresaDetailAPIView, RegisterView,
    LoginView, MyEmpresaAPIView, ProdutoViewSet
)

# Cria um roteador e regista o nosso ViewSet de produtos
router = DefaultRouter()
router.register(r'produtos', ProdutoViewSet, basename='produto')

# As nossas URLs antigas continuam aqui
urlpatterns = [
    path('', EmpresaListAPIView.as_view(), name='empresa-list-api'),
    path('<int:pk>/', EmpresaDetailAPIView.as_view(), name='empresa-detail-api'),
    path('register/', RegisterView.as_view(), name='register-api'),
    path('login/', LoginView.as_view(), name='login-api'),
    path('my-empresa/', MyEmpresaAPIView.as_view(), name='my-empresa-api'),

    # Adiciona as URLs geradas pelo roteador (/produtos/, /produtos/1/, etc.)
    path('', include(router.urls)),
]