import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // WORKERS (Trabalhadores)
  // ============================================================================
  workers: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllWorkers();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getWorkerById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        fullName: z.string(),
        cpf: z.string(),
        phone: z.string(),
        pixKey: z.string().optional(),
        workerType: z.enum(["daily", "clt", "freelancer", "mei"]),
        dailyRate: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const workerData = {
          ...input,
          dailyRate: input.dailyRate?.toString(),
        };
        return await db.createWorker(workerData);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          fullName: z.string().optional(),
          phone: z.string().optional(),
          pixKey: z.string().optional(),
          status: z.enum(["active", "inactive", "blocked"]).optional(),
          dailyRate: z.number().optional(),
        })
      }))
      .mutation(async ({ input }) => {
        const updateData = {
          ...input.data,
          dailyRate: input.data.dailyRate?.toString(),
        };
        return await db.updateWorker(input.id, updateData);
      }),
    
    calculateRisk: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        clientId: z.number(),
        locationId: z.number(),
      }))
      .query(async ({ input }) => {
        const risk = await db.calculateWorkerRisk(
          input.workerId,
          input.clientId,
          input.locationId
        );
        
        return {
          score: risk.score,
          level: risk.level,
          consecutiveDays: risk.consecutiveDays,
          daysInMonth: risk.daysInMonth,
          monthsWithClient: risk.monthsCount,
        };
      }),
    
    getRiskDashboard: protectedProcedure.query(async () => {
      const workers = await db.getAllWorkers();
      
      const lowRisk = workers.filter(w => w.riskLevel === 'low');
      const mediumRisk = workers.filter(w => w.riskLevel === 'medium');
      const highRisk = workers.filter(w => w.riskLevel === 'high');
      const criticalRisk = workers.filter(w => w.riskLevel === 'critical');
      
      return {
        total: workers.length,
        lowRisk: lowRisk.length,
        mediumRisk: mediumRisk.length,
        highRisk: highRisk.length,
        criticalRisk: criticalRisk.length,
        highRiskWorkers: highRisk.concat(criticalRisk),
      };
    }),
  }),

  // ============================================================================
  // CLIENTS (Clientes)
  // ============================================================================
  clients: router({
    list: protectedProcedure.query(async () => {
      const clients = await db.getAllClients();
      
      // Adicionar locais para cada cliente
      const clientsWithLocations = await Promise.all(
        clients.map(async (client) => {
          const locations = await db.getLocationsByClient(client.id);
          return { ...client, locations };
        })
      );
      
      return clientsWithLocations;
    }),
    
    create: protectedProcedure
      .input(z.object({
        companyName: z.string(),
        cnpj: z.string(),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createClient(input);
      }),
  }),

  // ============================================================================
  // WORK LOCATIONS (Locais de Trabalho)
  // ============================================================================
  locations: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getLocationsByClient(input.clientId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        locationName: z.string(),
        address: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.createWorkLocation(input);
      }),
  }),

  // ============================================================================
  // ALLOCATIONS (Alocações)
  // ============================================================================
  allocations: router({
    list: protectedProcedure
      .input(z.object({
        workerId: z.number().optional(),
        clientId: z.number().optional(),
        locationId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAllocations(input);
      }),
    
    create: protectedProcedure
      .input(z.object({
        workerId: z.number(),
        clientId: z.number(),
        locationId: z.number(),
        workDate: z.string(),
        jobFunction: z.string(),
        dailyRate: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Verificar risco antes de criar alocação
        const risk = await db.calculateWorkerRisk(
          input.workerId,
          input.clientId,
          input.locationId
        );
        
        // Bloquear se risco for crítico
        if (risk.level === 'critical') {
          throw new Error(
            `BLOQUEADO: Trabalhador em risco crítico (score: ${risk.score}). ` +
            `${risk.consecutiveDays} dias consecutivos, ${risk.daysInMonth} dias/mês.`
          );
        }
        
        // Alertar se risco for alto
        if (risk.level === 'high') {
          console.warn(
            `⚠️ ATENÇÃO: Trabalhador em risco alto (score: ${risk.score}). ` +
            `Considere rodízio.`
          );
        }
        
        // Converter tipos para o schema
        const allocationData = {
          ...input,
          workDate: new Date(input.workDate),
          dailyRate: input.dailyRate.toString(),
        };
        
        return await db.createAllocation(allocationData);
      }),
    
    suggestWorkers: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        locationId: z.number(),
        workDate: z.string(),
        quantity: z.number().optional().default(5),
      }))
      .query(async ({ input }) => {
        const allWorkers = await db.getAllWorkers();
        const activeWorkers = allWorkers.filter(w => w.status === 'active');
        
        // Calcular risco para cada trabalhador
        const workersWithRisk = await Promise.all(
          activeWorkers.map(async (worker) => {
            const risk = await db.calculateWorkerRisk(
              worker.id,
              input.clientId,
              input.locationId
            );
            return { ...worker, risk };
          })
        );
        
        // Ordenar por menor risco
        const sorted = workersWithRisk.sort((a, b) => a.risk.score - b.risk.score);
        
        // Retornar os melhores candidatos
        const quantity = input.quantity || 5;
        return sorted.slice(0, quantity * 2); // 2x para dar opções
      }),
  }),
});

export type AppRouter = typeof appRouter;
