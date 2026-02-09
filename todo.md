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
