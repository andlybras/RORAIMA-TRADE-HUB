from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmpresaListAPIView, EmpresaDetailAPIView, RegisterView,
    LoginView, MyEmpresaAPIView, ProdutoViewSet, CNAEListAPIView, NCMSeçãoListView, NCMCapítuloListView, NCMPosiçãoListView, NCMItemListView
)

app_name = 'empresas'

# Cria um roteador e regista o nosso ViewSet de produtos
router = DefaultRouter()
router.register(r'produtos', ProdutoViewSet, basename='produto')

# As nossas URLs antigas continuam aqui
urlpatterns = [
    path('cnaes/', CNAEListAPIView.as_view(), name='cnae-list-api'),
    path('ncm/secoes/', NCMSeçãoListView.as_view(), name='ncm-secao-list'),
    path('ncm/capitulos/', NCMCapítuloListView.as_view(), name='ncm-capitulo-list'),
    path('ncm/posicoes/', NCMPosiçãoListView.as_view(), name='ncm-posicao-list'),
    path('ncm/itens/', NCMItemListView.as_view(), name='ncm-item-list'),
    path('', EmpresaListAPIView.as_view(), name='empresa-list-api'),
    path('<int:pk>/', EmpresaDetailAPIView.as_view(), name='empresa-detail-api'),
    path('register/', RegisterView.as_view(), name='register-api'),
    path('login/', LoginView.as_view(), name='login-api'),
    path('my-empresa/', MyEmpresaAPIView.as_view(), name='my-empresa-api'),

    # Adiciona as URLs geradas pelo roteador (/produtos/, /produtos/1/, etc.)
    path('', include(router.urls)),
]