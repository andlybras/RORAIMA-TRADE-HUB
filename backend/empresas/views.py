from django.http import Http404
from django.db.models import Q
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser

# 1. Importamos TODOS os modelos e serializers necessários em blocos organizados
from .models import (
    Empresa, Produto, CNAE, NCMSeção, NCMCapítulo, NCMPosição, NCMItem
)
from .serializers import (
    EmpresaSerializer, UserSerializer, EmpresaProfileSerializer, ProdutoSerializer,
    CNAESerializer, NCMSeçãoSerializer, NCMCapítuloSerializer,
    NCMPosiçãoSerializer, NCMItemSerializer
)

# --- VIEWS PÚBLICAS (Lista e Detalhe de Empresas) ---

class EmpresaListAPIView(generics.ListAPIView):
    queryset = Empresa.objects.filter(status='ATIVO') # Mostra apenas empresas ativas
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny]

class EmpresaDetailAPIView(generics.RetrieveAPIView):
    queryset = Empresa.objects.filter(status='ATIVO')
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny]

# --- VIEWS DE AUTENTICAÇÃO E REGISTRO ---

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        # ... (código da RegisterView continua o mesmo que corrigimos antes) ...
        user_serializer = UserSerializer(data=request.data)
        if user_serializer.is_valid():
            user = user_serializer.save()
            user.is_active = False
            user.save()
            empresa = Empresa.objects.create(
                user=user,
                razao_social=request.data.get('razao_social'),
                nome_fantasia=request.data.get('nome_fantasia'),
                cnpj=request.data.get('cnpj'),
                cnae_principal_id=request.data.get('cnae_principal'),
                inscricao_estadual=request.data.get('inscricao_estadual', ''),
                endereco_sede=request.data.get('endereco_sede', ''),
                responsavel_nome=request.data.get('responsavel_nome'),
                responsavel_funcao=request.data.get('responsavel_funcao', ''),
                email=user.email,
                contatos=request.data.get('contatos')
            )
            cnaes_secundarios_ids = request.data.get('cnaes_secundarios', [])
            if cnaes_secundarios_ids:
                empresa.cnaes_secundarios.set(cnaes_secundarios_ids)
            return Response({'status': 'sucesso'}, status=status.HTTP_201_CREATED)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(ObtainAuthToken):
    # ... (código da LoginView continua o mesmo) ...
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        responsavel_nome = user.empresa.responsavel_nome if hasattr(user, 'empresa') else user.username
        return Response({
            'token': token.key, 'user_id': user.pk,
            'email': user.email, 'nome': responsavel_nome
        })

# --- VIEWS DO PAINEL DO USUÁRIO (Área Logada) ---

class MyEmpresaAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EmpresaProfileSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        try:
            return self.request.user.empresa
        except Empresa.DoesNotExist:
            raise Http404

class ProdutoViewSet(viewsets.ModelViewSet):
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Produto.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)

# --- VIEWS DE API PARA OS DICIONÁRIOS (CNAE e NCM) ---

class CNAEListAPIView(generics.ListAPIView):
    # ... (código da CNAEListAPIView continua o mesmo) ...
    serializer_class = CNAESerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        queryset = CNAE.objects.all()
        search_term = self.request.query_params.get('search', None)
        if search_term:
            queryset = queryset.filter(
                Q(codigo__icontains=search_term) | Q(denominacao__icontains=search_term)
            )
        return queryset

class NCMSeçãoListView(generics.ListAPIView):
    queryset = NCMSeção.objects.all()
    serializer_class = NCMSeçãoSerializer
    permission_classes = [AllowAny]

class NCMCapítuloListView(generics.ListAPIView):
    serializer_class = NCMCapítuloSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        queryset = NCMCapítulo.objects.all()
        secao_id = self.request.query_params.get('secao_id')
        if secao_id is not None:
            queryset = queryset.filter(secao_id=secao_id)
        return queryset

class NCMPosiçãoListView(generics.ListAPIView):
    serializer_class = NCMPosiçãoSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        queryset = NCMPosição.objects.all()
        capitulo_id = self.request.query_params.get('capitulo_id')
        if capitulo_id is not None:
            queryset = queryset.filter(capitulo_id=capitulo_id)
        return queryset

class NCMItemListView(generics.ListAPIView):
    serializer_class = NCMItemSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        queryset = NCMItem.objects.all()
        posicao_id = self.request.query_params.get('posicao_id')
        if posicao_id is not None:
            queryset = queryset.filter(posicao_id=posicao_id)
        return queryset