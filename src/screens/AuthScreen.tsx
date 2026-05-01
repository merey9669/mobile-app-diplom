import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Input, Button, COLORS } from '../components/UI';
import { UserRole } from '../types';
import { authService, UserProfile } from '../services/authService';

interface AuthScreenProps {
  onLogin: (userProfile: UserProfile) => void;
}

const DEPARTMENTS = [
  'Продажи',
  'Маркетинг',
  'Разработка',
  'HR',
  'Финансы',
  'Администрация',
  'Логистика',
  'Техническая поддержка',
  'Производство',
  'Другое',
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [loading, setLoading] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await authService.checkFirebaseConnection();
        setFirebaseConnected(result.connected);
        if (!result.connected) {
          console.warn('Firebase connection issue:', result.error);
        }
      } catch (error) {
        setFirebaseConnected(false);
        console.error('Failed to check Firebase connection:', error);
      }
    };

    checkConnection();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.decorContainer}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.logo}
            >
              <Text style={styles.logoText}>Es</Text>
            </LinearGradient>
            <Text style={styles.title}>Дипломка</Text>
            <Text style={styles.subtitle}>Работайте умнее, вместе.</Text>
          </View>

          <View style={styles.formCard}>
            {firebaseConnected === false && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ Проблемы с подключением к Firebase. Проверьте конфигурацию и интернет-соединение.
                </Text>
              </View>
            )}

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  Вход
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  Регистрация
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <>
                <Input
                  label="Имя и Фамилия"
                  placeholder="Иван Иванов"
                  value={name}
                  onChangeText={setName}
                />
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Отдел</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowDepartmentModal(true)}
                  >
                    <Text style={[styles.selectText, !department && styles.placeholderText]}>
                      {department || 'Выберите отдел'}
                    </Text>
                    <Text style={styles.selectArrow}>▼</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>Роль</Text>
                  <View style={styles.roleButtons}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        role === 'EMPLOYEE' && styles.roleButtonActive,
                      ]}
                      onPress={() => setRole('EMPLOYEE')}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          role === 'EMPLOYEE' && styles.roleButtonTextActive,
                        ]}
                      >
                        Сотрудник
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        role === 'MANAGER' && styles.roleButtonActive,
                      ]}
                      onPress={() => setRole('MANAGER')}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          role === 'MANAGER' && styles.roleButtonTextActive,
                        ]}
                      >
                        Руководитель
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            <Input
              label="Email"
              placeholder="user@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Пароль"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.buttonContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <Button
                  fullWidth
                  onPress={async () => {
                    try {
                      setLoading(true);
                      if (isLogin) {
                        const userProfile = await authService.login(email, password);
                        onLogin(userProfile);
                      } else {
                        if (!name || !department) {
                          Alert.alert('Ошибка', 'Заполните все поля');
                          return;
                        }
                        const userProfile = await authService.register(
                          email,
                          password,
                          name,
                          role,
                          department
                        );
                        onLogin(userProfile);
                      }
                    } catch (error: any) {
                      Alert.alert('Ошибка', error.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {isLogin ? 'Войти' : 'Зарегистрироваться'}
                </Button>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal для выбора отдела */}
      <Modal
        visible={showDepartmentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите отдел</Text>
            <TouchableOpacity
              onPress={() => setShowDepartmentModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {DEPARTMENTS.map((dept) => (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.departmentOption,
                  department === dept && styles.departmentOptionSelected,
                ]}
                onPress={() => {
                  setDepartment(dept);
                  setShowDepartmentModal(false);
                }}
              >
                <Text
                  style={[
                    styles.departmentOptionText,
                    department === dept && styles.departmentOptionTextSelected,
                  ]}
                >
                  {dept}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  decorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle1: {
    position: 'absolute',
    top: '-10%',
    right: '-20%',
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(224, 231, 255, 0.4)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-20%',
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  content: {
    padding: 32,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.surface,
    letterSpacing: -1,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray[500],
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  buttonContainer: {
    paddingTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  roleButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  warningContainer: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginBottom: 8,
  },
  selectInput: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.gray[400],
  },
  selectArrow: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.gray[600],
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  departmentOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  departmentOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  departmentOptionText: {
    fontSize: 16,
    color: COLORS.gray[700],
    fontWeight: '500',
  },
  departmentOptionTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});
