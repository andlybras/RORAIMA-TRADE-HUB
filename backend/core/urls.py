from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.homepage, name='homepage'),
    path('comprar/', views.comprar, name='comprar'),
    path('resultados/', views.resultados, name='resultados'),
    path('empresa/', views.empresa, name='empresa'),
    path('vender/', views.vender, name='vender'),
    path('registro/', views.registro, name='registro'),
    path('login/', views.login, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('perfil/', views.perfil, name='perfil'),
    path('vitrine/', views.vitrine, name='vitrine'),
    path('suporte/', views.suporte, name='suporte'),
    path('comecar-a-exportar/', views.comecar_a_exportar, name='comecar-a-exportar'),
    path('inteligencia-mercado/', views.inteligencia_mercado, name='inteligencia-mercado'),
    path('acordos/', views.acordos, name='acordos'),
    path('oportunidades/', views.oportunidades, name='oportunidades'),
    path('destino-roraima/', views.destino_roraima, name='destino-roraima'),
    path('politica-privacidade/', views.politica_privacidade, name='politica-privacidade'),
    path('termos-de-uso/', views.termos_de_uso, name='termos-de-uso'),
    path('acessibilidade/', views.acessibilidade, name='acessibilidade'),
    path('cursos/', views.cursos, name='cursos'),
    path('perguntas-frequentes/', views.perguntas_frequentes, name='perguntas-frequentes'),
    path('api/empresas/', include('empresas.urls')),
    path('api/cursos/', include('cursos.urls')),
]

# --- LINHA MÁGICA PARA SERVIR FICHEIROS DE MÍDIA EM DESENVOLVIMENTO ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)