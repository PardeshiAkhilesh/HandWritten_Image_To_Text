import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  duration: string;
  instructions: string;
  sideEffects: string[];
  reminderEnabled: boolean;
  color: string;
  taken: boolean[];
  createdAt: string;
  updatedAt: string;
  category: 'prescription' | 'otc' | 'supplement' | 'vitamin';
  manufacturer?: string;
  expiryDate?: string;
  stockQuantity?: number;
  refillReminder?: boolean;
  doctorName?: string;
  notes?: string;
}

export interface MedicineHistory {
  id: string;
  medicineId: string;
  action: 'taken' | 'missed' | 'skipped' | 'added' | 'updated' | 'deleted';
  timestamp: string;
  notes?: string;
}

export interface ScanResult {
  id: string;
  imageUri: string;
  recognizedText: string;
  medicines: Partial<Medicine>[];
  confidence: number;
  timestamp: string;
  processed: boolean;
}

class MedicineService {
  private readonly MEDICINES_KEY = 'medicines';
  private readonly HISTORY_KEY = 'medicine_history';
  private readonly SCANS_KEY = 'scan_results';

  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const medicinesJson = await AsyncStorage.getItem(this.MEDICINES_KEY);
      return medicinesJson ? JSON.parse(medicinesJson) : [];
    } catch (error) {
      console.error('Error getting medicines:', error);
      return [];
    }
  }

  async getMedicineById(id: string): Promise<Medicine | null> {
    const medicines = await this.getAllMedicines();
    return medicines.find(medicine => medicine.id === id) || null;
  }

  async addMedicine(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> {
    const medicines = await this.getAllMedicines();
    const newMedicine: Medicine = {
      ...medicine,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    medicines.push(newMedicine);
    await AsyncStorage.setItem(this.MEDICINES_KEY, JSON.stringify(medicines));
    
    await this.addToHistory({
      id: this.generateId(),
      medicineId: newMedicine.id,
      action: 'added',
      timestamp: new Date().toISOString(),
    });

    return newMedicine;
  }

  async updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine | null> {
    const medicines = await this.getAllMedicines();
    const index = medicines.findIndex(medicine => medicine.id === id);
    
    if (index === -1) return null;

    medicines[index] = {
      ...medicines[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(this.MEDICINES_KEY, JSON.stringify(medicines));
    
    await this.addToHistory({
      id: this.generateId(),
      medicineId: id,
      action: 'updated',
      timestamp: new Date().toISOString(),
    });

    return medicines[index];
  }

  async deleteMedicine(id: string): Promise<boolean> {
    const medicines = await this.getAllMedicines();
    const filteredMedicines = medicines.filter(medicine => medicine.id !== id);
    
    if (filteredMedicines.length === medicines.length) return false;

    await AsyncStorage.setItem(this.MEDICINES_KEY, JSON.stringify(filteredMedicines));
    
    await this.addToHistory({
      id: this.generateId(),
      medicineId: id,
      action: 'deleted',
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  async markMedicineAsTaken(medicineId: string, timeIndex: number, taken: boolean = true): Promise<boolean> {
    const medicine = await this.getMedicineById(medicineId);
    if (!medicine) return false;

    const newTaken = [...medicine.taken];
    newTaken[timeIndex] = taken;

    await this.updateMedicine(medicineId, { taken: newTaken });
    
    await this.addToHistory({
      id: this.generateId(),
      medicineId,
      action: taken ? 'taken' : 'missed',
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  async getHistory(): Promise<MedicineHistory[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  async addToHistory(historyItem: MedicineHistory): Promise<void> {
    const history = await this.getHistory();
    history.unshift(historyItem);
    
    if (history.length > 1000) {
      history.splice(1000);
    }

    await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  async saveScanResult(scanResult: Omit<ScanResult, 'id' | 'timestamp'>): Promise<ScanResult> {
    const scans = await this.getAllScanResults();
    const newScan: ScanResult = {
      ...scanResult,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    scans.unshift(newScan);
    
    if (scans.length > 50) {
      scans.splice(50);
    }

    await AsyncStorage.setItem(this.SCANS_KEY, JSON.stringify(scans));
    return newScan;
  }

  async getAllScanResults(): Promise<ScanResult[]> {
    try {
      const scansJson = await AsyncStorage.getItem(this.SCANS_KEY);
      return scansJson ? JSON.parse(scansJson) : [];
    } catch (error) {
      console.error('Error getting scan results:', error);
      return [];
    }
  }

  async getStatistics(): Promise<{
    totalMedicines: number;
    takenToday: number;
    missedToday: number;
    totalScans: number;
    adherenceRate: number;
  }> {
    const medicines = await this.getAllMedicines();
    const history = await this.getHistory();
    const scans = await this.getAllScanResults();
    
    const today = new Date().toDateString();
    const todayHistory = history.filter(item => 
      new Date(item.timestamp).toDateString() === today
    );

    const takenToday = todayHistory.filter(item => item.action === 'taken').length;
    const missedToday = todayHistory.filter(item => item.action === 'missed').length;
    
    const totalDoses = medicines.reduce((sum, medicine) => sum + medicine.times.length, 0);
    const adherenceRate = totalDoses > 0 ? (takenToday / totalDoses) * 100 : 0;

    return {
      totalMedicines: medicines.length,
      takenToday,
      missedToday,
      totalScans: scans.length,
      adherenceRate: Math.round(adherenceRate),
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getRandomColor(): string {
    const colors = [
      '#4A90E2', '#27AE60', '#E74C3C', '#F39C12', 
      '#9B59B6', '#1ABC9C', '#E67E22', '#34495E'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async searchMedicines(query: string): Promise<Medicine[]> {
    const medicines = await this.getAllMedicines();
    const lowercaseQuery = query.toLowerCase();
    
    return medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(lowercaseQuery) ||
      medicine.instructions.toLowerCase().includes(lowercaseQuery) ||
      medicine.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async exportData(): Promise<{
    medicines: Medicine[];
    history: MedicineHistory[];
    scans: ScanResult[];
    exportDate: string;
  }> {
    return {
      medicines: await this.getAllMedicines(),
      history: await this.getHistory(),
      scans: await this.getAllScanResults(),
      exportDate: new Date().toISOString(),
    };
  }

  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.MEDICINES_KEY,
      this.HISTORY_KEY,
      this.SCANS_KEY,
    ]);
  }
}

export const medicineService = new MedicineService();