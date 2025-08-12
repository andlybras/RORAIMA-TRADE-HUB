from django.shortcuts import render

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