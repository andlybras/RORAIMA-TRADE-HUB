from rest_framework import generics
from .models import Empresa
from .serializers import EmpresaSerializer

class EmpresaListAPIView(generics.ListAPIView):
    """
    Esta view exibe uma lista de todas as empresas.
    """
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer

# Adicione esta nova classe no final do arquivo
class EmpresaDetailAPIView(generics.RetrieveAPIView):
    """
    Esta view exibe os detalhes de uma única empresa, identificada por seu ID.
    """
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer