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
  role: mysqlEnum("role", ["admin", "supervisor", "worker", "client"]).default("worker").notNull(),
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
  
  // Dados pessoais
  fullName: varchar("fullName", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  pixKey: varchar("pixKey", { length: 255 }),
  
  // Tipo de contrato
  workerType: mysqlEnum("workerType", ["daily", "freelancer", "mei", "clt"]).notNull(),
  
  // Dados bancários/pagamento
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "blocked"]).default("active").notNull(),
  
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
  
  // Status
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

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
  
  // Data do trabalho
  workDate: date("workDate").notNull(),
  jobFunction: varchar("jobFunction", { length: 100 }), // Função: Ajudante, Conferente, Motorista, etc.
  
  // Status
  status: mysqlEnum("status", ["scheduled", "confirmed", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  
  // Check-in/Check-out
  checkInTime: timestamp("checkInTime"),
  checkOutTime: timestamp("checkOutTime"),
  checkInLocation: varchar("checkInLocation", { length: 100 }), // lat,long
  checkOutLocation: varchar("checkOutLocation", { length: 100 }), // lat,long
  
  // Valores
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }),
  mealTicket: decimal("mealTicket", { precision: 10, scale: 2 }).default("30.00"), // Convenção Coletiva
  
  // Controle de risco
  consecutiveDays: int("consecutiveDays").default(1), // Dias consecutivos no mesmo local
  daysThisMonth: int("daysThisMonth").default(1), // Dias neste mês no mesmo cliente
  riskFlag: boolean("riskFlag").default(false), // true se ultrapassar limites
  
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
