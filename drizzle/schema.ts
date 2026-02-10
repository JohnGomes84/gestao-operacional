import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Sistema de Gestão Operacional - ML Serviços
 * Foco: Monitoramento de risco trabalhista e controle de conformidade
 */

// ============================================================================
// AUTENTICAÇÃO E USUÁRIOS
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "leader", "supervisor", "worker", "client"]).default("worker").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// TRABALHADORES (Diaristas, Freelancers, CLT)
// ============================================================================

export const workers = mysqlTable("workers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  
  // Dados pessoais obrigatórios
  fullName: varchar("fullName", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  dateOfBirth: date("dateOfBirth"), // Para validação de idade
  motherName: varchar("motherName", { length: 255 }), // Nome da mãe
  
  // Contato
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  
  // Endereço completo
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  
  // Chave PIX
  pixKey: varchar("pixKey", { length: 255 }),
  pixKeyType: mysqlEnum("pixKeyType", ["cpf", "cnpj", "email", "phone", "random"]),
  
  // Documento com foto
  documentPhotoUrl: text("documentPhotoUrl"), // URL do documento (RG/CNH) no S3
  documentType: mysqlEnum("documentType", ["rg", "cnh", "rne"]), // Tipo de documento
  
  // Tipo de contrato
  workerType: mysqlEnum("workerType", ["daily", "freelancer", "mei", "clt"]).notNull(),
  
  // Dados bancários/pagamento
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }),
  
  // Status de aprovação
  registrationStatus: mysqlEnum("registrationStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy").references(() => users.id), // Admin que aprovou
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  
  // Status operacional
  status: mysqlEnum("status", ["active", "inactive", "blocked"]).default("inactive").notNull(),
  
  // Controle de risco trabalhista
  riskScore: int("riskScore").default(0), // 0-100
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).default("low"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Worker = typeof workers.$inferSelect;
export type InsertWorker = typeof workers.$inferInsert;

// ============================================================================
// TERMOS DE ACEITE (Documentação de autonomia)
// ============================================================================

export const workerTerms = mysqlTable("workerTerms", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").references(() => workers.id).notNull(),
  
  // Log de aceite
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  geolocation: varchar("geolocation", { length: 100 }), // lat,long
  
  // Versão do termo
  termVersion: varchar("termVersion", { length: 20 }).notNull(),
  termContent: text("termContent").notNull(),
  
  // Assinatura digital
  signatureHash: varchar("signatureHash", { length: 64 }),
});

export type WorkerTerm = typeof workerTerms.$inferSelect;
export type InsertWorkerTerm = typeof workerTerms.$inferInsert;

// ============================================================================
// CLIENTES E LOCAIS
// ============================================================================

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  
  // Dados do cliente
  companyName: varchar("companyName", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  contactName: varchar("contactName", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  
  // Endereço
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ============================================================================
// CONTRATOS (Parametrização por cliente)
// ============================================================================

export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").references(() => clients.id).notNull(),
  
  // Identificação
  contractName: varchar("contractName", { length: 255 }).notNull(),
  contractNumber: varchar("contractNumber", { length: 100 }),
  
  // Período de vigência
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  
  // Valores por função (JSON para flexibilidade)
  dailyRates: text("dailyRates").notNull(), // JSON: {"ajudante": 150, "motorista1": 200, ...}
  
  // Benefícios
  providesUniform: boolean("providesUniform").default(true).notNull(),
  providesEpi: boolean("providesEpi").default(true).notNull(),
  providesMeal: boolean("providesMeal").default(true).notNull(),
  mealCost: decimal("mealCost", { precision: 10, scale: 2 }).default("25.00"), // Valor descontado do trabalhador
  mealTicketValue: decimal("mealTicketValue", { precision: 10, scale: 2 }).default("30.00"), // Convenção
  
  // Faturamento
  billingCycle: mysqlEnum("billingCycle", ["weekly", "biweekly", "monthly"]).default("biweekly").notNull(),
  chargePerPerson: decimal("chargePerPerson", { precision: 10, scale: 2 }).notNull(), // Valor cobrado do cliente por pessoa/dia
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  
  // Observações
  notes: text("notes"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// ============================================================================
// TURNOS (Por cliente/local)
// ============================================================================

export const shifts = mysqlTable("shifts", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").references(() => clients.id).notNull(),
  
  // Identificação
  shiftName: varchar("shiftName", { length: 100 }).notNull(), // Manhã, Tarde, Noite, Comercial
  
  // Horários (apenas para referência, NÃO para controle de jornada)
  startTime: varchar("startTime", { length: 5 }).notNull(), // "06:00"
  endTime: varchar("endTime", { length: 5 }).notNull(), // "14:00"
  
  // Descrição
  description: text("description"),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Shift = typeof shifts.$inferSelect;
export type InsertShift = typeof shifts.$inferInsert;



export const workLocations = mysqlTable("workLocations", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").references(() => clients.id).notNull(),
  
  // Endereço
  locationName: varchar("locationName", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  
  // Coordenadas (para geolocalização)
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkLocation = typeof workLocations.$inferSelect;
export type InsertWorkLocation = typeof workLocations.$inferInsert;

// ============================================================================
// ALOCAÇÕES (CRÍTICO: Controle de continuidade)
// ============================================================================

export const allocations = mysqlTable("allocations", {
  id: int("id").autoincrement().primaryKey(),
  
  // Relacionamentos
  workerId: int("workerId").references(() => workers.id).notNull(),
  clientId: int("clientId").references(() => clients.id).notNull(),
  locationId: int("locationId").references(() => workLocations.id).notNull(),
  contractId: int("contractId").references(() => contracts.id), // Contrato aplicado
  shiftId: int("shiftId").references(() => shifts.id), // Turno
  
  // Data do trabalho
  workDate: date("workDate").notNull(),
  jobFunction: varchar("jobFunction", { length: 100 }), // Função: Ajudante, Conferente, Motorista, etc.
  
  // Status
  status: mysqlEnum("status", ["scheduled", "confirmed", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  
  // Check-in/Check-out (TURNO, não horário exato)
  checkInTime: timestamp("checkInTime"),
  checkOutTime: timestamp("checkOutTime"),
  checkInLocation: varchar("checkInLocation", { length: 100 }), // lat,long
  checkOutLocation: varchar("checkOutLocation", { length: 100 }), // lat,long
  
  // Assinaturas digitais
  workerSignatureIn: text("workerSignatureIn"), // Assinatura de entrada
  workerSignatureOut: text("workerSignatureOut"), // Assinatura de saída
  supervisorId: int("supervisorId").references(() => users.id), // Supervisor que confirmou
  
  // Benefícios fornecidos
  tookMeal: boolean("tookMeal").default(false), // Pegou marmita?
  uniformProvided: boolean("uniformProvided").default(false), // Uniforme fornecido?
  epiProvided: boolean("epiProvided").default(false), // EPI fornecido?
  
  // Valores
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }),
  mealCost: decimal("mealCost", { precision: 10, scale: 2 }).default("25.00"), // Custo da marmita (descontado)
  mealTicket: decimal("mealTicket", { precision: 10, scale: 2 }).default("30.00"), // Convenção Coletiva
  netPay: decimal("netPay", { precision: 10, scale: 2 }), // Valor líquido a pagar (diária - marmita)
  
  // Controle de risco
  consecutiveDays: int("consecutiveDays").default(1), // Dias consecutivos no mesmo local
  daysThisMonth: int("daysThisMonth").default(1), // Dias neste mês no mesmo cliente
  riskFlag: boolean("riskFlag").default(false), // true se ultrapassar limites
  
  // Observações
  notes: text("notes"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = typeof allocations.$inferInsert;

// ============================================================================
// OFERTAS DE TRABALHO (Documentação de autonomia)
// ============================================================================

export const workOffers = mysqlTable("workOffers", {
  id: int("id").autoincrement().primaryKey(),
  
  // Relacionamentos
  workerId: int("workerId").references(() => workers.id).notNull(),
  clientId: int("clientId").references(() => clients.id).notNull(),
  locationId: int("locationId").references(() => workLocations.id).notNull(),
  
  // Detalhes da oferta
  workDate: date("workDate").notNull(),
  offeredRate: decimal("offeredRate", { precision: 10, scale: 2 }).notNull(),
  
  // Resposta do trabalhador
  response: mysqlEnum("response", ["pending", "accepted", "refused"]).default("pending").notNull(),
  refusalReason: text("refusalReason"), // Opcional: motivo da recusa
  respondedAt: timestamp("respondedAt"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkOffer = typeof workOffers.$inferSelect;
export type InsertWorkOffer = typeof workOffers.$inferInsert;

// ============================================================================
// CHECKLIST DE TURNO
// ============================================================================

export const shiftChecklists = mysqlTable("shiftChecklists", {
  id: int("id").autoincrement().primaryKey(),
  allocationId: int("allocationId").references(() => allocations.id).notNull(),
  
  // Itens do checklist (JSON para flexibilidade)
  checklistData: text("checklistData").notNull(), // JSON: {uniform: true, dds: true, gembaWalk: true, ...}
  
  // Assinatura digital
  workerSignature: varchar("workerSignature", { length: 64 }),
  supervisorSignature: varchar("supervisorSignature", { length: 64 }),
  
  // Observações
  observations: text("observations"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShiftChecklist = typeof shiftChecklists.$inferSelect;
export type InsertShiftChecklist = typeof shiftChecklists.$inferInsert;

// ============================================================================
// CONTROLE DE EPIs
// ============================================================================

export const epiRecords = mysqlTable("epiRecords", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").references(() => workers.id).notNull(),
  
  // Detalhes do EPI
  epiType: varchar("epiType", { length: 100 }).notNull(), // Capacete, luvas, botas, etc.
  epiDescription: text("epiDescription"),
  
  // Datas
  deliveryDate: date("deliveryDate").notNull(),
  expiryDate: date("expiryDate"),
  returnDate: date("returnDate"),
  
  // Registro tripartite
  workerSignature: varchar("workerSignature", { length: 64 }),
  supervisorSignature: varchar("supervisorSignature", { length: 64 }),
  clientSignature: varchar("clientSignature", { length: 64 }),
  
  // Fotos
  deliveryPhoto: varchar("deliveryPhoto", { length: 500 }), // URL S3
  returnPhoto: varchar("returnPhoto", { length: 500 }), // URL S3
  
  // Status
  status: mysqlEnum("status", ["active", "expired", "returned"]).default("active").notNull(),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EpiRecord = typeof epiRecords.$inferSelect;
export type InsertEpiRecord = typeof epiRecords.$inferInsert;

// ============================================================================
// OCORRÊNCIAS E INCIDENTES
// ============================================================================

export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  allocationId: int("allocationId").references(() => allocations.id).notNull(),
  
  // Detalhes da ocorrência
  incidentType: mysqlEnum("incidentType", ["accident", "near_miss", "equipment_failure", "quality_issue", "other"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  
  // Descrição
  description: text("description").notNull(),
  
  // Fotos
  photos: text("photos"), // JSON array de URLs S3
  
  // Notificação
  notifiedAt: timestamp("notifiedAt"),
  notifiedTo: varchar("notifiedTo", { length: 320 }), // Email do gestor
  
  // Status
  status: mysqlEnum("status", ["open", "investigating", "resolved", "closed"]).default("open").notNull(),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

// ============================================================================
// PAGAMENTOS
// ============================================================================

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").references(() => workers.id).notNull(),
  
  // Período
  periodStart: date("periodStart").notNull(),
  periodEnd: date("periodEnd").notNull(),
  
  // Valores
  daysWorked: int("daysWorked").notNull(),
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }).notNull(),
  grossAmount: decimal("grossAmount", { precision: 10, scale: 2 }).notNull(),
  mealTickets: decimal("mealTickets", { precision: 10, scale: 2 }).notNull(),
  inssDeduction: decimal("inssDeduction", { precision: 10, scale: 2 }).default("0.00"),
  netAmount: decimal("netAmount", { precision: 10, scale: 2 }).notNull(),
  
  // Pagamento
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "bank_transfer", "cash"]).default("pix").notNull(),
  paymentDate: date("paymentDate"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  
  // Recibo
  receiptUrl: varchar("receiptUrl", { length: 500 }), // URL S3
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============================================================================
// AVALIAÇÕES
// ============================================================================

export const evaluations = mysqlTable("evaluations", {
  id: int("id").autoincrement().primaryKey(),
  allocationId: int("allocationId").references(() => allocations.id).notNull(),
  
  // Avaliação
  rating: int("rating").notNull(), // 1-5
  feedback: text("feedback"),
  
  // Quem avaliou
  evaluatedBy: varchar("evaluatedBy", { length: 255 }), // Nome do cliente
  
  // Notificação (se avaliação baixa)
  lowRatingNotified: boolean("lowRatingNotified").default(false),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;

// ============================================================================
// BIBLIOTECA DE PROCEDIMENTOS
// ============================================================================

export const procedures = mysqlTable("procedures", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").references(() => clients.id).notNull(),
  
  // Detalhes do procedimento
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Arquivo
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(), // URL S3
  fileType: varchar("fileType", { length: 50 }), // PDF, video, etc.
  
  // QR Code
  qrCodeUrl: varchar("qrCodeUrl", { length: 500 }), // URL do QR Code gerado
  
  // Versionamento
  version: varchar("version", { length: 20 }).default("1.0").notNull(),
  
  // Status
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Procedure = typeof procedures.$inferSelect;
export type InsertProcedure = typeof procedures.$inferInsert;

// ============================================================================
// LOG DE LEITURA DE PROCEDIMENTOS
// ============================================================================

export const procedureReadLogs = mysqlTable("procedureReadLogs", {
  id: int("id").autoincrement().primaryKey(),
  procedureId: int("procedureId").references(() => procedures.id).notNull(),
  workerId: int("workerId").references(() => workers.id).notNull(),
  
  // Confirmação de leitura
  readAt: timestamp("readAt").defaultNow().notNull(),
  confirmedRead: boolean("confirmedRead").default(false),
});

export type ProcedureReadLog = typeof procedureReadLogs.$inferSelect;
export type InsertProcedureReadLog = typeof procedureReadLogs.$inferInsert;

// ============================================================================
// OPERAÇÕES (Agrupamento de alocações com líder)
// ============================================================================

export const operations = mysqlTable("operations", {
  id: int("id").autoincrement().primaryKey(),
  
  // Relacionamentos
  clientId: int("clientId").references(() => clients.id).notNull(),
  locationId: int("locationId").references(() => workLocations.id).notNull(),
  contractId: int("contractId").references(() => contracts.id),
  shiftId: int("shiftId").references(() => shifts.id).notNull(),
  leaderId: int("leaderId").references(() => users.id).notNull(), // Líder de equipe
  createdBy: int("createdBy").references(() => users.id).notNull(), // Admin que criou
  
  // Detalhes da operação
  operationName: varchar("operationName", { length: 255 }).notNull(),
  workDate: date("workDate").notNull(),
  description: text("description"),
  
  // Status do ciclo de vida
  status: mysqlEnum("status", [
    "created",        // Criada pelo admin
    "pending_accept", // Aguardando aceite dos trabalhadores
    "accepted",       // Todos aceitaram
    "in_progress",    // Líder iniciou a operação
    "completed",      // Líder finalizou
    "billed"          // Faturada
  ]).default("created").notNull(),
  
  // Timestamps do ciclo
  acceptedAt: timestamp("acceptedAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  billedAt: timestamp("billedAt"),
  
  // Valores totais
  totalWorkers: int("totalWorkers").default(0),
  totalDailyRate: decimal("totalDailyRate", { precision: 10, scale: 2 }),
  totalMealCost: decimal("totalMealCost", { precision: 10, scale: 2 }),
  totalNetPay: decimal("totalNetPay", { precision: 10, scale: 2 }),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Operation = typeof operations.$inferSelect;
export type InsertOperation = typeof operations.$inferInsert;

// ============================================================================
// MEMBROS DA OPERAÇÃO (Trabalhadores alocados)
// ============================================================================

export const operationMembers = mysqlTable("operationMembers", {
  id: int("id").autoincrement().primaryKey(),
  
  // Relacionamentos
  operationId: int("operationId").references(() => operations.id).notNull(),
  workerId: int("workerId").references(() => workers.id).notNull(),
  allocationId: int("allocationId").references(() => allocations.id), // Link com alocação individual
  
  // Função e valores
  jobFunction: varchar("jobFunction", { length: 100 }).notNull(),
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }).notNull(),
  
  // Status individual
  status: mysqlEnum("status", [
    "invited",      // Convidado para a operação
    "accepted",     // Aceitou via CPF + termo
    "rejected",     // Recusou
    "present",      // Presente (check-in feito)
    "absent",       // Faltou
    "completed"     // Concluiu a operação
  ]).default("invited").notNull(),
  
  // Aceite
  acceptedAt: timestamp("acceptedAt"),
  acceptanceIp: varchar("acceptanceIp", { length: 45 }),
  cpfConfirmed: boolean("cpfConfirmed").default(false),
  termAccepted: boolean("termAccepted").default(false),
  
  // Check-in/out
  checkInTime: timestamp("checkInTime"),
  checkOutTime: timestamp("checkOutTime"),
  
  // Consumo
  tookMeal: boolean("tookMeal").default(false),
  usedEpi: boolean("usedEpi").default(false),
  
  // Observações
  notes: text("notes"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OperationMember = typeof operationMembers.$inferSelect;
export type InsertOperationMember = typeof operationMembers.$inferInsert;

// ============================================================================
// OCORRÊNCIAS DA OPERAÇÃO
// ============================================================================

export const operationIncidents = mysqlTable("operationIncidents", {
  id: int("id").autoincrement().primaryKey(),
  
  // Relacionamentos
  operationId: int("operationId").references(() => operations.id).notNull(),
  memberId: int("memberId").references(() => operationMembers.id), // Opcional: se for específico de um trabalhador
  reportedBy: int("reportedBy").references(() => users.id).notNull(), // Quem reportou (geralmente o líder)
  
  // Tipo de ocorrência
  incidentType: mysqlEnum("incidentType", [
    "absence",          // Falta
    "late_arrival",     // Atraso
    "early_departure",  // Saída antecipada
    "misconduct",       // Falta grave
    "accident",         // Acidente
    "equipment_issue",  // Problema com equipamento
    "quality_issue",    // Problema de qualidade
    "other"             // Outro
  ]).notNull(),
  
  // Severidade
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  
  // Descrição
  description: text("description").notNull(),
  
  // Evidências
  photos: text("photos"), // JSON array de URLs S3
  
  // Status
  status: mysqlEnum("status", ["open", "investigating", "resolved"]).default("open").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolution: text("resolution"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OperationIncident = typeof operationIncidents.$inferSelect;
export type InsertOperationIncident = typeof operationIncidents.$inferInsert;
