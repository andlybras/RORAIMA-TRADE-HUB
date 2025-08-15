from rest_framework import serializers
from django.contrib.auth.models import User
# 1. Importamos TODOS os modelos necessários em um só lugar
from .models import Empresa, Produto, CNAE, NCMSeção, NCMCapítulo, NCMPosição, NCMItem

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

# --- SERIALIZERS PARA NOSSOS DICIONÁRIOS ---

class CNAESerializer(serializers.ModelSerializer):
    class Meta:
        model = CNAE
        fields = ['id', 'codigo', 'denominacao']

class NCMSeçãoSerializer(serializers.ModelSerializer):
    class Meta:
        model = NCMSeção
        fields = ['id', 'codigo', 'descricao']

class NCMCapítuloSerializer(serializers.ModelSerializer):
    class Meta:
        model = NCMCapítulo
        fields = ['id', 'codigo', 'descricao']

class NCMPosiçãoSerializer(serializers.ModelSerializer):
    class Meta:
        model = NCMPosição
        fields = ['id', 'codigo', 'descricao']

class NCMItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NCMItem
        fields = ['id', 'codigo', 'descricao']

# --- SERIALIZERS PRINCIPAIS DA APLICAÇÃO ---

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'
        read_only_fields = ['empresa']

# 2. Unificamos as duas versões do EmpresaProfileSerializer em uma só
class EmpresaProfileSerializer(serializers.ModelSerializer):
    cnae_principal = serializers.StringRelatedField()
    cnaes_secundarios = serializers.StringRelatedField(many=True)

    class Meta:
        model = Empresa
        fields = [
            'razao_social', 'cnpj', 'nome_fantasia', 'descricao', 'logomarca',
            'cnae_principal', 'cnaes_secundarios',
            'inscricao_estadual', 'endereco_sede', 'responsavel_nome',
            'responsavel_funcao', 'email', 'contatos'
        ]
        # A página de perfil é apenas para visualização de dados de registro por enquanto
        read_only_fields = fields

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'