// Mock firebase admin since we are simulating the DB or relying on drizzle
export interface AdminDb {
  collection(name: string): {
    doc(id?: string): {
      id: string;
      set(data: Record<string, unknown>): Promise<void>;
      get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>;
      update(data: Record<string, unknown>): Promise<void>;
    };
  };
}

export interface AdminAuth {
  verifyIdToken(token: string): Promise<{ uid: string; [key: string]: unknown }>;
}

export const adminDb: AdminDb | null = null;
export const adminAuth: AdminAuth | null = null;
