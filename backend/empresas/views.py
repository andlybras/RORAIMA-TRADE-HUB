from django.http import Http404
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser # IMPORTAÇÃO CRÍTICA
from .models import Empresa, Produto
from .serializers import (
    EmpresaSerializer, UserSerializer, EmpresaProfileSerializer, ProdutoSerializer
)

class EmpresaListAPIView(generics.ListAPIView):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny] # Tornar a lista pública

class EmpresaDetailAPIView(generics.RetrieveAPIView):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny] # Tornar os detalhes públicos

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user_serializer = UserSerializer(data=request.data)
        if user_serializer.is_valid():
            user = user_serializer.save()
            Empresa.objects.create(
                user=user,
                razao_social=request.data.get('razao_social'),
                nome_fantasia=request.data.get('nome_fantasia'),
                cnpj=request.data.get('cnpj'),
                responsavel_nome=request.data.get('responsavel_nome'),
                email=user.email,
                contatos=request.data.get('contatos')
            )
            return Response(user_serializer.data, status=status.HTTP_201_CREATED)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(ObtainAuthToken):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        responsavel_nome = user.empresa.responsavel_nome if hasattr(user, 'empresa') else user.username
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'nome': responsavel_nome
        })

class MyEmpresaAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EmpresaProfileSerializer
    # LINHA CRÍTICA QUE ENSINA A "DESEMPACOTAR" FICHEIROS:
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        try:
            return self.request.user.empresa
        except Empresa.DoesNotExist:
            raise Http404
        
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)  # permite atualização parcial
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class ProdutoViewSet(viewsets.ModelViewSet):
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Produto.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)