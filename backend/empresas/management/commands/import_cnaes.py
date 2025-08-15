# empresas/management/commands/import_cnaes.py

import csv
from django.core.management.base import BaseCommand
from empresas.models import CNAE

class Command(BaseCommand):
    help = 'Importa os CNAEs de um arquivo CSV para o banco de dados'

    def handle(self, *args, **kwargs):
        # O caminho para o nosso arquivo CSV limpo
        csv_path = 'cnae_subclasses_limpo.csv'
        self.stdout.write(self.style.NOTICE(f'Iniciando a importação de CNAEs do arquivo {csv_path}...'))

        try:
            with open(csv_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                total_criados = 0
                total_existentes = 0

                for row in reader:
                    # get_or_create é um método inteligente:
                    # Ele tenta buscar um CNAE com o código. Se não encontra, ele cria.
                    # Isso evita duplicatas se rodarmos o comando mais de uma vez.
                    obj, created = CNAE.objects.get_or_create(
                        codigo=row['codigo'],
                        defaults={'denominacao': row['denominacao']}
                    )
                    
                    if created:
                        total_criados += 1
                    else:
                        total_existentes += 1

            self.stdout.write(self.style.SUCCESS(f'Importação concluída com sucesso!'))
            self.stdout.write(f'{total_criados} novos CNAEs foram criados.')
            self.stdout.write(f'{total_existentes} CNAEs já existiam no banco de dados.')

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'Erro: O arquivo {csv_path} não foi encontrado.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ocorreu um erro inesperado: {e}'))