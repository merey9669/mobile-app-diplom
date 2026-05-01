import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserRole } from '../types';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: Date;
}

export const authService = {
  // Проверка конфигурации Firebase
  async checkFirebaseConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      // Просто проверяем, что db инициализирован
      if (db && auth) {
        return { connected: true };
      }
      return { connected: false, error: 'Firebase не инициализирован' };
    } catch (error: any) {
      console.error('Firebase connection check failed:', error);
      return {
        connected: false,
        error: error.message || 'Не удалось подключиться к Firebase'
      };
    }
  },
  // Регистрация нового пользователя
  async register(
    email: string,
    password: string,
    name: string,
    role: UserRole,
    department: string
  ): Promise<UserProfile> {
    try {
      // Валидация входных данных
      if (!email || !password || !name || !department) {
        throw new Error('Все поля обязательны для заполнения');
      }

      if (password.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Введите корректный email адрес');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        role,
        department,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366F1&color=fff`,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      return userProfile;
    } catch (error: any) {
      console.error('Registration error:', error);

      // Обработка специфических ошибок Firebase
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Пользователь с таким email уже существует');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Некорректный email адрес');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Пароль слишком слабый');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Проблемы с подключением к интернету');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Неверные учетные данные или неправильная конфигурация Firebase');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Регистрация по email отключена в Firebase Console');
      }

      throw new Error(error.message || 'Ошибка при регистрации');
    }
  },

  // Авторизация
  async login(email: string, password: string): Promise<UserProfile> {
    try {
      // Валидация входных данных
      if (!email || !password) {
        throw new Error('Email и пароль обязательны для заполнения');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Введите корректный email адрес');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('Профиль пользователя не найден. Обратитесь к администратору');
      }

      return userDoc.data() as UserProfile;
    } catch (error: any) {
      console.error('Login error:', error);

      // Обработка специфических ошибок Firebase
      if (error.code === 'auth/user-not-found') {
        throw new Error('Пользователь с таким email не найден');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Неверный пароль');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Некорректный email адрес');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Аккаунт заблокирован');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Слишком много попыток входа. Попробуйте позже');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Проблемы с подключением к интернету');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Неверные учетные данные или неправильная конфигурация Firebase');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Вход по email отключен в Firebase Console');
      }

      throw new Error(error.message || 'Ошибка при входе');
    }
  },

  // Выход
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Получить текущего пользователя
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return null;

      return userDoc.data() as UserProfile;
    } catch (error) {
      return null;
    }
  },

  // Получить профиль по ID
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return null;
      return userDoc.data() as UserProfile;
    } catch (error) {
      return null;
    }
  },
};
