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

export class MemStorage implements IStorage {
  private campaigns: Map<number, Campaign> = new Map();
  private contributions: Map<number, Contribution> = new Map();
  private apiConfigs: Map<number, ApiConfig> = new Map();
  private systemLogs: Map<number, SystemLog> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with default campaign
    this.createCampaign({
      name: "Family Fundraiser - March 2024",
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-03-31"),
      isActive: true
    });
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getActiveCampaign(): Promise<Campaign | undefined> {
    return Array.from(this.campaigns.values()).find(c => c.isActive);
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentId++;
    const newCampaign: Campaign = {
      ...campaign,
      id,
      createdAt: new Date()
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign> {
    const existing = this.campaigns.get(id);
    if (!existing) throw new Error("Campaign not found");
    
    const updated = { ...existing, ...campaign };
    this.campaigns.set(id, updated);
    return updated;
  }

  // Contributions
  async getContributions(campaignId?: number): Promise<Contribution[]> {
    const contributions = Array.from(this.contributions.values());
    return campaignId 
      ? contributions.filter(c => c.campaignId === campaignId)
      : contributions;
  }

  async getContribution(id: number): Promise<Contribution | undefined> {
    return this.contributions.get(id);
  }

  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const id = this.currentId++;
    const newContribution: Contribution = {
      ...contribution,
      id,
      createdAt: new Date()
    };
    this.contributions.set(id, newContribution);
    return newContribution;
  }

  async updateContribution(id: number, contribution: Partial<InsertContribution>): Promise<Contribution> {
    const existing = this.contributions.get(id);
    if (!existing) throw new Error("Contribution not found");
    
    const updated = { ...existing, ...contribution };
    this.contributions.set(id, updated);
    return updated;
  }

  async getContributionsByDateRange(startDate: Date, endDate: Date): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(c => 
      c.date >= startDate && c.date <= endDate
    );
  }

  // API Configs
  async getApiConfigs(): Promise<ApiConfig[]> {
    return Array.from(this.apiConfigs.values());
  }

  async getApiConfig(id: number): Promise<ApiConfig | undefined> {
    return this.apiConfigs.get(id);
  }

  async getApiConfigByType(type: string): Promise<ApiConfig | undefined> {
    return Array.from(this.apiConfigs.values()).find(c => c.type === type);
  }

  async createApiConfig(config: InsertApiConfig): Promise<ApiConfig> {
    const id = this.currentId++;
    const newConfig: ApiConfig = {
      ...config,
      id,
      createdAt: new Date()
    };
    this.apiConfigs.set(id, newConfig);
    return newConfig;
  }

  async updateApiConfig(id: number, config: Partial<InsertApiConfig>): Promise<ApiConfig> {
    const existing = this.apiConfigs.get(id);
    if (!existing) throw new Error("API Config not found");
    
    const updated = { ...existing, ...config };
    this.apiConfigs.set(id, updated);
    return updated;
  }

  // System Logs
  async getSystemLogs(limit = 100): Promise<SystemLog[]> {
    const logs = Array.from(this.systemLogs.values())
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
    return logs.slice(0, limit);
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const id = this.currentId++;
    const newLog: SystemLog = {
      ...log,
      id,
      timestamp: new Date()
    };
    this.systemLogs.set(id, newLog);
    return newLog;
  }
}

export const storage = new MemStorage();
