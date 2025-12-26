
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO String
  userId: string;
  isShared?: boolean;
}

export interface User {
  id: string;
  name: string;
  contact: string; // email or phone
  password?: string;
  pocketMoney: number;
  savingsGoalPercent: number;
}

export interface RoomMember {
  userId: string;
  name: string;
  spent: number;
}

export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  members: RoomMember[];
  sharedExpenses: Expense[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
}

export interface AppState {
  user: User | null;
  expenses: Expense[];
  rooms: Room[];
  categories: Category[];
}
