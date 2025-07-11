import { 
  campaigns, 
  contributions, 
  apiConfigs, 
  systemLogs,
  type Campaign, 
  type InsertCampaign,
  type Contribution,
  type InsertContribution,
  type ApiConfig,
  type InsertApiConfig,
  type SystemLog,
  type InsertSystemLog
} from "@shared/schema";

export interface IStorage {
  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getActiveCampaign(): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  
  // Contributions
  getContributions(campaignId?: number): Promise<Contribution[]>;
  getContribution(id: number): Promise<Contribution | undefined>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  updateContribution(id: number, contribution: Partial<InsertContribution>): Promise<Contribution>;
  getContributionsByDateRange(startDate: Date, endDate: Date): Promise<Contribution[]>;
  
  // API Configs
  getApiConfigs(): Promise<ApiConfig[]>;
  getApiConfig(id: number): Promise<ApiConfig | undefined>;
  getApiConfigByType(type: string): Promise<ApiConfig | undefined>;
  createApiConfig(config: InsertApiConfig): Promise<ApiConfig>;
  updateApiConfig(id: number, config: Partial<InsertApiConfig>): Promise<ApiConfig>;
  
  // System Logs
  getSystemLogs(limit?: number): Promise<SystemLog[]>;
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;
}

import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default campaign if none exists
    this.initializeDefaultCampaign();
  }

  private async initializeDefaultCampaign() {
    try {
      const existingCampaigns = await db.select().from(campaigns);
      if (existingCampaigns.length === 0) {
        await this.createCampaign({
          name: "Family Fundraiser - March 2024",
          startDate: new Date("2024-03-01"),
          endDate: new Date("2024-03-31"),
          isActive: true
        });
      }
    } catch (error) {
      console.error("Error initializing default campaign:", error);
    }
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getActiveCampaign(): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.isActive, true));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign> {
    const [updated] = await db.update(campaigns).set(campaign).where(eq(campaigns.id, id)).returning();
    if (!updated) throw new Error("Campaign not found");
    return updated;
  }

  // Contributions
  async getContributions(campaignId?: number): Promise<Contribution[]> {
    if (campaignId) {
      return await db.select().from(contributions).where(eq(contributions.campaignId, campaignId));
    }
    return await db.select().from(contributions);
  }

  async getContribution(id: number): Promise<Contribution | undefined> {
    const [contribution] = await db.select().from(contributions).where(eq(contributions.id, id));
    return contribution || undefined;
  }

  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const [newContribution] = await db.insert(contributions).values(contribution).returning();
    return newContribution;
  }

  async updateContribution(id: number, contribution: Partial<InsertContribution>): Promise<Contribution> {
    const [updated] = await db.update(contributions).set(contribution).where(eq(contributions.id, id)).returning();
    if (!updated) throw new Error("Contribution not found");
    return updated;
  }

  async getContributionsByDateRange(startDate: Date, endDate: Date): Promise<Contribution[]> {
    return await db.select().from(contributions).where(
      and(
        gte(contributions.date, startDate),
        lte(contributions.date, endDate)
      )
    );
  }

  // API Configs
  async getApiConfigs(): Promise<ApiConfig[]> {
    return await db.select().from(apiConfigs);
  }

  async getApiConfig(id: number): Promise<ApiConfig | undefined> {
    const [config] = await db.select().from(apiConfigs).where(eq(apiConfigs.id, id));
    return config || undefined;
  }

  async getApiConfigByType(type: string): Promise<ApiConfig | undefined> {
    const [config] = await db.select().from(apiConfigs).where(eq(apiConfigs.type, type));
    return config || undefined;
  }

  async createApiConfig(config: InsertApiConfig): Promise<ApiConfig> {
    const [newConfig] = await db.insert(apiConfigs).values(config).returning();
    return newConfig;
  }

  async updateApiConfig(id: number, config: Partial<InsertApiConfig>): Promise<ApiConfig> {
    const [updated] = await db.update(apiConfigs).set(config).where(eq(apiConfigs.id, id)).returning();
    if (!updated) throw new Error("API Config not found");
    return updated;
  }

  // System Logs
  async getSystemLogs(limit = 100): Promise<SystemLog[]> {
    return await db.select().from(systemLogs).orderBy(desc(systemLogs.timestamp)).limit(limit);
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const [newLog] = await db.insert(systemLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
