from django.contrib import admin
from .models import Empresa, Produto  # Importa nosso modelo Empresa que criamos

# Register your models here.

# A linha abaixo registra o modelo Empresa no site de admin
admin.site.register(Empresa)
admin.site.register(Produto)