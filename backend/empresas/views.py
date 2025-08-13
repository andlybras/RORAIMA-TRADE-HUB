from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status # Adicione status
from rest_framework.response import Response # Adicione Response
from rest_framework.views import APIView # Adicione APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from .models import Empresa
from .serializers import EmpresaSerializer, UserSerializer
import pprint 

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

class RegisterView(APIView):
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

        # ESTA É A LINHA QUE ADICIONAMOS
        # Ela vai imprimir os erros do serializer diretamente no seu terminal.
        pprint.pprint(user_serializer.errors)

        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        # Buscamos o nome do responsável na empresa associada
        responsavel_nome = user.empresa.responsavel_nome if hasattr(user, 'empresa') else user.username
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'nome': responsavel_nome # Enviamos o nome para o frontend
        })
        
class MyEmpresaAPIView(generics.RetrieveUpdateAPIView):
    """
    View para o utilizador logado ver e atualizar os dados da sua própria empresa.
    """
    permission_classes = [IsAuthenticated] # Só permite o acesso a utilizadores autenticados
    serializer_class = EmpresaSerializer

    def get_object(self):
        # Retorna a empresa que está ligada ao utilizador que fez o pedido
        return self.request.user.empresa