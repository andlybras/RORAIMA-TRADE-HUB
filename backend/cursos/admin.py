from django.contrib import admin
from .models import Curso, Licao # Importa os nossos novos modelos

# Register your models here.

# Diz ao Django para mostrar os modelos Curso e Licao no painel de admin
admin.site.register(Curso)
admin.site.register(Licao)