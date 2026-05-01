export type UserRole = 'EMPLOYEE' | 'MANAGER';
export type AppLanguage = 'ru' | 'kk';

export interface User {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  date: string;
  imageUrl?: string;
  author?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdBy?: string;
  createdAt?: any; // Firestore Timestamp
}

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'file';
}

export interface TaskHistoryItem {
  date: string;
  action: string;
  author: string;
}

export interface Task {
  id: string;
  title: string;
  deadline: string;
  createdAt: string;
  completedAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  description?: string;
  assigneeId?: string;
  assigneeAvatar?: string;
  attachments?: Attachment[];
  history?: TaskHistoryItem[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp?: string; // Генерируется на клиенте для отображения
  isMe: boolean;
  avatar?: string;
  recipientId?: string;
  senderId?: string;
  createdAt?: any; // Firestore Timestamp для сортировки
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'PDF' | 'IMAGE' | 'DOC';
  date: string;
  url?: string; // URL файла в Firebase Storage
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price?: string;
  image: string;
  description: string;
  features?: string[]; // Характеристики товара
}

export interface PerformanceEvaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  quality: number;
  discipline: number;
  teamwork: number;
  comment?: string;
  managerId: string;
  managerName: string;
  updatedAt?: any;
}

export interface AppRating {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  updatedAt?: any;
}

export interface AppRatingSummary {
  average: number;
  count: number;
  currentUserRating?: number;
}
