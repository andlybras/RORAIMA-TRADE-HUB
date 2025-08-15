from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Empresa, Produto

# Serializer principal para a Empresa
class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

# Serializer para o registo de um novo Utilizador
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

# empresas/serializers.py

# ... (O resto do seu arquivo, UserSerializer etc., continua igual) ...

# Serializer específico para ATUALIZAR o perfil da empresa
class EmpresaProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        # Agora incluímos TODOS os campos que queremos mostrar na página
        fields = [
            'razao_social', 
            'cnpj', 
            'nome_fantasia', 
            'descricao',
            'logomarca',
            # --- CAMPOS ADICIONADOS ---
            'cnae',
            'inscricao_estadual',
            'endereco_sede',
            'responsavel_nome',
            'responsavel_funcao',
            'email',
            'contatos',
        ]
        # E aqui, listamos TODOS os campos que NÃO SÃO editáveis pelo usuário.
        # Deixamos de fora apenas 'nome_fantasia', 'descricao' e 'logomarca'.
        read_only_fields = [
            'razao_social', 
            'cnpj',
            'cnae',
            'inscricao_estadual',
            'endereco_sede',
            'responsavel_nome',
            'responsavel_funcao',
            'email',
            'contatos',
        ]

# ... (Seu ProdutoSerializer continua aqui) ...
        
class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        # Vamos traduzir todos os campos do nosso modelo Produto
        fields = '__all__'
        read_only_fields = ['empresa']