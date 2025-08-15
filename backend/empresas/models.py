from django.db import models
from django.contrib.auth.models import User

class Empresa(models.Model):
    # ---- CAMPOS EXISTENTES ----
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='empresa')
    razao_social = models.CharField(max_length=255)
    nome_fantasia = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=18, unique=True)
    responsavel_nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    contatos = models.CharField(max_length=100) # Este campo guardará o "Contato Telefônico"
    descricao = models.TextField(blank=True, null=True)
    logomarca = models.ImageField(upload_to='logomarcas/', blank=True, null=True)
    
    # ---- NOVOS CAMPOS DO FORMULÁRIO ----
    cnae = models.CharField("CNAE", max_length=20, blank=True)
    inscricao_estadual = models.CharField(max_length=20, blank=True, null=True)
    endereco_sede = models.CharField("Endereço da Sede", max_length=255, blank=True)
    responsavel_funcao = models.CharField("Função do Responsável", max_length=100, blank=True)

    # ---- NOVOS CAMPOS DE CONTROLE (MUITO IMPORTANTE!) ----
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('ATIVO', 'Ativo'),
        ('INDEFERIDO', 'Indeferido'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDENTE')
    justificativa_indeferimento = models.TextField(blank=True, null=True)

    # ---- CAMPOS DE DATA (JÁ EXISTIAM) ----
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome_fantasia

# ESTA É A VERSÃO ÚNICA E CORRETA DA CLASSE PRODUTO
class Produto(models.Model):
    # Ligação: Cada produto pertence a uma empresa.
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='produtos')

    # Atributos do produto, baseados no MVP
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True) # Descrição é opcional
    # Para a foto, começaremos com um placeholder.
    foto_placeholder = models.CharField(max_length=100, blank=True)
    ncm_hs = models.CharField("NCM/HS", max_length=50, blank=True)
    certificacoes = models.CharField(max_length=255, blank=True)
    ativo = models.BooleanField(default=True)

    # Campos de data automáticos
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"

    def __str__(self):
        return self.nome
# Adicione estas duas novas classes abaixo delas

class CategoriaFAQ(models.Model):
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome da Categoria")

    class Meta:
        verbose_name = "Categoria de FAQ"
        verbose_name_plural = "Categorias de FAQ"

    def __str__(self):
        return self.nome

class PerguntaFAQ(models.Model):
    categoria = models.ForeignKey(CategoriaFAQ, on_delete=models.CASCADE, related_name='perguntas', verbose_name="Categoria")
    pergunta = models.CharField(max_length=255, verbose_name="Pergunta")
    resposta = models.TextField(verbose_name="Resposta")
    ativa = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Pergunta Frequente"
        verbose_name_plural = "Perguntas Frequentes"

    def __str__(self):
        return self.pergunta