from django.shortcuts import render
from empresas.models import CategoriaFAQ

def homepage(request):
    return render(request, 'index.html')

def comprar(request):
    return render(request, 'comprar.html')

def resultados(request):
    return render(request, 'resultados.html')

def empresa(request):
    return render(request, 'empresa.html')

def vender(request):
    return render(request, 'vender.html')

def registro(request):
    return render(request, 'registro.html')

def login(request):
    return render(request, 'login.html')

def dashboard(request):
    return render(request, 'dashboard.html')

def perfil(request):
    return render(request, 'perfil.html')

def vitrine(request):
    return render(request, 'vitrine.html')

def suporte(request):
    return render(request, 'suporte.html')

def comecar_a_exportar(request):
    return render(request, 'comecar-a-exportar.html')

def inteligencia_mercado(request):
    return render(request, 'inteligencia-mercado.html')

def acordos(request):
    return render(request, 'acordos.html')

def oportunidades(request):
    return render(request, 'oportunidades.html')

def destino_roraima(request):
    return render(request, 'destino-roraima.html')
# Adicione estas 3 funções no final de views.py
def politica_privacidade(request):
    return render(request, 'politica-privacidade.html')

def termos_de_uso(request):
    return render(request, 'termos-de-uso.html')

def acessibilidade(request):
    return render(request, 'acessibilidade.html')

def cursos(request):
    return render(request, 'cursos.html')

# Adicione esta função no final do arquivo
def perguntas_frequentes(request):
    # Buscamos todas as categorias que têm perguntas ativas associadas a elas.
    # O prefetch_related é um truque de performance: ele busca todas as perguntas
    # de uma vez só, evitando múltiplas consultas ao banco de dados dentro do template.
    categorias = CategoriaFAQ.objects.prefetch_related('perguntas').filter(perguntas__ativa=True).distinct()
    
    context = {
        'categorias': categorias
    }
    return render(request, 'perguntas-frequentes.html', context)