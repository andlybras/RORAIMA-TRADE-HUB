# empresas/admin.py

from django.contrib import admin, messages
from .models import Empresa, Produto, CategoriaFAQ, PerguntaFAQ, CNAE # 1. Importe o CNAE

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    # 2. Use 'cnae_principal' no lugar de 'cnae'
    list_display = ('nome_fantasia', 'cnpj', 'responsavel_nome', 'status', 'cnae_principal')
    list_filter = ('status', 'cnae_principal')
    search_fields = ('nome_fantasia', 'razao_social', 'cnpj')
    actions = ['autorizar_registro', 'indeferir_registro']

    # 3. Atualize os fieldsets para usar os novos campos
    fieldsets = (
        ('Dados Empresariais', {
            'fields': ('razao_social', 'nome_fantasia', 'cnpj', 'cnae_principal', 'cnaes_secundarios', 'inscricao_estadual', 'endereco_sede')
        }),
        ('Dados do Responsável', {
            'fields': ('responsavel_nome', 'responsavel_funcao', 'email', 'contatos', 'user')
        }),
        ('Status e Moderação', {
            'fields': ('status', 'justificativa_indeferimento', 'logomarca')
        }),
    )
    # Django cria um widget de seleção múltipla ótimo para cnaes_secundarios automaticamente
    filter_horizontal = ('cnaes_secundarios',)
    
    # ... (suas funções de actions continuam aqui, sem alterações) ...
    def autorizar_registro(self, request, queryset):
        for empresa in queryset:
            empresa.status = 'ATIVO'
            empresa.user.is_active = True
            empresa.save()
            empresa.user.save()
        self.message_user(request, f"{queryset.count()} empresa(s) autorizada(s) com sucesso.", messages.SUCCESS)
    autorizar_registro.short_description = "Autorizar Registro Selecionado(s)"

    def indeferir_registro(self, request, queryset):
        queryset.update(status='INDEFERIDO')
        self.message_user(request, f"{queryset.count()} empresa(s) indeferida(s). Adicione a justificativa editando cada registro.", messages.WARNING)
    indeferir_registro.short_description = "Indeferir Registro Selecionado(s)"


# 4. Registre o novo modelo CNAE e os outros
admin.site.register(CNAE)
admin.site.register(Produto)
admin.site.register(CategoriaFAQ)
admin.site.register(PerguntaFAQ)