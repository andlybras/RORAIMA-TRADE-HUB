from django.db import models
from django.contrib.auth.models import User

class Empresa(models.Model):
    # Campos baseados no nosso formulário de registro e perfil
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    razao_social = models.CharField(max_length=255)
    nome_fantasia = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=18, unique=True)
    inscricao_estadual = models.CharField(max_length=20, blank=True, null=True) # Campo opcional
    responsavel_nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    contatos = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True) # Para textos longos

    # Campos gerenciados automaticamente pelo Django
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome_fantasia
    
# Adicione esta nova classe no final do ficheiro
class Produto(models.Model):
    # Ligação: Cada produto pertence a uma empresa.
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='produtos')

    # Atributos do produto, baseados no MVP
    nome = models.CharField(max_length=255) # [cite: 345]
    descricao = models.TextField()
    # Para a foto, começaremos com um placeholder. A implementação de upload de imagens é um passo futuro.
    foto_placeholder = models.CharField(max_length=100, blank=True)
    ncm_hs = models.CharField(max_length=50, blank=True) # [cite: 348]
    certificacoes = models.CharField(max_length=255, blank=True) # [cite: 349]
    ativo = models.BooleanField(default=True) # [cite: 351]

    # Campos de data automáticos
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome