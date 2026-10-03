export type UserRole = 'super_admin' | 'moderator' | 'user';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  storageUsedKb: number;
  storageLimitKb: number;
  projectsCount: number;
  projectsLimit: number;
  isBlacklisted: boolean;
  createdAt: string;
}

export interface ProjectVersion {
  version: string;
  timestamp: string;
  note: string;
}

export interface ProjectSeo {
  title: string;
  description: string;
  ogImage?: string;
}

export interface Project {
  id: string;
  userId: string;
  username: string;
  title: string;
  slug: string;
  description: string;
  isPublic: boolean;
  isPublished: boolean;
  hasPassword: boolean;
  password?: string;
  views: number;
  bandwidthKb: number;
  storageKb: number;
  createdAt: string;
  updatedAt: string;
  activeVersion: string;
  takedownReason?: string;
  seo: ProjectSeo;
  files: {
    'index.html': string;
    'style.css': string;
    'script.js': string;
    [key: string]: string;
  };
  versions: ProjectVersion[];
}

export type PaymentMethod = 'bkash' | 'nagad';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentSubmission {
  id: string;
  userId: string;
  username: string;
  method: PaymentMethod;
  senderNumber: string;
  trxId: string;
  plan: 'pro' | 'enterprise';
  amountBdt: number;
  amountUsd: number;
  status: PaymentStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ip: string;
  actor: string;
}

export interface AdminSettings {
  siteTitle: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultFreeStorageKb: number;
  defaultFreeProjects: number;
  maxUploadSizeMb: number;
  malwareSensitivity: 'high' | 'medium' | 'relaxed';
  masterPasswordHash: string;
  totpEnabled: boolean;
  ipWhitelistEnabled: boolean;
  whitelistedIps: string[];
  customGlobalCss: string;
  customGlobalJs: string;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'alert';
}

export interface ConsoleLogMessage {
  id: string;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  time: string;
}

export interface MalwareScanResult {
  isClean: boolean;
  riskScore: number; // 0 - 100
  threats: string[];
}
