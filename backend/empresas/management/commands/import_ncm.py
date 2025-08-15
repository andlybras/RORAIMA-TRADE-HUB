# empresas/management/commands/import_ncm.py

import json
from django.core.management.base import BaseCommand
from empresas.models import NCMSeção, NCMCapítulo, NCMPosição, NCMItem

SECOES = [
    ('I', 'Animais Vivos e Produtos do Reino Animal', '01', '05'),
    ('II', 'Produtos do Reino Vegetal', '06', '14'),
    ('III', 'Gorduras e Óleos Animais ou Vegetais...', '15', '15'),
    ('IV', 'Produtos das Indústrias Alimentares; Bebidas...', '16', '24'),
    ('V', 'Produtos Minerais', '25', '27'),
    ('VI', 'Produtos das Indústrias Químicas...', '28', '38'),
    ('VII', 'Plásticos e suas Obras; Borracha e suas Obras', '39', '40'),
    ('VIII', 'Peles, Couros, Peles com Pelo...', '41', '43'),
    ('IX', 'Madeira, Carvão Vegetal e Obras de Madeira...', '44', '46'),
    ('X', 'Pastas de Madeira ou de Outras Matérias...', '47', '49'),
    ('XI', 'Matérias Têxteis e suas Obras', '50', '63'),
    ('XII', 'Calçado, Chapéus e Artefatos de Uso Semelhante...', '64', '67'),
    ('XIII', 'Obras de Pedra, Gesso, Cimento...', '68', '70'),
    ('XIV', 'Pérolas Naturais ou Cultivadas, Pedras Preciosas...', '71', '71'),
    ('XV', 'Metais Comuns e suas Obras', '72', '83'),
    ('XVI', 'Máquinas e Aparelhos, Material Elétrico...', '84', '85'),
    ('XVII', 'Material de Transporte', '86', '89'),
    ('XVIII', 'Instrumentos e Aparelhos de Óptica...', '90', '92'),
    ('XIX', 'Armas e Munições; suas Partes e Acessórios', '93', '93'),
    ('XX', 'Mercadorias e Produtos Diversos', '94', '96'),
    ('XXI', 'Objetos de Arte, de Coleção e Antiguidades', '97', '97'),
]

class Command(BaseCommand):
    help = 'Importa a estrutura NCM de um arquivo JSON para o banco de dados.'

    def handle(self, *args, **kwargs):
        json_path = 'Tabela_NCM_Vigente_20250815.json'
        self.stdout.write(self.style.NOTICE(f'Iniciando importação da NCM do arquivo {json_path}...'))

        # Limpa os dados antigos para garantir uma importação limpa
        NCMItem.objects.all().delete()
        NCMPosição.objects.all().delete()
        NCMCapítulo.objects.all().delete()
        NCMSeção.objects.all().delete()
        self.stdout.write(self.style.WARNING('Tabelas NCM antigas foram limpas.'))

        # 1. Cria as Seções
        secoes_map = {}
        for codigo, desc, cap_inicio, cap_fim in SECOES:
            secao, _ = NCMSeção.objects.get_or_create(codigo=codigo, defaults={'descricao': desc})
            for i in range(int(cap_inicio), int(cap_fim) + 1):
                secoes_map[f"{i:02d}"] = secao
        self.stdout.write(self.style.SUCCESS(f'{NCMSeção.objects.count()} Seções criadas.'))

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            nomenclaturas = data.get('Nomenclaturas', [])

        capitulos_map = {}
        posicoes_map = {}

        def get_code_level(code_str):
            """Identifica o nível do NCM pelo formato do código."""
            code_clean = code_str.replace('.', '')
            if len(code_clean) == 2 and '.' not in code_str: return 'CAPITULO'
            if len(code_clean) == 4 and code_str.count('.') <= 1: return 'POSICAO'
            if len(code_clean) == 8 and code_str.count('.') == 2: return 'ITEM'
            return None # Outros níveis (subposições) que não vamos salvar.

        # Passada 1: Capítulos
        self.stdout.write(self.style.NOTICE('Processando Capítulos...'))
        for item in nomenclaturas:
            codigo = item.get('Codigo', '').strip()
            if get_code_level(codigo) == 'CAPITULO':
                secao_pai = secoes_map.get(codigo)
                if secao_pai:
                    cap, _ = NCMCapítulo.objects.get_or_create(
                        codigo=codigo,
                        defaults={'secao': secao_pai, 'descricao': item.get('Descricao', '').strip()}
                    )
                    capitulos_map[codigo] = cap

        # Passada 2: Posições
        self.stdout.write(self.style.NOTICE('Processando Posições...'))
        for item in nomenclaturas:
            codigo = item.get('Codigo', '').strip()
            codigo_limpo = codigo.replace('.', '')
            if get_code_level(codigo) == 'POSICAO':
                capitulo_pai_codigo = codigo_limpo[:2]
                capitulo_pai = capitulos_map.get(capitulo_pai_codigo)
                if capitulo_pai:
                    pos, _ = NCMPosição.objects.get_or_create(
                        codigo=codigo_limpo,
                        defaults={'capitulo': capitulo_pai, 'descricao': item.get('Descricao', '').strip()}
                    )
                    posicoes_map[codigo_limpo] = pos

        # Passada 3: Itens (NCM 8 dígitos)
        self.stdout.write(self.style.NOTICE('Processando Itens (NCM 8 dígitos)...'))
        for item in nomenclaturas:
            codigo = item.get('Codigo', '').strip()
            codigo_limpo = codigo.replace('.', '')
            if get_code_level(codigo) == 'ITEM':
                posicao_pai_codigo = codigo_limpo[:4]
                posicao_pai = posicoes_map.get(posicao_pai_codigo)
                if posicao_pai:
                    NCMItem.objects.get_or_create(
                        codigo=codigo_limpo,
                        defaults={'posicao': posicao_pai, 'descricao': item.get('Descricao', '').strip()}
                    )

        self.stdout.write(self.style.SUCCESS('Importação concluída!'))
        self.stdout.write(f'- Total de Capítulos no DB: {NCMCapítulo.objects.count()}')
        self.stdout.write(f'- Total de Posições no DB: {NCMPosição.objects.count()}')
        self.stdout.write(f'- Total de Itens no DB: {NCMItem.objects.count()}')