
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'essential', name: '🏠 Essential', icon: 'house', isCustom: false },
  { id: 'travel', name: '🚗 Travel', icon: 'car', isCustom: false },
  { id: 'food', name: '🍔 Food', icon: 'utensils', isCustom: false },
  { id: 'study', name: '📚 Study', icon: 'book', isCustom: false },
  { id: 'shopping', name: '🛍️ Shopping', icon: 'bag-shopping', isCustom: false },
  { id: 'entertainment', name: '🎬 Entertainment', icon: 'film', isCustom: false },
  { id: 'mobile', name: '📱 Mobile & Internet', icon: 'mobile-screen', isCustom: false },
  { id: 'others', name: '📦 Others', icon: 'box', isCustom: false },
];

export const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'
];
