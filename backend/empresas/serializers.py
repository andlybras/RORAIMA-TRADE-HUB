from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Empresa, Produto, CNAE

# Serializer para o nosso dicionário de CNAEs
class CNAESerializer(serializers.ModelSerializer):
    class Meta:
        model = CNAE
        fields = ['id', 'codigo', 'denominacao']
        
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
# empresas/serializers.py

class EmpresaProfileSerializer(serializers.ModelSerializer):
    # Vamos pedir ao "tradutor" para nos dar o nome completo do CNAE, não apenas o ID
    cnae_principal = serializers.StringRelatedField()
    cnaes_secundarios = serializers.StringRelatedField(many=True)

    class Meta:
        model = Empresa
        fields = [
            'razao_social', 'cnpj', 'nome_fantasia', 'descricao', 'logomarca',
            'cnae_principal', 'cnaes_secundarios', # <-- Adicionamos aqui
            'inscricao_estadual', 'endereco_sede', 'responsavel_nome',
            'responsavel_funcao', 'email', 'contatos'
        ]
        read_only_fields = fields # Tornamos todos os campos de perfil somente leitura por enquanto

# ... (Seu ProdutoSerializer continua aqui) ...
        
class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        # Vamos traduzir todos os campos do nosso modelo Produto
        fields = '__all__'
        read_only_fields = ['empresa']