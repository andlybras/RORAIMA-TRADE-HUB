from django.db import models
from django.contrib.auth.models import User

class CNAE(models.Model):
    codigo = models.CharField(max_length=10, unique=True, help_text="Código da subclasse CNAE, ex: 01.11-3/01")
    denominacao = models.CharField(max_length=255, help_text="Denominação da subclasse CNAE")

    def __str__(self):
        return f"{self.codigo} - {self.denominacao}"

    class Meta:
        verbose_name = "CNAE"
        verbose_name_plural = "CNAEs"
        ordering = ['codigo']

class NCMSeção(models.Model):
    codigo = models.CharField(max_length=4, unique=True, verbose_name="Código da Seção")
    descricao = models.TextField(verbose_name="Descrição")

    def __str__(self):
        return f"Seção {self.codigo} - {self.descricao}"

class NCMCapítulo(models.Model):
    secao = models.ForeignKey(NCMSeção, on_delete=models.CASCADE, related_name='capitulos')
    codigo = models.CharField(max_length=2, unique=True, verbose_name="Código do Capítulo")
    descricao = models.TextField(verbose_name="Descrição")

    def __str__(self):
        return f"Capítulo {self.codigo} - {self.descricao}"

class NCMPosição(models.Model):
    capitulo = models.ForeignKey(NCMCapítulo, on_delete=models.CASCADE, related_name='posicoes')
    codigo = models.CharField(max_length=4, unique=True, verbose_name="Código da Posição")
    descricao = models.TextField(verbose_name="Descrição")

    def __str__(self):
        return f"Posição {self.codigo} - {self.descricao}"

# Vamos simplificar Subposição e Item em um único modelo para o NCM de 8 dígitos
class NCMItem(models.Model):
    posicao = models.ForeignKey(NCMPosição, on_delete=models.CASCADE, related_name='itens')
    codigo = models.CharField(max_length=8, unique=True, verbose_name="Código do Item (NCM 8 dígitos)")
    descricao = models.TextField(verbose_name="Descrição")

    def __str__(self):
        return f"NCM {self.codigo} - {self.descricao}"
        
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
    cnae_principal = models.ForeignKey(CNAE, on_delete=models.PROTECT, related_name='empresas_como_principal', verbose_name="CNAE Principal", null=True, blank=True)
    cnaes_secundarios = models.ManyToManyField(CNAE, blank=True, related_name='empresas_como_secundario', verbose_name="CNAEs Secundários")
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

class Produto(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='produtos')
    nome = models.CharField(max_length=255)
    
    # Substituímos os campos antigos de NCM por uma conexão direta com nosso dicionário
    ncm = models.ForeignKey(NCMItem, on_delete=models.PROTECT, related_name='produtos', verbose_name="NCM do Produto", null=True, blank=True)
    
    # O campo 'certificacoes' pode continuar se você quiser adicionar outras além das vinculadas ao NCM
    certificacoes = models.TextField(blank=True, null=True)
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome

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