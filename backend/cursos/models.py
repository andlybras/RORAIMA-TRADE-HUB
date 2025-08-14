from django.db import models
from django.contrib.auth.models import User

# A "planta baixa" para a nossa tabela de Cursos
class Curso(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(help_text="Uma breve descrição do que será aprendido no curso.")
    
    def __str__(self):
        return self.titulo

# A "planta baixa" para a nossa tabela de Lições
class Licao(models.Model):
    # 'ForeignKey' cria a ligação: cada lição pertence a um curso.
    # Se um curso for apagado, todas as suas lições também serão (on_delete=models.CASCADE).
    curso = models.ForeignKey(Curso, related_name='licoes', on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    # 'order' guarda a ordem da lição dentro do curso (1, 2, 3...)
    ordem = models.PositiveIntegerField()
    conteudo = models.TextField()

    class Meta:
        # Garante que a ordem das lições seja única para cada curso
        ordering = ['ordem']

    def __str__(self):
        return f"{self.curso.titulo} - Lição {self.ordem}: {self.titulo}"