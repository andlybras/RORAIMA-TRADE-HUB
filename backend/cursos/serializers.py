from rest_framework import serializers
from .models import Curso, Licao

class LicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Licao
        fields = ['titulo', 'ordem', 'conteudo']

class CursoSerializer(serializers.ModelSerializer):
    licoes = LicaoSerializer(many=True, read_only=True)

    class Meta:
        model = Curso
        fields = ['id', 'titulo', 'descricao', 'licoes']