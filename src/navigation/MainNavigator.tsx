import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../components/UI';

import { NewsScreen } from '../screens/NewsScreen';
import { ChecklistsScreen } from '../screens/ChecklistsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { PerformanceScreen } from '../screens/PerformanceScreen';

import { NewsItem, Checklist, Task, ChatMessage, Product, UserRole, User, DocumentItem, PerformanceEvaluation, AppRatingSummary, AppLanguage } from '../types';

const Tab = createBottomTabNavigator();

const labels = {
  ru: {
    appName: 'Эффект+',
    managerPanel: 'Управление эффективностью',
    employeeResult: 'Личный результат',
    documents: 'Документы',
    profile: 'Профиль',
    language: 'Язык приложения',
    role: 'Роль',
    department: 'Отдел',
    email: 'Email',
    manager: 'Руководитель',
    employee: 'Сотрудник',
    close: 'Закрыть',
    logout: 'Выйти',
    tabs: {
      kpi: 'KPI',
      control: 'Контроль',
      tasks: 'Задачи',
      rating: 'Рейтинг',
      chat: 'Чат',
      bonuses: 'Бонусы',
    },
  },
  kk: {
    appName: 'Әсер+',
    managerPanel: 'Тиімділікті басқару',
    employeeResult: 'Жеке нәтиже',
    documents: 'Құжаттар',
    profile: 'Профиль',
    language: 'Қолданба тілі',
    role: 'Рөлі',
    department: 'Бөлім',
    email: 'Email',
    manager: 'Жетекші',
    employee: 'Қызметкер',
    close: 'Жабу',
    logout: 'Шығу',
    tabs: {
      kpi: 'KPI',
      control: 'Бақылау',
      tasks: 'Тапсырмалар',
      rating: 'Рейтинг',
      chat: 'Чат',
      bonuses: 'Бонустар',
    },
  },
};

interface MainNavigatorProps {
  language: AppLanguage;
  onChangeLanguage: (language: AppLanguage) => void;
  role: UserRole;
  currentUser: User;
  news: NewsItem[];
  checklists: Checklist[];
  tasks: Task[];
  chatMessages: ChatMessage[];
  products: Product[];
  documents: DocumentItem[];
  performanceEvaluations: PerformanceEvaluation[];
  appRatingSummary: AppRatingSummary;
  users: User[];
  newNewsCount: number;
  newProductsCount: number;
  newTasksCount: number;
  unreadMessagesCount: number;
  onMarkNewsAsViewed: () => void;
  onMarkProductsAsViewed: () => void;
  onMarkTasksAsViewed: () => void;
  onMarkMessagesAsRead: () => void;
  onAddNews: (item: Omit<NewsItem, 'id'>) => void;
  onUpdateChecklist: (id: string, items: any[]) => void;
  onAddChecklist: (list: Omit<Checklist, 'id'>) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTaskStatus: (id: string, status: Task['status']) => void;
  onSendMessage: (text: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onAddDocument: (document: Omit<DocumentItem, 'id'>) => void;
  onSavePerformanceEvaluation: (evaluation: Omit<PerformanceEvaluation, 'id' | 'updatedAt'>) => void;
  onRateApp: (rating: number) => void;
  onLogout: () => void;
}

export const MainNavigator: React.FC<MainNavigatorProps> = ({
  language,
  onChangeLanguage,
  role,
  currentUser,
  news,
  checklists,
  tasks,
  chatMessages,
  products,
  documents,
  performanceEvaluations,
  appRatingSummary,
  users,
  newNewsCount,
  newProductsCount,
  newTasksCount,
  unreadMessagesCount,
  onMarkNewsAsViewed,
  onMarkProductsAsViewed,
  onMarkTasksAsViewed,
  onMarkMessagesAsRead,
  onAddNews,
  onUpdateChecklist,
  onAddChecklist,
  onAddTask,
  onUpdateTaskStatus,
  onSendMessage,
  onAddProduct,
  onAddDocument,
  onSavePerformanceEvaluation,
  onRateApp,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const [showDocuments, setShowDocuments] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const t = labels[language];

  return (
    <>
      <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{t.appName}</Text>
            <Text style={styles.headerSubtitle}>
              {role === 'MANAGER' ? t.managerPanel : `${t.employeeResult}: ${currentUser.name}`}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowProfile(true)}
            >
              <Ionicons name="person-outline" size={24} color={COLORS.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowDocuments(true)}
            >
              <Ionicons name="document-text-outline" size={24} color={COLORS.surface} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            let badgeCount = 0;

            if (route.name === 'News') {
              iconName = 'analytics';
              badgeCount = newNewsCount;
            } else if (route.name === 'Checklists') {
              iconName = 'checkbox';
            } else if (route.name === 'Tasks') {
              iconName = 'briefcase';
              badgeCount = newTasksCount;
            } else if (route.name === 'Performance') {
              iconName = 'trophy';
            } else if (route.name === 'Chat') {
              iconName = 'chatbubble';
              badgeCount = unreadMessagesCount;
            } else if (route.name === 'Catalog') {
              iconName = 'gift';
              badgeCount = newProductsCount;
            }

            return (
              <View>
                <Ionicons
                  name={iconName}
                  size={size}
                  color={color}
                />
                {badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray[400],
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: Platform.OS === 'ios' ? 84 + insets.bottom : 68,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            paddingTop: 8,
            backgroundColor: COLORS.surface,
            borderTopWidth: 1,
            borderTopColor: COLORS.gray[100],
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        })}
      >
        <Tab.Screen
          name="News"
          options={{ tabBarLabel: t.tabs.kpi }}
          listeners={{
            focus: onMarkNewsAsViewed,
          }}
        >
          {() => (
            <NewsScreen
              news={news}
              role={role}
              tasks={tasks}
              users={users}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              appRatingSummary={appRatingSummary}
              language={language}
              onAddNews={onAddNews}
              onRateApp={onRateApp}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Checklists"
          options={{ tabBarLabel: t.tabs.control }}
        >
          {() => (
            <ChecklistsScreen
              lists={checklists}
              role={role}
              currentUserName={currentUser.name}
              currentUserId={currentUser.id}
              onUpdate={onUpdateChecklist}
              onAdd={onAddChecklist}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Tasks"
          options={{ tabBarLabel: t.tabs.tasks }}
          listeners={{
            focus: onMarkTasksAsViewed,
          }}
        >
          {() => (
            <TasksScreen
              tasks={tasks}
              users={users}
              role={role}
              currentUserId={currentUser.id}
              onAddTask={onAddTask}
              onUpdateStatus={onUpdateTaskStatus}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Performance"
          options={{ tabBarLabel: t.tabs.rating }}
        >
          {() => (
            <PerformanceScreen
              tasks={tasks}
              users={users}
              role={role}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              evaluations={performanceEvaluations}
              language={language}
              onSaveEvaluation={onSavePerformanceEvaluation}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Chat"
          options={{ tabBarLabel: t.tabs.chat }}
          listeners={{
            focus: onMarkMessagesAsRead,
          }}
        >
          {() => (
            <ChatScreen
              messages={chatMessages}
              currentUser={currentUser}
              users={users}
              onSend={onSendMessage}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Catalog"
          options={{ tabBarLabel: t.tabs.bonuses }}
          listeners={{
            focus: onMarkProductsAsViewed,
          }}
        >
          {() => <CatalogScreen products={products} role={role} onAddProduct={onAddProduct} />}
        </Tab.Screen>
      </Tab.Navigator>

      {/* Modal для документов */}
      <Modal
        visible={showDocuments}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDocuments(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.documents}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDocuments(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.gray[600]} />
            </TouchableOpacity>
          </View>
          <DocumentsScreen documents={documents} role={role} onAddDocument={onAddDocument} />
        </View>
      </Modal>

      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfile(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.profile}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProfile(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.gray[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileContent}>
            <Image source={{ uri: currentUser.avatar }} style={styles.profileAvatar} />
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileRole}>
              {role === 'MANAGER' ? t.manager : t.employee}
            </Text>

            <View style={styles.profileInfoCard}>
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileInfoLabel}>{t.email}</Text>
                <Text style={styles.profileInfoValue}>{currentUser.email || '-'}</Text>
              </View>
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileInfoLabel}>{t.department}</Text>
                <Text style={styles.profileInfoValue}>{currentUser.department}</Text>
              </View>
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileInfoLabel}>{t.role}</Text>
                <Text style={styles.profileInfoValue}>
                  {role === 'MANAGER' ? t.manager : t.employee}
                </Text>
              </View>
            </View>

            <Text style={styles.languageTitle}>{t.language}</Text>
            <View style={styles.languageSwitch}>
              <TouchableOpacity
                style={[styles.languageButton, language === 'kk' && styles.languageButtonActive]}
                onPress={() => onChangeLanguage('kk')}
              >
                <Text style={[styles.languageButtonText, language === 'kk' && styles.languageButtonTextActive]}>
                  Қазақша
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.languageButton, language === 'ru' && styles.languageButtonActive]}
                onPress={() => onChangeLanguage('ru')}
              >
                <Text style={[styles.languageButtonText, language === 'ru' && styles.languageButtonTextActive]}>
                  Русский
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.profileLogoutButton} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.red[600]} />
              <Text style={styles.profileLogoutText}>{t.logout}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabIcon: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  profileContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.gray[100],
    marginBottom: 14,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
    marginBottom: 18,
  },
  profileInfoCard: {
    width: '100%',
    backgroundColor: COLORS.gray[50],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    padding: 16,
    marginBottom: 22,
  },
  profileInfoRow: {
    marginBottom: 14,
  },
  profileInfoLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.gray[400],
    marginBottom: 4,
  },
  profileInfoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray[800],
  },
  languageTitle: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.gray[800],
    marginBottom: 10,
  },
  languageSwitch: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  languageButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  languageButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.gray[600],
  },
  languageButtonTextActive: {
    color: COLORS.surface,
  },
  profileLogoutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.red[50],
  },
  profileLogoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.red[600],
  },
});
