from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Empresa

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
        # Define explicitamente que SÓ estes campos podem ser atualizados a partir do perfil
        fields = ['nome_fantasia', 'descricao', 'contatos']