// Storage interface for the Site Inspector Agent
// This service doesn't require persistent storage as it performs
// real-time website analysis based on incoming requests

export interface IStorage {
  // Placeholder for future storage needs
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage needed for current MVP
  }
}

export const storage = new MemStorage();
