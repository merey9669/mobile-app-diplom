import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { NewsItem, Checklist, Task, ChatMessage, Product, DocumentItem, PerformanceEvaluation, AppRating } from '../types';
import { UserProfile } from './authService';

export const firestoreService = {
  // ============ НОВОСТИ ============
  async addNews(news: Omit<NewsItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'news'), {
      ...news,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  subscribeToNews(callback: (news: NewsItem[]) => void) {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NewsItem[];
      console.log('News subscription update:', news.length, 'items');
      callback(news);
    });
  },

  async deleteNews(id: string): Promise<void> {
    await deleteDoc(doc(db, 'news', id));
  },

  async getNewsCount(): Promise<number> {
    const snapshot = await getDocs(collection(db, 'news'));
    return snapshot.size;
  },

  // ============ ЧЕК-ЛИСТЫ ============
  async addChecklist(checklist: Omit<Checklist, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'checklists'), {
      ...checklist,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  subscribeToChecklists(userId: string, callback: (checklists: Checklist[]) => void) {
    // Фильтруем чек-листы только для текущего пользователя
    // Убрали orderBy('createdAt', 'desc'), чтобы избежать ошибки индексации (requires composite index)
    // Сортировку делаем на клиенте
    const q = query(
      collection(db, 'checklists'),
      where('createdBy', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const checklists = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Checklist[];

      // Фильтруем чек-листы с числовыми ID (старый формат)
      const validChecklists = checklists.filter(checklist => {
        const isNumeric = /^\d+$/.test(checklist.id);
        if (isNumeric) {
          console.log(`⚠️ Filtering out old checklist with numeric ID: ${checklist.id}`);
          return false;
        }
        return true;
      });

      // Сортировка по убыванию даты создания (новые сверху)
      validChecklists.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      console.log(`Checklists subscription update for user ${userId}:`, validChecklists.length, 'items (filtered from', checklists.length, ')');
      console.log('Valid Checklist IDs:', validChecklists.map(c => c.id));
      callback(validChecklists);
    });
  },

  async updateChecklist(id: string, data: Partial<Checklist>): Promise<void> {
    try {
      const docRef = doc(db, 'checklists', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error('Cannot update checklist - document does not exist:', id);
        throw new Error(`Checklist with ID ${id} does not exist`);
      }

      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error in updateChecklist:', error);
      throw error;
    }
  },

  async deleteChecklist(id: string): Promise<void> {
    await deleteDoc(doc(db, 'checklists', id));
  },

  // ============ ЗАДАЧИ ============
  async addTask(task: Omit<Task, 'id'>): Promise<string> {
    try {
      console.log('📝 Adding task to Firestore:', task);
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...task,
        createdAt: serverTimestamp(),
      });
      console.log('✅ Task added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding task to Firestore:', error);
      throw error;
    }
  },

  subscribeToTasks(userId: string, userRole: string, callback: (tasks: Task[]) => void) {
    // Для MANAGER - все задачи, для EMPLOYEE - только свои (assigneeId === userId)
    let q;
    if (userRole === 'MANAGER') {
      // Менеджер видит все задачи
      q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    } else {
      // Сотрудник видит только задачи, назначенные ему
      // Убрали orderBy('createdAt', 'desc') для EMPLOYEE, чтобы не требовать составной индекс
      q = query(
        collection(db, 'tasks'),
        where('assigneeId', '==', userId)
      );
    }

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];

      // Фильтруем задачи с числовыми ID (старый формат)
      const validTasks = tasks.filter(task => {
        const isNumeric = /^\d+$/.test(task.id);
        if (isNumeric) {
          console.log(`⚠️ Filtering out old task with numeric ID: ${task.id}`);
          return false;
        }
        return true;
      });

      // Сортировка на клиенте (новые сверху)
      validTasks.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      console.log(`Tasks subscription update for ${userRole} (${userId}):`, validTasks.length, 'items (filtered from', tasks.length, ')');
      callback(validTasks);
    });
  },

  async updateTask(id: string, data: Partial<Task>): Promise<void> {
    try {
      const docRef = doc(db, 'tasks', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error('Cannot update task - document does not exist:', id);
        throw new Error(`Task with ID ${id} does not exist`);
      }

      await updateDoc(docRef, data);
      console.log('Task updated successfully:', id);
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  },

  async deleteTask(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', id));
  },

  // ============ ЧАТ ============
  async addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    console.log('Firestore: Adding message:', message);
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      createdAt: serverTimestamp(),
    });
    console.log('Firestore: Message added with ID:', docRef.id);
    return docRef.id;
  },

  subscribeToMessages(callback: (messages: ChatMessage[]) => void) {
    console.log('Firestore: Subscribing to messages');
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Генерируем timestamp для отображения из createdAt
        let timestamp = '';
        if (data.createdAt?.toDate) {
          const date = data.createdAt.toDate();
          timestamp = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }

        return {
          id: doc.id,
          ...data,
          timestamp,
        };
      }) as ChatMessage[];
      console.log('Firestore: Loaded messages:', messages.length, messages);
      callback(messages);
    });
  },

  // ============ ПРОДУКТЫ ============
  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  subscribeToProducts(callback: (products: Product[]) => void) {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      callback(products);
    });
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, 'products', id), data);
  },

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, 'products', id));
  },

  async getProductsCount(): Promise<number> {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.size;
  },

  // ============ ДОКУМЕНТЫ ============
  async addDocument(document: Omit<DocumentItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'documents'), {
      ...document,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  subscribeToDocuments(callback: (documents: DocumentItem[]) => void) {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DocumentItem[];
      callback(documents);
    });
  },

  async deleteDocument(id: string): Promise<void> {
    await deleteDoc(doc(db, 'documents', id));
  },

  // ============ KPI-ОЦЕНКИ ============
  async savePerformanceEvaluation(
    evaluation: Omit<PerformanceEvaluation, 'id' | 'updatedAt'>
  ): Promise<void> {
    await setDoc(doc(db, 'performanceEvaluations', evaluation.employeeId), {
      ...evaluation,
      updatedAt: serverTimestamp(),
    });
  },

  subscribeToPerformanceEvaluations(callback: (evaluations: PerformanceEvaluation[]) => void) {
    const q = query(collection(db, 'performanceEvaluations'));

    return onSnapshot(q, (snapshot) => {
      const evaluations = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as PerformanceEvaluation[];
      callback(evaluations);
    }, (error) => {
      console.warn('Performance evaluations are not available. Check Firestore Rules:', error.message);
      callback([]);
    });
  },

  // ============ ОЦЕНКИ ПРИЛОЖЕНИЯ ============
  async saveAppRating(rating: Omit<AppRating, 'id' | 'updatedAt'>): Promise<void> {
    await setDoc(doc(db, 'appRatings', rating.userId), {
      ...rating,
      updatedAt: serverTimestamp(),
    });
  },

  subscribeToAppRatings(callback: (ratings: AppRating[]) => void) {
    const q = query(collection(db, 'appRatings'));

    return onSnapshot(q, (snapshot) => {
      const ratings = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as AppRating[];
      callback(ratings);
    }, (error) => {
      console.warn('App ratings are not available. Check Firestore Rules:', error.message);
      callback([]);
    });
  },

  // ============ ПОЛЬЗОВАТЕЛИ ============
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: UserProfile[] = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        users.push(userData);
      });

      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  subscribeToUsers(callback: (users: UserProfile[]) => void, fallbackUser?: UserProfile) {
    const q = query(collection(db, 'users'));

    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((document) => {
        const data = document.data() as UserProfile;
        return {
          ...data,
          uid: data.uid || document.id,
        };
      });

      users.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      console.log('Users subscription update:', users.length, 'registered users');
      callback(users);
    }, (error) => {
      console.warn('Users list is not available. Check Firestore Rules:', error.message);
      callback(fallbackUser ? [fallbackUser] : []);
    });
  },

};
