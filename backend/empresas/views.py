from rest_framework import generics
from .models import Empresa
from .serializers import EmpresaSerializer

class EmpresaListAPIView(generics.ListAPIView):
    """
    Esta view exibe uma lista de todas as empresas.
    """
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer