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

# Serializer específico para ATUALIZAR o perfil da empresa
class EmpresaProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        # Agora incluímos todos os campos que queremos mostrar...
        fields = [
            'razao_social', 
            'cnpj', 
            'nome_fantasia', 
            'descricao', 
            'contatos'
        ]
        # ...e dizemos ao tradutor que a razão social e o cnpj são apenas para leitura.
        read_only_fields = ['razao_social', 'cnpj']
        
class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        # Vamos traduzir todos os campos do nosso modelo Produto
        fields = '__all__'