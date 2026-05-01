import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { showToast } from './src/utils/toast';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { MainNavigator } from './src/navigation/MainNavigator';
import { authService, UserProfile } from './src/services/authService';
import { firestoreService } from './src/services/firestoreService';
import {  NewsItem, Checklist, Task, ChatMessage, Product, DocumentItem, UserRole, PerformanceEvaluation, AppRating, AppLanguage } from './src/types';
import { COLORS } from './src/components/UI';
import { seedDatabase, clearOldChecklists, clearOldTasks } from './src/data/seedData';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppState = 'SPLASH' | 'ONBOARDING' | 'AUTH' | 'MAIN';

export default function App() {
  const [appState, setAppState] = useState<AppState>('SPLASH');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [language, setLanguage] = useState<AppLanguage>('kk');

  // Firebase data
  const [news, setNews] = useState<NewsItem[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);
  const [performanceEvaluations, setPerformanceEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [appRatings, setAppRatings] = useState<AppRating[]>([]);

  // Состояния для отслеживания просмотренных элементов
  const [lastViewedNews, setLastViewedNews] = useState<string>('');
  const [lastViewedProducts, setLastViewedProducts] = useState<string>('');
  const [lastViewedTasks, setLastViewedTasks] = useState<string>('');
  const [lastViewedMessages, setLastViewedMessages] = useState<string>('');

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage === 'ru' || savedLanguage === 'kk') {
          setLanguage(savedLanguage);
        }

        const user = await authService.getCurrentUser();
        if (user) {
          setUserProfile(user);
          setAppState('MAIN');
        } else {
          setAppState('ONBOARDING');
        }
      } catch (error) {
        setAppState('ONBOARDING');
      } finally {
        setInitializing(false);
      }
    };

    checkAuth();
  }, []);

  const changeLanguage = async (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    await AsyncStorage.setItem('appLanguage', nextLanguage);
  };

  // Seed database on first launch (check Firestore, not local storage)
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Проверяем наличие данных в Firestore напрямую
        const newsCount = await firestoreService.getNewsCount();
        const productsCount = await firestoreService.getProductsCount();

        // Если в базе нет новостей и продуктов, запускаем seed
        if (newsCount === 0 && productsCount === 0) {
          console.log('Database is empty, seeding...');
          const success = await seedDatabase();
          if (success) {
            console.log('Database seeded successfully');
          } else {
            console.log('Database seeding failed - check Firebase permissions');
          }
        } else {
          console.log('Database already has data, skipping seed...');
        }
      } catch (error) {
        console.log('Database initialization skipped - check Firebase permissions');
      }
    };

    if (appState === 'MAIN') {
      initializeData();
    }
  }, [appState]);

  // Subscribe to Firebase collections
  useEffect(() => {
    if (appState === 'MAIN' && userProfile) {
      const unsubNews = firestoreService.subscribeToNews(setNews);
      const unsubChecklists = firestoreService.subscribeToChecklists(userProfile.uid, setChecklists);
      const unsubTasks = firestoreService.subscribeToTasks(userProfile.uid, userProfile.role, setTasks);
      const unsubMessages = firestoreService.subscribeToMessages(setChatMessages);
      const unsubProducts = firestoreService.subscribeToProducts(setProducts);
      const unsubDocs = firestoreService.subscribeToDocuments(setDocuments);
      const unsubUsers = firestoreService.subscribeToUsers(setRealUsers, userProfile);
      const unsubEvaluations = firestoreService.subscribeToPerformanceEvaluations(setPerformanceEvaluations);
      const unsubAppRatings = firestoreService.subscribeToAppRatings(setAppRatings);

      // Очистка старых данных после подписки (с задержкой, чтобы дать время на загрузку)
      const cleanupTimer = setTimeout(async () => {
        try {
          console.log('⏰ Starting cleanup timer...');

          // Очистка старых чек-листов
          const checklistCount = await clearOldChecklists();
          if (checklistCount > 0) {
            console.log(`✅ Successfully deleted ${checklistCount} old checklists with numeric IDs`);
          }

          // Очистка старых задач
          const taskCount = await clearOldTasks();
          if (taskCount > 0) {
            console.log(`✅ Successfully deleted ${taskCount} old tasks with numeric IDs`);
          }
        } catch (error) {
          console.error('Error clearing old data:', error);
        }
      }, 3000);

      return () => {
        clearTimeout(cleanupTimer);
        unsubNews();
        unsubChecklists();
        unsubTasks();
        unsubMessages();
        unsubProducts();
        unsubDocs();
        unsubUsers();
        unsubEvaluations();
        unsubAppRatings();
      };
    }
  }, [appState, userProfile]);

  const handleLogin = (profile: UserProfile) => {
    console.log('👤 User logged in:', { uid: profile.uid, name: profile.name, email: profile.email, role: profile.role });
    setUserProfile(profile);
    setAppState('MAIN');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUserProfile(null);
      setAppState('AUTH');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateChecklist = async (id: string, items: any[]) => {
    try {
      // Найдем текущий чек-лист, чтобы сохранить все поля
      const currentChecklist = checklists.find(c => c.id === id);
      if (!currentChecklist) {
        console.error('Checklist not found in local state:', id);
        return;
      }

      console.log('Updating checklist:', id, 'with items:', items);

      // Обновляем только поле items, не весь документ
      await firestoreService.updateChecklist(id, { items });
      console.log('Checklist updated successfully');
    } catch (error: any) {
      console.error('Error updating checklist in Firebase:', error);
      if (error.message?.includes('does not exist')) {
        console.error('This checklist ID does not exist in Firestore. It may be a leftover from old data.');
        // Optionally: remove from local state or refresh data
      }
    }
  };

  const addChecklist = async (list: Omit<Checklist, 'id'>) => {
    try {
      const checklistId = await firestoreService.addChecklist(list);
      console.log('Checklist created with ID:', checklistId);
      // Firebase subscription автоматически обновит локальное состояние
    } catch (error) {
      console.error('Error creating checklist:', error);
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      console.log('Creating new task:', task);
      const taskId = await firestoreService.addTask(task);
      console.log('✅ Task created successfully with ID:', taskId);
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    console.log('Updating task status:', id, 'to', status);

    const task = tasks.find((t) => t.id === id);
    if (!task) {
      console.error('Task not found:', id);
      return;
    }

    if (!userProfile) {
      console.error('User profile not found');
      return;
    }

    const historyEntry = {
      date: new Date().toLocaleString('ru-RU'),
      action: `Статус изменен на "${
        status === 'DONE' ? 'Выполнено' : status === 'IN_PROGRESS' ? 'В работе' : 'Назначено'
      }"`,
      author: userProfile.name,
    };

    try {
      const updateData: Partial<Task> = {
        status,
        history: [historyEntry, ...(task.history || [])],
      };

      if (status === 'DONE') {
        updateData.completedAt = new Date().toLocaleString('ru-RU');
      }

      await firestoreService.updateTask(id, updateData);
      console.log('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const sendMessage = async (text: string, recipientId?: string) => {
    if (!userProfile || !recipientId) return;

    console.log('Sending message:', { text, recipientId, senderId: userProfile.uid });

    const newMsg: Omit<ChatMessage, 'id' | 'timestamp'> = {
      sender: userProfile.name,
      text,
      isMe: false, // Не используется при сохранении, определяется при отображении
      avatar: userProfile.avatar,
      recipientId,
      senderId: userProfile.uid,
    };

    try {
      await firestoreService.addMessage(newMsg);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const addNews = async (item: Omit<NewsItem, 'id'>) => {
    console.log('Adding news:', item);
    try {
      const newsId = await firestoreService.addNews(item);
      console.log('News added successfully with ID:', newsId);
    } catch (error) {
      console.error('Error adding news:', error);
      showToast.error('Ошибка', 'Не удалось добавить новость');
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    await firestoreService.addProduct(product);
  };

  const addDocument = async (document: Omit<DocumentItem, 'id'>) => {
    await firestoreService.addDocument(document);
  };

  const savePerformanceEvaluation = async (evaluation: Omit<PerformanceEvaluation, 'id' | 'updatedAt'>) => {
    const optimisticEvaluation: PerformanceEvaluation = {
      ...evaluation,
      id: evaluation.employeeId,
      updatedAt: new Date(),
    };

    setPerformanceEvaluations((current) => {
      const exists = current.some((item) => item.employeeId === evaluation.employeeId);
      if (exists) {
        return current.map((item) =>
          item.employeeId === evaluation.employeeId ? optimisticEvaluation : item
        );
      }
      return [...current, optimisticEvaluation];
    });

    try {
      await firestoreService.savePerformanceEvaluation(evaluation);
    } catch (error) {
      console.error('Error saving KPI evaluation:', error);
      showToast.error('Firebase', 'Оценка показана на экране, но не сохранилась в базе. Проверьте Firestore Rules.');
    }
  };

  const rateApp = async (rating: number) => {
    if (!userProfile) return;

    const optimisticRating: AppRating = {
      id: userProfile.uid,
      userId: userProfile.uid,
      userName: userProfile.name,
      rating,
      updatedAt: new Date(),
    };

    setAppRatings((current) => {
      const exists = current.some((item) => item.userId === userProfile.uid);
      if (exists) {
        return current.map((item) =>
          item.userId === userProfile.uid ? optimisticRating : item
        );
      }
      return [...current, optimisticRating];
    });

    try {
      await firestoreService.saveAppRating({
        userId: userProfile.uid,
        userName: userProfile.name,
        rating,
      });
    } catch (error) {
      console.error('Error saving app rating:', error);
      showToast.error('Firebase', 'Оценка показана на экране, но не сохранилась в базе. Проверьте Firestore Rules.');
    }
  };

  const getAppRatingSummary = () => {
    const count = appRatings.length;
    const average = count > 0
      ? appRatings.reduce((sum, item) => sum + item.rating, 0) / count
      : 0;
    const currentUserRating = appRatings.find((item) => item.userId === userProfile?.uid)?.rating;

    return { average, count, currentUserRating };
  };

  // Подсчет новых элементов для badge
  const getNewNewsCount = () => {
    if (!lastViewedNews || news.length === 0) return 0;
    const lastViewedIndex = news.findIndex(item => item.id === lastViewedNews);
    return lastViewedIndex === -1 ? news.length : lastViewedIndex;
  };

  const getNewProductsCount = () => {
    if (!lastViewedProducts || products.length === 0) return 0;
    const lastViewedIndex = products.findIndex(item => item.id === lastViewedProducts);
    return lastViewedIndex === -1 ? products.length : lastViewedIndex;
  };

  const getNewTasksCount = () => {
    if (!lastViewedTasks || !userProfile) return 0;
    const userTasks = tasks.filter(task => task.assigneeId === userProfile.uid && task.status === 'PENDING');
    const lastViewedIndex = userTasks.findIndex(task => task.id === lastViewedTasks);
    return lastViewedIndex === -1 ? userTasks.length : Math.max(0, lastViewedIndex);
  };

  const getUnreadMessagesCount = () => {
    if (!userProfile || chatMessages.length === 0) return 0;
    // Подсчитываем непрочитанные сообщения (не от текущего пользователя и после последнего просмотра)
    const lastViewedTime = lastViewedMessages || '0';
    return chatMessages.filter(msg =>
      msg.senderId !== userProfile.uid &&
      msg.recipientId === userProfile.uid &&
      (msg.createdAt?.seconds > parseInt(lastViewedTime) || !lastViewedTime)
    ).length;
  };

  const markNewsAsViewed = () => {
    if (news.length > 0) {
      setLastViewedNews(news[0].id);
    }
  };

  const markProductsAsViewed = () => {
    if (products.length > 0) {
      setLastViewedProducts(products[0].id);
    }
  };

  const markTasksAsViewed = () => {
    if (!userProfile) return;
    const userTasks = tasks.filter(task => task.assigneeId === userProfile.uid && task.status === 'PENDING');
    if (userTasks.length > 0) {
      setLastViewedTasks(userTasks[0].id);
    }
  };

  const markMessagesAsRead = () => {
    setLastViewedMessages(Date.now().toString());
  };

  if (initializing || appState === 'SPLASH') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        {appState === 'SPLASH' ? (
          <SplashScreen onComplete={() => setAppState('ONBOARDING')} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </SafeAreaProvider>
    );
  }

  if (appState === 'ONBOARDING') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingScreen onComplete={() => setAppState('AUTH')} />
      </SafeAreaProvider>
    );
  }

  if (appState === 'AUTH') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthScreen onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <MainNavigator
        language={language}
        onChangeLanguage={changeLanguage}
        role={userProfile.role}
        currentUser={{
          id: userProfile.uid,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          department: userProfile.department,
          avatar: userProfile.avatar || '',
        }}
        news={news}
        checklists={checklists}
        tasks={tasks}
        chatMessages={chatMessages}
        products={products}
        documents={documents}
        performanceEvaluations={performanceEvaluations}
        appRatingSummary={getAppRatingSummary()}
        users={realUsers.map(user => ({
          id: user.uid,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          department: user.department,
          avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        }))}
        newNewsCount={getNewNewsCount()}
        newProductsCount={getNewProductsCount()}
        newTasksCount={getNewTasksCount()}
        unreadMessagesCount={getUnreadMessagesCount()}
        onMarkNewsAsViewed={markNewsAsViewed}
        onMarkProductsAsViewed={markProductsAsViewed}
        onMarkTasksAsViewed={markTasksAsViewed}
        onMarkMessagesAsRead={markMessagesAsRead}
        onAddNews={addNews}
        onUpdateChecklist={updateChecklist}
        onAddChecklist={addChecklist}
        onAddTask={addTask}
        onUpdateTaskStatus={updateTaskStatus}
        onSendMessage={sendMessage}
        onAddProduct={addProduct}
        onAddDocument={addDocument}
        onSavePerformanceEvaluation={savePerformanceEvaluation}
        onRateApp={rateApp}
        onLogout={handleLogout}
      />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}
