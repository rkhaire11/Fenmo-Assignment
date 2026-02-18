import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data/expenses.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Check if DB file exists, if not create usage empty array
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  idempotencyKey?: string;
}

export const db = {
  read: (): Expense[] => {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read DB', error);
      return [];
    }
  },
  write: (expenses: Expense[]) => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(expenses, null, 2));
    } catch (error) {
      console.error('Failed to write DB', error);
    }
  },
  delete: (id: string) => {
    try {
      const expenses = db.read();
      const newExpenses = expenses.filter(e => e.id !== id);
      db.write(newExpenses);
      return true;
    } catch (error) {
      console.error('Failed to delete from DB', error);
      return false;
    }
  }
};
