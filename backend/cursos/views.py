from rest_framework import generics
from .models import Curso
from .serializers import CursoSerializer

# View para LISTAR todos os cursos
class CursoListAPIView(generics.ListAPIView):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer

# View para ver os DETALHES de um curso
class CursoDetailAPIView(generics.RetrieveAPIView):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer