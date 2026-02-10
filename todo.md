# Sistema de Gestão Operacional - ML Serviços
## FOCO: Solução 100% Legal para Uso de Diaristas/Freelancers

## CRÍTICO: Controles de Conformidade Legal
- [x] Definir regras de ouro para uso legal de diaristas (máx 2 dias consecutivos)
- [x] Criar matriz de risco trabalhista por trabalhador
- [x] Implementar alerta quando diarista trabalha 3+ dias consecutivos no mesmo local
- [ ] Implementar bloqueio automático após limite de continuidade
- [x] Sistema de rodízio inteligente (evita repetição pessoa/local)
- [ ] Documentação de autonomia (registro de recusas, múltiplos locais)
- [ ] Relatório de risco trabalhista e exposição financeira

## Fase 1: Banco de Dados e Arquitetura
- [x] Definir schema completo com foco em compliance
- [x] Tabela de trabalhadores (diaristas/freelancers/MEI/CLT)
- [x] Tabela de termos de aceite com log (IP, data, hora, geolocalização)
- [x] Tabela de alocações (controle de continuidade)
- [x] Tabela de recusas de trabalho (prova de autonomia)
- [x] Tabela de clientes e locais
- [x] Tabela de checklist de turno
- [x] Tabela de EPIs
- [x] Tabela de ocorrências
- [x] Tabela de produtividade e pagamentos
- [x] Tabela de avaliações
- [x] Tabela de procedimentos
- [x] Executar migrations

## Fase 2: Autenticação e Gestão de Trabalhadores
- [x] Configurar autenticação com roles (admin, supervisor, diarista, cliente)
- [x] Cadastro de trabalhadores com tipo (diarista/freelancer/MEI/CLT)
- [ ] Sistema de termo de aceite digital com log completo
- [x] Visualização de trabalhadores com indicador de risco
- [x] Edição de dados de trabalhadores
- [ ] Histórico completo de serviços
- [x] Chave PIX para pagamentos

## Fase 3: Controle de Continuidade e Rodízio (CRÍTICO)
- [x] Dashboard de risco trabalhista por trabalhador
- [x] Alerta visual quando diarista se aproxima do limite
- [ ] Bloqueio automático de alocação após limite
- [x] Sistema de rodízio inteligente (sugere trabalhadores diferentes)
- [x] Histórico de alocações por trabalhador/local
- [x] Relatório de continuidade (dias consecutivos, dias/mês)
- [ ] Cálculo de exposição financeira (risco de ação trabalhista)

## Fase 4: Checklist Digital e Controle de EPI
- [ ] Checklist de início de turno por cliente/local
- [ ] Campos customizáveis
- [ ] Registro de presença com geolocalização
- [ ] Assinatura digital
- [ ] Controle de EPI com registro tripartite
- [ ] Alertas de validade de EPI
- [ ] Sistema de reposição
- [ ] Fotos de entrega/devolução

## Fase 5: Ocorrências e Produtividade
- [ ] Registro de ocorrências com upload de fotos
- [ ] Categorização por gravidade
- [ ] Notificação automática ao gestor
- [ ] Controle de horas (não jornada, apenas presença)
- [ ] Cálculo de dias trabalhados
- [ ] Cálculo automático de tickets alimentação (Convenção Coletiva)
- [ ] Registro de volumes movimentados
- [ ] Relatórios de produtividade

## Fase 6: Gestão de Pagamentos
- [ ] Cálculo automático por dia trabalhado
- [ ] Pagamento via PIX
- [ ] Emissão de recibos digitais
- [ ] Controle de notas fiscais (MEI)
- [ ] Retenção de INSS (se RPA)
- [ ] Relatório de pagamentos

## Fase 7: Dashboard e Avaliação
- [x] Dashboard de alocação em tempo real
- [ ] Status de trabalhadores (disponível, em trânsito, em serviço)
- [ ] Próximos agendamentos
- [ ] Mapa de localização (GPS)
- [ ] Sistema de avaliação pós-serviço
- [ ] Notificação para avaliações baixas
- [ ] Histórico de avaliações
- [ ] Priorização de bem avaliados (não punição)

## Fase 8: Biblioteca de Procedimentos
- [ ] Upload de procedimentos por cliente
- [ ] Geração de QR Codes
- [ ] Suporte para PDFs e vídeos
- [ ] Confirmação de leitura
- [ ] Versionamento

## Fase 9: Documentação de Autonomia (CRÍTICO)
- [ ] Registro de recusas de trabalho
- [ ] Múltiplos locais por trabalhador
- [ ] Múltiplos clientes por trabalhador
- [ ] Relatório de autonomia (prova para Justiça)
- [ ] Histórico de aceites e recusas

## Fase 10: Relatórios de Conformidade
- [ ] Relatório de risco trabalhista
- [ ] Relatório de conformidade com Convenção Coletiva
- [ ] Relatório de tickets alimentação
- [ ] Relatório para auditorias
- [ ] Relatório de exposição financeira

## Fase 11: Documentação Legal
- [ ] Modelo de termo de aceite para diaristas
- [ ] Modelo de contrato de prestação de serviços
- [ ] Modelo de recibo de pagamento
- [ ] Guia de operação legal (regras de ouro)
- [ ] Checklist de conformidade

## Fase 12: Testes e Validação
- [x] Testes unitários (vitest) - 7/8 passando
- [ ] Testes de fluxo completo
- [ ] Simulação de cenários de risco
- [ ] Validação com advogado trabalhista (recomendado)

## Fase 13: Entrega
- [ ] Sistema web completo funcionando
- [ ] Documentação técnica
- [ ] Documentação legal
- [ ] Guia de implementação
- [ ] Treinamento da equipe
- [ ] Checkpoint final

## MÓDULO 2: Gerador de Propostas (Integrado)
- [ ] Busca CNPJ automática
- [ ] Cálculo preciso com BDI (32%)
- [ ] Fórmula: (Salário × 1.35) + R$ 770,49 (benefícios) × 1.32
- [ ] Funções: Motorista 1/2/3, Ajudante, Conferente
- [ ] Geração de PDF profissional
- [ ] Histórico de propostas

## MÓDULO 3: Gestão Financeira
- [ ] Controle de pagamentos
- [ ] Cálculo de tickets alimentação (R$ 30/dia)
- [ ] Relatórios de rentabilidade
- [ ] Integração com folha de pagamento


## NOVOS REQUISITOS IDENTIFICADOS (CRÍTICOS)

### Parametrização de Contratos por Cliente
- [ ] Tabela de contratos com configurações específicas por cliente
- [ ] Valor da diária por função (pode variar por cliente)
- [ ] Benefícios incluídos: marmita (sim/não), uniforme (sim/não), transporte (sim/não)
- [ ] Horários de trabalho (turno manhã/tarde/noite)
- [ ] Observações específicas do contrato
- [ ] Histórico de alterações contratuais

### Interface para Supervisor CLT (Confirmação de Presença)
- [ ] Login específico para supervisores CLT
- [ ] Tela de confirmação de presença dos diaristas
- [ ] Checklist de itens fornecidos (marmita, uniforme, EPI)
- [ ] Anotações sobre o dia de trabalho
- [ ] Assinatura digital do supervisor
- [ ] Assinatura digital do diarista (confirmação de recebimento)
- [ ] Registro de horário de entrada/saída (sem controle de jornada)
- [ ] Upload de fotos (opcional)

### Controle de Benefícios e Itens Fornecidos
- [ ] Registro de entrega de marmita (por dia)
- [ ] Registro de entrega de uniforme (com devolução)
- [ ] Controle de vale-transporte (se aplicável)
- [ ] Controle de EPIs fornecidos
- [ ] Histórico completo por trabalhador
- [ ] Relatório de custos de benefícios

### Relatórios Financeiros
- [ ] Relatório de pagamento por trabalhador (dias × diária + benefícios)
- [ ] Relatório de pagamento por cliente (faturamento)
- [ ] Relatório de custos operacionais (benefícios, uniformes, EPIs)
- [ ] Relatório de rentabilidade por cliente
- [ ] Relatório de tickets alimentação (Convenção Coletiva)
- [ ] Exportação para Excel/PDF
- [ ] Filtros por período, cliente, trabalhador

### Gestão de Dados de Empresas
- [ ] Cadastro completo de empresas clientes
- [ ] Múltiplos contratos por empresa
- [ ] Histórico de serviços prestados
- [ ] Faturamento total por empresa
- [ ] Contatos múltiplos (comercial, operacional, financeiro)
- [ ] Documentos anexados (contratos, notas fiscais)

### Fluxo Operacional Completo
- [ ] 1. Admin cria alocação (trabalhador + cliente + local + data)
- [ ] 2. Sistema envia notificação ao supervisor CLT
- [ ] 3. Supervisor confirma presença do diarista no app
- [ ] 4. Supervisor registra itens fornecidos (marmita, uniforme, etc.)
- [ ] 5. Diarista assina digitalmente confirmando recebimento
- [ ] 6. Sistema calcula automaticamente valor a pagar
- [ ] 7. Admin gera relatório de pagamento
- [ ] 8. Sistema registra pagamento via PIX
- [ ] 9. Emissão de recibo digital


## SISTEMA DE TURNOS (Implementação Imediata)

### Cadastro de Turnos
- [ ] Tabela de turnos por cliente
- [ ] Turnos padrão: Manhã, Tarde, Noite, Comercial
- [ ] Horários configuráveis por cliente (ex: Manhã 6h-14h ou 7h-15h)
- [ ] Múltiplos turnos por cliente

### Interface Mobile para Supervisor
- [ ] Login específico para supervisores
- [ ] Lista de alocações do dia agrupadas por turno
- [ ] Tela de confirmação de entrada com checklist
- [ ] Tela de confirmação de saída
- [ ] Assinatura digital (canvas touch)
- [ ] Campo para CPF e PIX (se não cadastrado)
- [ ] Registro de turno (NÃO horário exato)
- [ ] Geolocalização automática
- [ ] Modo offline (sincroniza depois)

### Checklist de Entrada/Saída
- [ ] Pegou marmita? (sim/não) - se sim, desconta automaticamente
- [ ] Uniforme OK? (sim/não)
- [ ] EPI completo? (sim/não)
- [ ] Observações (campo livre)
- [ ] Foto opcional

### Cálculo Automático de Pagamentos
- [ ] Diária base (conforme contrato)
- [ ] Desconto de marmita (se pegou)
- [ ] Valor líquido a pagar
- [ ] Cálculo de ticket alimentação (Convenção Coletiva)
- [ ] Total por trabalhador no período

### Relatórios Quinzenais
- [ ] Relatório por cliente: quantidade de pessoas-dia
- [ ] Agrupamento por turno
- [ ] Exportação para Excel
- [ ] Dados para emissão de NF

### Gestão de Supervisores
- [ ] Cadastro de supervisores CLT
- [ ] Atribuição de operações por supervisor
- [ ] Histórico de confirmações por supervisor
- [ ] Dashboard de supervisores ativos


## NOVA FUNCIONALIDADE - Busca Automática de CNPJ
- [x] Integração com BrasilAPI para busca de CNPJ
- [x] Preenchimento automático de dados da empresa
- [x] Validação de CNPJ
- [x] Tratamento de erros (CNPJ inválido, API indisponível)


## APRIMORAMENTO - Busca de CNPJ com Endereço
- [ ] Adicionar campos de endereço na tabela de clientes
- [ ] Atualizar busca de CNPJ para preencher endereço completo
- [ ] Incluir: logradouro, número, complemento, bairro, cidade, estado, CEP


## NOVA FUNCIONALIDADE - Geolocalização e Validação de Check-in
- [x] Integração com BrasilAPI CEP v2 (latitude/longitude)
- [x] Adicionar campos de geolocalização na tabela de locais
- [x] Capturar geolocalização do supervisor no check-in
- [x] Calcular distância entre supervisor e local de trabalho
- [x] Alertar quando check-in for feito longe do local (>500m)
- [ ] Dashboard de check-ins suspeitos


## NOVA FUNCIONALIDADE - Gestão de Turnos Personalizáveis
- [x] Criar página de gestão de turnos
- [x] Interface para cadastrar turnos por cliente
- [x] Configuração de horários de início e fim
- [x] Tipos de turno (Manhã, Tarde, Noite, Comercial, Personalizado)
- [x] API completa (criar, listar, atualizar, deletar turnos)
- [x] Testes unitários passando (2/2)
- [ ] Integrar turnos no formulário de alocação
- [ ] Exibir turnos na interface do supervisor
- [ ] Validar que turnos não se sobrepõem
- [ ] Permitir turnos inativos/arquivados


## NOVA FUNCIONALIDADE - Relatório Quinzenal de Pessoas-Dia
- [x] API backend para buscar alocações com check-ins confirmados
- [x] Filtro por período (quinzena: 1-15 ou 16-fim do mês)
- [x] Cálculo de pessoas-dia por cliente e turno
- [x] Interface de relatório com seleção de mês/quinzena
- [x] Visualização agrupada: Cliente > Turno > Lista de trabalhadores
- [x] Totalizadores por cliente e geral
- [x] Exportação para Excel (2 abas: Resumo e Detalhamento)
- [x] Detalhamento: trabalhador, data, turno, local
- [x] Testes unitários passando (3/3)

## APRIMORAMENTO - Filtro de Cliente no Relatório Quinzenal
- [x] Atualizar API backend para aceitar clientId opcional
- [x] Adicionar dropdown de seleção de cliente no frontend
- [x] Opção "Todos os clientes" como padrão
- [x] Filtrar dados quando cliente específico for selecionado
- [x] Testes unitários passando (4/4)

## SISTEMA DE CADASTRO DE TRABALHADORES COM VALIDAÇÃO

### Backend Implementado:
- [x] Schema do banco de dados atualizado com todos os campos:
  - [x] Nome completo, CPF, data de nascimento, nome da mãe
  - [x] Endereço completo (rua, número, complemento, bairro, cidade, estado, CEP)
  - [x] Telefone e email
  - [x] Chave PIX com tipo (CPF, CNPJ, Email, Telefone, Aleatória)
  - [x] URL do documento com foto e tipo de documento (RG/CNH/RNE)
  - [x] Status de aprovação (pending, approved, rejected)
  - [x] Status operacional (active, inactive, blocked)
  - [x] Campos de aprovação (approvedBy, approvedAt, rejectionReason)
- [x] Migração do banco executada com sucesso
- [x] Validação de chave PIX implementada (18/20 testes passando)
  - [x] Valida CPF, CNPJ, Email, Telefone, Chave Aleatória
  - [x] Formatação automática de chaves
- [x] APIs tRPC criadas:
  - [x] workerRegistration.register (público, sem autenticação)
  - [x] workerRegistration.listPending (admin only)
  - [x] workerRegistration.approve (admin only)
  - [x] workerRegistration.reject (admin only)
- [x] Validação automática de idade (≥18 anos) no backend
- [x] Bloqueio de menores de idade
- [x] Funções de banco de dados:
  - [x] createWorkerRegistration
  - [x] getPendingWorkerRegistrations
  - [x] approveWorkerRegistration
  - [x] rejectWorkerRegistration

### Frontend Implementado:
- [x] Formulário público de cadastro via link
  - [x] Upload de documento com foto para S3 via API
  - [x] Validação de chave PIX (5 tipos suportados)
  - [x] Campos de endereço completo (7 campos)
  - [x] Validação de CPF no frontend com formatação automática
  - [x] Validação de idade ≥18 anos com cálculo preciso
  - [x] Mensagem de sucesso/erro com feedback visual
  - [x] Rota pública /cadastro-trabalhador (sem autenticação)
  - [x] Preview de imagem antes do upload
  - [x] Validação de tamanho de arquivo (max 5MB)
  - [x] Seleção de tipo de documento (RG/CNH/RNE)
  - [x] Seleção de tipo de contrato (Diarista/Freelancer/MEI/CLT)
- [ ] Painel administrativo de aprovação
  - [ ] Lista de cadastros pendentes
  - [ ] Visualização de documentos
  - [ ] Botões de aprovar/rejeitar
  - [ ] Modal de rejeição com motivo
- [ ] Sistema de tokens/links de cadastro por empresa
- [ ] Notificação ao admin quando novo cadastro é recebido
- [ ] Histórico de aprovações/rejeições


## BUG FIX - Erro de Anchor Aninhado na Página de Alocações
- [x] Localizar anchor tag aninhado em /alocacoes (linha 131-135)
- [x] Remover aninhamento inválido de <a> dentro de <a> (substituído por <span>)
- [x] Testar correção no navegador


## REVISÃO DE CÓDIGO - Verificar Anchor Tags Aninhados
- [x] Revisar página Workers.tsx (corrigido header linha 131-135)
- [x] Revisar página Clients.tsx (corrigido header linha 160-164)
- [x] Revisar página Contracts.tsx (sem problemas)
- [x] Revisar página Shifts.tsx (corrigido botão voltar linha 332-334)
- [x] Revisar página BiweeklyReport.tsx (sem problemas)
- [x] Corrigir todos os problemas encontrados


## SISTEMA COMPLETO DE GESTÃO DE OPERAÇÕES

### ETAPA 1 - Operações com Líder e Aceite
- [x] Reformular schema de operações (3 novas tabelas)
  - [x] operations (21 campos, 6 FKs)
  - [x] operationMembers (18 campos, 3 FKs)
  - [x] operationIncidents (13 campos, 3 FKs)
- [x] Adicionar role "leader" aos usuários
- [x] Funções de banco de dados (9 funções)
  - [x] createOperation, getOperationById, getOperationsByLeader
  - [x] acceptOperation, startOperation, completeOperation
  - [x] checkInMember, checkOutMember
  - [x] createOperationIncident, getOperationIncidents
- [x] APIs tRPC completas (10 endpoints)
  - [x] operations.create (admin only)
  - [x] operations.listByLeader (leader/admin)
  - [x] operations.getById (leader/admin)
  - [x] operations.accept (público)
  - [x] operations.start (leader)
  - [x] operations.checkIn (leader)
  - [x] operations.checkOut (leader)
  - [x] operations.complete (leader)
  - [x] operations.createIncident (leader)
  - [x] operations.listIncidents (leader/admin)
- [x] Interface admin: criar operação
  - [x] Seleção de cliente, local, data, turno, líder
  - [x] Adicionar múltiplos trabalhadores com função e diária
  - [x] Validações de formulário
- [ ] Gerar card de operação para o líder
- [ ] Interface de aceite via CPF + termo de responsabilidade
- [ ] Validação de CPF antes do aceite
- [ ] Registro de timestamp de aceite

### ETAPA 2 - Check-in/out e Ocorrências
- [ ] Sistema de check-in pelo líder (iniciar operação)
- [ ] Check-out individual por trabalhador
- [ ] Registro de ocorrências durante operação
- [ ] Registro de faltas e motivos
- [ ] Confirmação de consumo de marmita
- [ ] Confirmação de uso de EPI
- [ ] Registro de intercorrências
- [ ] Marcação de faltas graves

### ETAPA 3 - Dashboard do Líder e Notificações
- [ ] Dashboard mobile para líder de equipe
- [ ] Lista de operações ativas/pendentes
- [ ] Card detalhado de operação
- [ ] Histórico de desempenho por trabalhador
- [ ] Notificações em tempo real para líder
- [ ] Notificações para trabalhadores (nova operação)
- [ ] Sistema de alertas para admin

### Melhorias de Estrutura
- [ ] Adicionar role "leader" no sistema de usuários
- [ ] Hierarquia: Admin > Líder > Trabalhador
- [ ] Permissões específicas por role
- [ ] Auditoria completa de ações


## BUG FIX - Erro no Botão "Ver Detalhes" do Card de Trabalhadores
- [x] Investigar erro ao clicar em "Ver Detalhes" (rota não existia)
- [x] Criar página WorkerDetails.tsx com informações completas
- [x] Adicionar rota /trabalhadores/:id no App.tsx
- [x] Testar correção (funcionando perfeitamente)


## CONTINUAÇÃO - Sistema de Gestão de Operações
- [x] Dashboard do líder (mobile-friendly)
  - [x] Listagem de operações por status
  - [x] Cards de estatísticas
  - [x] Filtros por status
  - [x] Visualização mobile-friendly
- [x] Página de aceite via CPF + termo
  - [x] Formulário de CPF com validação
  - [x] Termo de responsabilidade completo
  - [x] Checkbox de aceite
  - [x] Integração com API
- [ ] ETAPA 2 completa (check-in/out, ocorrências)
- [ ] ETAPA 3 completa (notificações, melhorias)


## PÁGINA DE DETALHES DA OPERAÇÃO PARA O LÍDER
- [x] Criar página /lider/operacao/:id
- [x] Exibir informações da operação (cliente, local, data, turno)
- [x] Listar todos os membros da equipe com status de aceite
- [x] Botões de check-in individual por trabalhador
- [x] Botões de check-out individual por trabalhador
- [x] Formulário de registro de ocorrências com 8 tipos
- [x] Upload de fotos para ocorrências (integrado com S3)
- [x] Controle de consumo de marmita por trabalhador (checkboxes antes do check-out)
- [x] Controle de consumo de EPI por trabalhador (checkboxes antes do check-out)
- [x] Botão para iniciar operação (quando status = accepted)
- [x] Botão para completar operação (quando status = in_progress)
- [x] Listagem de ocorrências registradas com fotos
- [x] Badges de status visual
- [x] Interface mobile-friendly e responsiva


## SISTEMA DE CONTROLE DE CONFORMIDADE
### Bloqueio Automático de Trabalhadores
- [ ] Atualizar schema de trabalhadores com campos de bloqueio
  - [ ] isBlocked (boolean)
  - [ ] blockReason (texto)
  - [ ] blockedAt (timestamp)
  - [ ] blockedBy (userId)
  - [ ] blockType (temporary/permanent)
  - [ ] blockExpiresAt (timestamp, para bloqueios temporários)
- [ ] Criar tabela workerBlockHistory para histórico
  - [ ] workerId, action (blocked/unblocked), reason, timestamp, userId
- [ ] Lógica automática de bloqueio baseada em ocorrências
  - [ ] Falta não justificada → Bloqueio 3 dias
  - [ ] 3+ atrasos → Bloqueio 7 dias
  - [ ] Conduta inadequada → Bloqueio permanente
  - [ ] Acidente sem EPI → Bloqueio até revisão
- [ ] Interface administrativa de gestão de bloqueios
  - [ ] Lista de trabalhadores bloqueados
  - [ ] Visualização de motivo e histórico
  - [ ] Formulário de desbloqueio com justificativa obrigatória
  - [ ] Histórico completo de bloqueios/desbloqueios
- [ ] Validação na criação de operações
  - [ ] Não permitir seleção de trabalhadores bloqueados
  - [ ] Mensagem clara indicando motivo do bloqueio
- [ ] Dashboard de conformidade
  - [ ] Total de trabalhadores bloqueados
  - [ ] Bloqueios por tipo
  - [ ] Ocorrências por tipo
  - [ ] Taxa de conformidade
