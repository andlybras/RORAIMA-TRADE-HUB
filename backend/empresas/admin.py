# empresas/admin.py

from django.contrib import admin, messages
from .models import Empresa, Produto, CategoriaFAQ, PerguntaFAQ

# --- NOVA CLASSE DE ADMIN PARA EMPRESA ---
# Esta classe substitui a linha "admin.site.register(Empresa)"
# O decorador "@admin.register(Empresa)" faz o registro por nós.
@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    # Campos que aparecerão na lista de empresas
    list_display = ('nome_fantasia', 'cnpj', 'responsavel_nome', 'email', 'status', 'criado_em')
    
    # Filtro na lateral direita para navegar por status
    list_filter = ('status',)
    
    # Campo de busca
    search_fields = ('nome_fantasia', 'razao_social', 'cnpj', 'email')
    
    # Ações customizadas
    actions = ['autorizar_registro', 'indeferir_registro']

    def autorizar_registro(self, request, queryset):
        # Atualiza o status da empresa para ATIVO e ativa o usuário associado
        for empresa in queryset:
            empresa.status = 'ATIVO'
            empresa.user.is_active = True
            empresa.save()
            empresa.user.save()
        self.message_user(request, f"{queryset.count()} empresa(s) autorizada(s) com sucesso.", messages.SUCCESS)
    autorizar_registro.short_description = "Autorizar Registro Selecionado(s)"

    def indeferir_registro(self, request, queryset):
        # Apenas atualiza o status para INDEFERIDO.
        # A justificativa deve ser adicionada manualmente pelo admin ao editar o registro.
        queryset.update(status='INDEFERIDO')
        self.message_user(request, f"{queryset.count()} empresa(s) indeferida(s). Adicione a justificativa editando cada registro.", messages.WARNING)
    indeferir_registro.short_description = "Indeferir Registro Selecionado(s)"

    # Organiza os campos no formulário de edição do admin
    fieldsets = (
        ('Dados Empresariais', {
            'fields': ('razao_social', 'nome_fantasia', 'cnpj', 'cnae', 'inscricao_estadual', 'endereco_sede')
        }),
        ('Dados do Responsável', {
            'fields': ('responsavel_nome', 'responsavel_funcao', 'email', 'contatos', 'user')
        }),
        ('Status e Moderação', {
            'fields': ('status', 'justificativa_indeferimento', 'logomarca')
        }),
    )
    readonly_fields = ('criado_em', 'atualizado_em')

# --- REGISTROS SIMPLES PARA OS OUTROS MODELOS (MANTEMOS COMO ESTAVA) ---
# Não mexemos nestes para não bagunçar as outras funcionalidades.
admin.site.register(Produto)
admin.site.register(CategoriaFAQ)
admin.site.register(PerguntaFAQ)