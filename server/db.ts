import { eq, and, gte, lte, desc, sql, count, or, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import { 
  InsertUser, users,
  workers, InsertWorker, Worker,
  clients, InsertClient,
  contracts, InsertContract,
  shifts, InsertShift,
  workLocations, InsertWorkLocation,
  allocations, InsertAllocation,
  workOffers, InsertWorkOffer,
  workerTerms, InsertWorkerTerm,
  shiftChecklists, InsertShiftChecklist,
  epiRecords, InsertEpiRecord,
  incidents, InsertIncident,
  payments, InsertPayment,
  evaluations, InsertEvaluation,
  procedures, InsertProcedure,
  procedureReadLogs, InsertProcedureReadLog,
  operations, InsertOperation,
  operationMembers, InsertOperationMember,
  operationIncidents, InsertOperationIncident
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USERS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// WORKERS (Trabalhadores)
// ============================================================================

export async function createWorker(worker: InsertWorker) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workers).values(worker);
  return result;
}

export async function getWorkerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(workers).where(eq(workers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllWorkers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(workers).orderBy(desc(workers.createdAt));
}

export async function getWorkersByCPF(cpf: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(workers).where(eq(workers.cpf, cpf)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWorker(id: number, data: Partial<InsertWorker>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(workers).set(data).where(eq(workers.id, id));
}

// ============================================================================
// RISK CALCULATION (CRÍTICO)
// ============================================================================

/**
 * Calcula o score de risco trabalhista de um trabalhador
 * Fórmula: (Dias Consecutivos × 10) + (Dias/Mês × 5) + (Meses no Mesmo Cliente × 20)
 * 
 * 0-50: Baixo (🟢)
 * 51-100: Médio (🟡)
 * 101-150: Alto (🔴)
 * 151+: Crítico (🔴🔴)
 */
export async function calculateWorkerRisk(workerId: number, clientId: number, locationId: number) {
  const db = await getDb();
  if (!db) return { score: 0, level: 'low' as const };
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  
  // Calcular dias consecutivos no mesmo local
  const recentAllocations = await db
    .select()
    .from(allocations)
    .where(
      and(
        eq(allocations.workerId, workerId),
        eq(allocations.locationId, locationId),
        sql`${allocations.workDate} >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
      )
    )
    .orderBy(desc(allocations.workDate));
  
  let consecutiveDays = 0;
  let lastDate: Date | null = null;
  
  for (const alloc of recentAllocations) {
    const allocDate = new Date(alloc.workDate);
    if (!lastDate) {
      consecutiveDays = 1;
      lastDate = allocDate;
    } else {
      const diffDays = Math.floor((lastDate.getTime() - allocDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        consecutiveDays++;
        lastDate = allocDate;
      } else {
        break;
      }
    }
  }
  
  // Calcular dias no mês no mesmo cliente
  const daysThisMonth = await db
    .select({ count: count() })
    .from(allocations)
    .where(
      and(
        eq(allocations.workerId, workerId),
        eq(allocations.clientId, clientId),
        sql`${allocations.workDate} >= ${firstDayOfMonth.toISOString().split('T')[0]}`
      )
    );
  
  const daysInMonth = daysThisMonth[0]?.count || 0;
  
  // Calcular meses trabalhando no mesmo cliente
  const monthsWithClient = await db
    .select({ 
      month: sql<string>`DATE_FORMAT(${allocations.workDate}, '%Y-%m') as month` 
    })
    .from(allocations)
    .where(
      and(
        eq(allocations.workerId, workerId),
        eq(allocations.clientId, clientId),
        sql`${allocations.workDate} >= ${threeMonthsAgo.toISOString().split('T')[0]}`
      )
    )
    .groupBy(sql`month`);
  
  const monthsCount = monthsWithClient.length;
  
  // Calcular score
  const score = (consecutiveDays * 10) + (daysInMonth * 5) + (monthsCount * 20);
  
  // Determinar nível
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score <= 50) level = 'low';
  else if (score <= 100) level = 'medium';
  else if (score <= 150) level = 'high';
  else level = 'critical';
  
  return {
    score,
    level,
    consecutiveDays,
    daysInMonth,
    monthsCount
  };
}

export async function updateWorkerRiskScore(workerId: number, score: number, level: 'low' | 'medium' | 'high' | 'critical') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(workers)
    .set({ riskScore: score, riskLevel: level })
    .where(eq(workers.id, workerId));
}

// ============================================================================
// ALLOCATIONS (Alocações)
// ============================================================================

export async function createAllocation(allocation: InsertAllocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Calcular risco antes de criar alocação
  const risk = await calculateWorkerRisk(
    allocation.workerId,
    allocation.clientId,
    allocation.locationId
  );
  
  // Atualizar dados de risco na alocação
  allocation.consecutiveDays = (risk.consecutiveDays || 0) + 1; // +1 porque esta é uma nova alocação
  allocation.daysThisMonth = (risk.daysInMonth || 0) + 1;
  allocation.riskFlag = risk.level === 'high' || risk.level === 'critical';
  
  const result = await db.insert(allocations).values(allocation);
  
  // Atualizar score de risco do trabalhador
  await updateWorkerRiskScore(allocation.workerId, risk.score, risk.level);
  
  return result;
}

export async function getAllocations(filters?: {
  workerId?: number;
  clientId?: number;
  locationId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(allocations);
  
  const conditions = [];
  if (filters?.workerId) conditions.push(eq(allocations.workerId, filters.workerId));
  if (filters?.clientId) conditions.push(eq(allocations.clientId, filters.clientId));
  if (filters?.locationId) conditions.push(eq(allocations.locationId, filters.locationId));
  if (filters?.startDate) conditions.push(sql`${allocations.workDate} >= ${filters.startDate}`);
  if (filters?.endDate) conditions.push(sql`${allocations.workDate} <= ${filters.endDate}`);
  if (filters?.status) conditions.push(eq(allocations.status, filters.status as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(allocations.workDate));
}

export async function updateAllocation(id: number, data: Partial<InsertAllocation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(allocations).set(data).where(eq(allocations.id, id));
}

// ============================================================================
// WORK OFFERS (Ofertas de Trabalho - Documentação de Autonomia)
// ============================================================================

export async function createWorkOffer(offer: InsertWorkOffer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(workOffers).values(offer);
}

export async function getWorkerOffers(workerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(workOffers)
    .where(eq(workOffers.workerId, workerId))
    .orderBy(desc(workOffers.createdAt));
}

export async function respondToOffer(offerId: number, response: 'accepted' | 'refused', refusalReason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(workOffers)
    .set({ 
      response, 
      refusalReason,
      respondedAt: new Date()
    })
    .where(eq(workOffers.id, offerId));
}

// ============================================================================
// CLIENTS
// ============================================================================

export async function createClient(client: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(clients).values(client);
}

export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// WORK LOCATIONS
// ============================================================================

export async function createWorkLocation(location: InsertWorkLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(workLocations).values(location);
}

export async function getLocationsByClient(clientId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (clientId) {
    return await db
      .select()
      .from(workLocations)
      .where(eq(workLocations.clientId, clientId))
      .orderBy(desc(workLocations.createdAt));
  }
  
  return await db.select().from(workLocations).orderBy(desc(workLocations.createdAt));
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(payments).values(payment);
}

export async function getWorkerPayments(workerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(payments)
    .where(eq(payments.workerId, workerId))
    .orderBy(desc(payments.periodEnd));
}

// ============================================================================
// WORKER TERMS
// ============================================================================

export async function createWorkerTerm(term: InsertWorkerTerm) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(workerTerms).values(term);
}

export async function getWorkerLatestTerm(workerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(workerTerms)
    .where(eq(workerTerms.workerId, workerId))
    .orderBy(desc(workerTerms.acceptedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// INCIDENTS
// ============================================================================

export async function createIncident(incident: InsertIncident) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(incidents).values(incident);
}

export async function getAllIncidents() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
}

// ============================================================================
// EVALUATIONS
// ============================================================================

export async function createEvaluation(evaluation: InsertEvaluation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(evaluations).values(evaluation);
}

export async function getAllocationEvaluations(allocationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.allocationId, allocationId))
    .orderBy(desc(evaluations.createdAt));
}


// ============================================================================
// CONTRACTS (Contratos)
// ============================================================================

export async function createContract(contract: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contracts).values(contract);
  return result;
}

export async function getAllContracts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(contracts)
    .orderBy(desc(contracts.createdAt));
}

export async function getContractsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(contracts)
    .where(eq(contracts.clientId, clientId))
    .orderBy(desc(contracts.createdAt));
}

export async function getActiveContractByClient(clientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(contracts)
    .where(
      and(
        eq(contracts.clientId, clientId),
        eq(contracts.status, "active")
      )
    )
    .orderBy(desc(contracts.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .update(contracts)
    .set(data)
    .where(eq(contracts.id, id));
}

// ============================================================================
// SHIFTS (Turnos)
// ============================================================================

export async function createShift(shift: InsertShift) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(shifts).values(shift);
  const insertResult = Array.isArray(result) ? result[0] : result;
  const insertId = Number(insertResult.insertId);
  
  // Fetch and return the created shift
  const [createdShift] = await db
    .select()
    .from(shifts)
    .where(eq(shifts.id, insertId));
  
  return createdShift;
}

export async function getAllShifts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(shifts)
    .orderBy(desc(shifts.createdAt));
}

export async function getShiftsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(shifts)
    .where(eq(shifts.clientId, clientId))
    .orderBy(shifts.shiftName);
}

export async function updateShift(id: number, data: Partial<InsertShift>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(shifts)
    .set(data)
    .where(eq(shifts.id, id));
  
  // Fetch and return the updated shift
  const [updatedShift] = await db
    .select()
    .from(shifts)
    .where(eq(shifts.id, id));
  
  return updatedShift;
}


export async function getLocationById(locationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(workLocations).where(eq(workLocations.id, locationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteShift(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .delete(shifts)
    .where(eq(shifts.id, id));
}


// ============================================================================
// REPORTS (Relatórios)
// ============================================================================

export async function getBiweeklyReport(year: number, month: number, period: "first" | "second", clientId?: number) {
  const db = await getDb();
  if (!db) return { summary: [], details: [] };

  // Determinar intervalo de datas
  const startDay = period === "first" ? 1 : 16;
  const endDay = period === "first" ? 15 : new Date(year, month, 0).getDate(); // último dia do mês
  
  const startDate = `${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  // Buscar alocações confirmadas (com check-in) no período
  const allocationsData = await db
    .select({
      allocationId: allocations.id,
      workDate: sql<string>`${allocations.workDate}`,
      workerId: allocations.workerId,
      workerName: workers.fullName,
      clientId: allocations.clientId,
      clientName: clients.companyName,
      locationId: allocations.locationId,
      locationName: workLocations.locationName,
      shiftId: allocations.shiftId,
      shiftName: shifts.shiftName,
      jobFunction: allocations.jobFunction,
      dailyRate: allocations.dailyRate,
      tookMeal: allocations.tookMeal,
      mealCost: allocations.mealCost,
      netPay: allocations.netPay,
      status: allocations.status,
    })
    .from(allocations)
    .leftJoin(workers, eq(allocations.workerId, workers.id))
    .leftJoin(clients, eq(allocations.clientId, clients.id))
    .leftJoin(workLocations, eq(allocations.locationId, workLocations.id))
    .leftJoin(shifts, eq(allocations.shiftId, shifts.id))
    .where(
      and(
        sql`${allocations.workDate} >= ${startDate}`,
        sql`${allocations.workDate} <= ${endDate}`,
        or(
          eq(allocations.status, "completed"),
          eq(allocations.status, "in_progress")
        ),
        isNotNull(allocations.checkInTime), // Apenas com check-in confirmado
        clientId ? eq(allocations.clientId, clientId) : sql`1=1` // Filtro opcional por cliente
      )
    );

  // Agrupar por cliente e turno
  const groupedData: Record<string, {
    clientId: number;
    clientName: string;
    shifts: Record<string, {
      shiftId: number | null;
      shiftName: string;
      personDays: number;
      workers: Array<{
        workerId: number;
        workerName: string;
        workDate: string;
        locationName: string;
        jobFunction: string | null;
        dailyRate: string | null;
        tookMeal: boolean | null;
        mealCost: string | null;
        netPay: string | null;
      }>;
    }>;
    totalPersonDays: number;
  }> = {};

  for (const allocation of allocationsData) {
    const clientKey = `client_${allocation.clientId}`;
    const shiftKey = allocation.shiftId ? `shift_${allocation.shiftId}` : 'shift_none';
    const shiftName = allocation.shiftName || 'Sem turno definido';
    
    if (!groupedData[clientKey]) {
      groupedData[clientKey] = {
        clientId: allocation.clientId,
        clientName: allocation.clientName || 'Cliente desconhecido',
        shifts: {},
        totalPersonDays: 0,
      };
    }

    if (!groupedData[clientKey].shifts[shiftKey]) {
      groupedData[clientKey].shifts[shiftKey] = {
        shiftId: allocation.shiftId,
        shiftName: shiftName,
        personDays: 0,
        workers: [],
      };
    }

    groupedData[clientKey].shifts[shiftKey].personDays += 1;
    groupedData[clientKey].totalPersonDays += 1;
    
    groupedData[clientKey].shifts[shiftKey].workers.push({
      workerId: allocation.workerId,
      workerName: allocation.workerName || 'Trabalhador desconhecido',
      workDate: allocation.workDate || '',
      locationName: allocation.locationName || 'Local desconhecido',
      jobFunction: allocation.jobFunction,
      dailyRate: allocation.dailyRate,
      tookMeal: allocation.tookMeal,
      mealCost: allocation.mealCost,
      netPay: allocation.netPay,
    });
  }

  // Converter para array para facilitar uso no frontend
  const summary = Object.values(groupedData).map(client => ({
    clientId: client.clientId,
    clientName: client.clientName,
    totalPersonDays: client.totalPersonDays,
    shifts: Object.values(client.shifts).map(shift => ({
      shiftId: shift.shiftId,
      shiftName: shift.shiftName,
      personDays: shift.personDays,
      workerCount: shift.workers.length,
    })),
  }));

  // Detalhamento completo
  const details = Object.values(groupedData).flatMap(client =>
    Object.values(client.shifts).flatMap(shift =>
      shift.workers.map(worker => ({
        clientId: client.clientId,
        clientName: client.clientName,
        shiftId: shift.shiftId,
        shiftName: shift.shiftName,
        ...worker,
      }))
    )
  );

  return {
    period: {
      year,
      month,
      period,
      startDate,
      endDate,
    },
    summary,
    details,
    totalPersonDays: allocationsData.length,
  };
}


// ============================================================================
// WORKER REGISTRATION (Cadastro de trabalhadores)
// ============================================================================

export async function createWorkerRegistration(data: {
  fullName: string;
  cpf: string;
  dateOfBirth: string;
  motherName: string;
  phone: string;
  email?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  pixKey: string;
  pixKeyType: "cpf" | "cnpj" | "email" | "phone" | "random";
  documentPhotoUrl: string;
  documentType: "rg" | "cnh" | "rne";
  workerType: "daily" | "freelancer" | "mei" | "clt";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workers).values({
    fullName: data.fullName,
    cpf: data.cpf,
    dateOfBirth: new Date(data.dateOfBirth),
    motherName: data.motherName,
    phone: data.phone,
    email: data.email,
    street: data.street,
    number: data.number,
    complement: data.complement,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    pixKey: data.pixKey,
    pixKeyType: data.pixKeyType,
    documentPhotoUrl: data.documentPhotoUrl,
    documentType: data.documentType,
    workerType: data.workerType,
    registrationStatus: "pending",
    status: "inactive",
  });

  const insertId = Number((Array.isArray(result) ? result[0] : result).insertId);
  
  // Retornar o trabalhador criado
  const [worker] = await db.select().from(workers).where(eq(workers.id, insertId));
  return worker;
}

export async function getPendingWorkerRegistrations() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(workers)
    .where(eq(workers.registrationStatus, "pending"))
    .orderBy(desc(workers.createdAt));
}

export async function approveWorkerRegistration(workerId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(workers)
    .set({
      registrationStatus: "approved",
      status: "active",
      approvedBy,
      approvedAt: new Date(),
    })
    .where(eq(workers.id, workerId));

  const [worker] = await db.select().from(workers).where(eq(workers.id, workerId));
  return worker;
}

export async function rejectWorkerRegistration(workerId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(workers)
    .set({
      registrationStatus: "rejected",
      rejectionReason: reason,
    })
    .where(eq(workers.id, workerId));

  const [worker] = await db.select().from(workers).where(eq(workers.id, workerId));
  return worker;
}


// ============================================================================
// OPERATIONS
// ============================================================================

export async function createOperation(data: {
  clientId: number;
  locationId: number;
  contractId: number | null;
  shiftId: number;
  leaderId: number;
  createdBy: number;
  operationName: string;
  workDate: string;
  description?: string;
  members: Array<{
    workerId: number;
    jobFunction: string;
    dailyRate: number;
  }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { members, ...operationData } = data;
  
  // Calcular totais
  const totalWorkers = members.length;
  const totalDailyRate = members.reduce((sum, m) => sum + m.dailyRate, 0);
  
  // Criar operação
  const [result] = await db.insert(schema.operations).values({
    clientId: operationData.clientId,
    locationId: operationData.locationId,
    contractId: operationData.contractId,
    shiftId: operationData.shiftId,
    leaderId: operationData.leaderId,
    createdBy: operationData.createdBy,
    operationName: operationData.operationName,
    workDate: new Date(operationData.workDate),
    description: operationData.description,
    status: "created",
  });
  
  const operationId = Number(result.insertId);
  
  // Criar membros
  for (const member of members) {
    await db.insert(schema.operationMembers).values({
      operationId,
      workerId: member.workerId,
      jobFunction: member.jobFunction,
      dailyRate: member.dailyRate.toString(),
      status: "invited",
    });
  }
  
  // Buscar operação completa
  const [operation] = await db
    .select()
    .from(schema.operations)
    .where(eq(schema.operations.id, operationId));
    
  return operation;
}

export async function getOperationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [operation] = await db
    .select()
    .from(schema.operations)
    .where(eq(schema.operations.id, id));
    
  if (!operation) return null;
  
  // Buscar membros
  const members = await db
    .select({
      id: schema.operationMembers.id,
      workerId: schema.operationMembers.workerId,
      workerName: schema.workers.fullName,
      workerCpf: schema.workers.cpf,
      jobFunction: schema.operationMembers.jobFunction,
      dailyRate: schema.operationMembers.dailyRate,
      status: schema.operationMembers.status,
      acceptedAt: schema.operationMembers.acceptedAt,
      checkInTime: schema.operationMembers.checkInTime,
      checkOutTime: schema.operationMembers.checkOutTime,
      tookMeal: schema.operationMembers.tookMeal,
      usedEpi: schema.operationMembers.usedEpi,
      notes: schema.operationMembers.notes,
    })
    .from(schema.operationMembers)
    .leftJoin(schema.workers, eq(schema.operationMembers.workerId, schema.workers.id))
    .where(eq(schema.operationMembers.operationId, id));
  
  return { ...operation, members };
}

export async function getOperationsByLeader(leaderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const operations = await db
    .select({
      id: schema.operations.id,
      operationName: schema.operations.operationName,
      workDate: schema.operations.workDate,
      status: schema.operations.status,
      clientName: schema.clients.companyName,
      locationName: schema.workLocations.locationName,
      shiftName: schema.shifts.shiftName,
      totalWorkers: schema.operations.totalWorkers,
      createdAt: schema.operations.createdAt,
    })
    .from(schema.operations)
    .leftJoin(schema.clients, eq(schema.operations.clientId, schema.clients.id))
    .leftJoin(schema.workLocations, eq(schema.operations.locationId, schema.workLocations.id))
    .leftJoin(schema.shifts, eq(schema.operations.shiftId, schema.shifts.id))
    .where(eq(schema.operations.leaderId, leaderId))
    .orderBy(desc(schema.operations.createdAt));
    
  return operations;
}

export async function acceptOperation(memberId: number, cpf: string, ip: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se o CPF corresponde ao trabalhador
  const [member] = await db
    .select({
      workerId: schema.operationMembers.workerId,
      workerCpf: schema.workers.cpf,
    })
    .from(schema.operationMembers)
    .leftJoin(schema.workers, eq(schema.operationMembers.workerId, schema.workers.id))
    .where(eq(schema.operationMembers.id, memberId));
    
  if (!member || member.workerCpf !== cpf) {
    throw new Error("CPF não corresponde ao trabalhador");
  }
  
  // Atualizar status
  await db
    .update(schema.operationMembers)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
      acceptanceIp: ip,
      cpfConfirmed: true,
      termAccepted: true,
    })
    .where(eq(schema.operationMembers.id, memberId));
    
  return { success: true };
}

export async function startOperation(operationId: number, leaderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se o líder é o correto
  const [operation] = await db
    .select()
    .from(schema.operations)
    .where(eq(schema.operations.id, operationId));
    
  if (!operation || operation.leaderId !== leaderId) {
    throw new Error("Operação não encontrada ou líder incorreto");
  }
  
  // Atualizar status
  await db
    .update(schema.operations)
    .set({
      status: "in_progress",
      startedAt: new Date(),
    })
    .where(eq(schema.operations.id, operationId));
    
  return { success: true };
}

export async function checkInMember(memberId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(schema.operationMembers)
    .set({
      status: "present",
      checkInTime: new Date(),
    })
    .where(eq(schema.operationMembers.id, memberId));
    
  return { success: true };
}

export async function checkOutMember(memberId: number, data: {
  tookMeal: boolean;
  usedEpi: boolean;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(schema.operationMembers)
    .set({
      status: "completed",
      checkOutTime: new Date(),
      tookMeal: data.tookMeal,
      usedEpi: data.usedEpi,
      notes: data.notes,
    })
    .where(eq(schema.operationMembers.id, memberId));
    
  return { success: true };
}

export async function completeOperation(operationId: number, leaderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se o líder é o correto
  const [operation] = await db
    .select()
    .from(schema.operations)
    .where(eq(schema.operations.id, operationId));
    
  if (!operation || operation.leaderId !== leaderId) {
    throw new Error("Operação não encontrada ou líder incorreto");
  }
  
  // Atualizar status
  await db
    .update(schema.operations)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(schema.operations.id, operationId));
    
  return { success: true };
}

export async function createOperationIncident(data: {
  operationId: number;
  memberId?: number;
  reportedBy: number;
  incidentType: "absence" | "late_arrival" | "early_departure" | "misconduct" | "accident" | "equipment_issue" | "quality_issue" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  photos?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(schema.operationIncidents).values(data);
  
  const incidentId = Number(result.insertId);
  
  const [incident] = await db
    .select()
    .from(schema.operationIncidents)
    .where(eq(schema.operationIncidents.id, incidentId));
    
  return incident;
}

export async function getOperationIncidents(operationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const incidents = await db
    .select({
      id: schema.operationIncidents.id,
      memberId: schema.operationIncidents.memberId,
      workerName: schema.workers.fullName,
      reportedByName: schema.users.name,
      incidentType: schema.operationIncidents.incidentType,
      severity: schema.operationIncidents.severity,
      description: schema.operationIncidents.description,
      photos: schema.operationIncidents.photos,
      status: schema.operationIncidents.status,
      createdAt: schema.operationIncidents.createdAt,
    })
    .from(schema.operationIncidents)
    .leftJoin(schema.operationMembers, eq(schema.operationIncidents.memberId, schema.operationMembers.id))
    .leftJoin(schema.workers, eq(schema.operationMembers.workerId, schema.workers.id))
    .leftJoin(schema.users, eq(schema.operationIncidents.reportedBy, schema.users.id))
    .where(eq(schema.operationIncidents.operationId, operationId))
    .orderBy(desc(schema.operationIncidents.createdAt));
    
  return incidents;
}
