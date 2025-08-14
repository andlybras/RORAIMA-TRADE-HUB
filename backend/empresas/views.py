from django.http import Http404
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from .models import Empresa, Produto
from .serializers import EmpresaSerializer, UserSerializer, EmpresaProfileSerializer, ProdutoSerializer

# View para LISTAR todas as empresas (pública)
class EmpresaListAPIView(generics.ListAPIView):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer

# View para ver os DETALHES de uma empresa (pública)
class EmpresaDetailAPIView(generics.RetrieveAPIView):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer

# View para REGISTAR um novo utilizador e empresa
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
        else:
            # ---- LINHA DE DEBUG ADICIONADA ----
            # Esta linha irá imprimir o erro exato no seu terminal
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View para fazer LOGIN e obter um token
class LoginView(ObtainAuthToken):
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

# Substitua a sua classe MyEmpresaAPIView por esta:
class MyEmpresaAPIView(generics.RetrieveUpdateAPIView):
    """
    View para o utilizador logado ver e atualizar os dados da sua própria empresa.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = EmpresaProfileSerializer

    def get_object(self):
        try:
            # Esta linha é a mais importante: ela busca a empresa
            # que está especificamente ligada ao 'user' que fez o pedido.
            return self.request.user.empresa
        except Empresa.DoesNotExist:
            # Se não encontrar (ex: para um superuser sem empresa),
            # levanta uma exceção que o DRF entende como "Não Encontrado".
            raise Http404
        
class ProdutoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite aos utilizadores logados ver e editar os seus produtos.
    """
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Esta view deve retornar uma lista de todos os produtos
        para o utilizador atualmente autenticado.
        """
        user = self.request.user
        return Produto.objects.filter(empresa=user.empresa)

    def perform_create(self, serializer):
        """
        Garante que um novo produto seja associado à empresa do utilizador logado.
        """
        serializer.save(empresa=self.request.user.empresa)