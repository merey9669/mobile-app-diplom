import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Badge, COLORS } from '../components/UI';
import { Task, UserRole, User } from '../types';
import { formatDateInput, isValidDate } from '../utils/dateMask';
import { showToast } from '../utils/toast';

interface TasksScreenProps {
  tasks: Task[];
  users: User[];
  role: UserRole;
  currentUserId?: string;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateStatus: (id: string, status: Task['status']) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  users,
  role,
  currentUserId,
  onAddTask,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'ALL' | Task['status']>('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Состояние формы создания задачи
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);

  // Для сотрудника показываем только задачи, назначенные ему
  // Для руководителя показываем все задачи
  const userTasks = role === 'EMPLOYEE' && currentUserId
    ? tasks.filter(t => {
        console.log(`Checking task ${t.id}: assigneeId=${t.assigneeId}, currentUserId=${currentUserId}, match=${t.assigneeId === currentUserId}`);
        return t.assigneeId === currentUserId;
      })
    : tasks;

  console.log(`👤 Current User ID: ${currentUserId}`);
  console.log(`🎭 Role: ${role}, Total tasks: ${tasks.length}, User tasks: ${userTasks.length}, Current filter: ${filter}`);

  const filteredTasks = userTasks.filter((t) => filter === 'ALL' || t.status === filter);

  console.log(`Filtered tasks (${filter}): ${filteredTasks.length}`, filteredTasks.map(t => ({id: t.id, title: t.title, status: t.status})));
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const assignableUsers = users.filter((user) => user.role === 'EMPLOYEE');

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'DONE':
        return 'green';
      case 'IN_PROGRESS':
        return 'blue';
      default:
        return 'red';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'DONE':
        return 'Выполнено';
      case 'IN_PROGRESS':
        return 'В работе';
      default:
        return 'Назначено';
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      showToast.error('Ошибка', 'Введите название задачи');
      return;
    }
    if (!newTaskDescription.trim()) {
      showToast.error('Ошибка', 'Введите описание задачи');
      return;
    }
    if (!newTaskDeadline.trim()) {
      showToast.error('Ошибка', 'Введите срок выполнения');
      return;
    }
    if (!isValidDate(newTaskDeadline)) {
      showToast.error('Ошибка', 'Введите корректную дату в формате ДД.ММ.ГГГГ');
      return;
    }

    // Проверяем, что дата не в прошлом
    const today = new Date();
    const [day, month, year] = newTaskDeadline.split('.').map(Number);
    const taskDate = new Date(year, month - 1, day);

    today.setHours(0, 0, 0, 0);
    if (taskDate.getTime() < today.getTime()) {
      showToast.error('Ошибка', 'Нельзя установить срок выполнения в прошлом');
      return;
    }
    if (!selectedAssignee) {
      showToast.error('Ошибка', 'Выберите исполнителя');
      return;
    }

    console.log('📋 Creating task with assignee:', selectedAssignee);
    console.log('📋 Available users:', users.map(u => ({ id: u.id, name: u.name })));

    const newTask: Omit<Task, 'id'> = {
      title: newTaskTitle,
      description: newTaskDescription,
      deadline: newTaskDeadline,
      createdAt: new Date().toLocaleDateString('ru-RU'),
      status: 'PENDING',
      assigneeId: selectedAssignee.id,
      assigneeAvatar: selectedAssignee.avatar,
      history: [
        {
          date: new Date().toLocaleString('ru-RU'),
          action: 'Задача создана',
          author: 'Менеджер'
        }
      ]
    };

    console.log('📋 Task to be created:', { assigneeId: newTask.assigneeId, assigneeName: selectedAssignee.name });

    try {
      await onAddTask(newTask);
      showToast.success('Успешно', 'Задача создана');

      // Очистка формы
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDeadline('');
      setSelectedAssignee(null);
      setShowCreate(false);
    } catch (error) {
      console.error('Error adding task:', error);
      showToast.error('Ошибка', 'Не удалось создать задачу');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'DONE'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              style={[
                styles.filterChip,
                filter === f && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f === 'ALL'
                  ? 'Все'
                  : f === 'PENDING'
                  ? 'Назначено'
                  : f === 'IN_PROGRESS'
                  ? 'В процессе'
                  : 'Выполнено'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {role === 'MANAGER' && (
          <Button
            fullWidth
            variant="outline"
            onPress={() => setShowCreate(true)}
            style={styles.addButton}
          >
            + Назначить задачу
          </Button>
        )}

        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            onPress={() => setSelectedTaskId(task.id)}
            style={styles.taskCard}
          >
            <View style={styles.taskHeader}>
              <Badge color={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
              <View style={styles.deadline}>
                <Ionicons name="time-outline" size={12} color={COLORS.gray[400]} />
                <Text style={styles.deadlineText}>{task.deadline}</Text>
              </View>
            </View>

            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDesc} numberOfLines={2}>
              {task.description}
            </Text>
          </Card>
        ))}
      </ScrollView>

      {selectedTask && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedTaskId(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Детали задачи</Text>
              <TouchableOpacity
                onPress={() => setSelectedTaskId(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color={COLORS.gray[700]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Card style={styles.taskDetailCard}>
                <Badge color={getStatusColor(selectedTask.status)}>
                  {getStatusLabel(selectedTask.status)}
                </Badge>
                <Text style={styles.detailTitle}>{selectedTask.title}</Text>
                <Text style={styles.detailDesc}>{selectedTask.description}</Text>

                <View style={styles.actions}>
                  {selectedTask.status === 'PENDING' && (
                    <Button
                      fullWidth
                      onPress={() => {
                        onUpdateStatus(selectedTask.id, 'IN_PROGRESS');
                        setSelectedTaskId(null);
                      }}
                    >
                      Взять в работу
                    </Button>
                  )}
                  {selectedTask.status === 'IN_PROGRESS' && (
                    <Button
                      fullWidth
                      onPress={() => {
                        onUpdateStatus(selectedTask.id, 'DONE');
                        setSelectedTaskId(null);
                      }}
                    >
                      Завершить
                    </Button>
                  )}
                </View>
              </Card>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Modal для создания задачи */}
      <Modal
        visible={showCreate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Новая задача</Text>
            <TouchableOpacity
              onPress={() => setShowCreate(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={COLORS.gray[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Название задачи</Text>
              <TextInput
                style={styles.input}
                placeholder="Введите название задачи"
                placeholderTextColor={COLORS.gray[400]}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Описание</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Введите описание"
                placeholderTextColor={COLORS.gray[400]}
                multiline
                numberOfLines={4}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Срок выполнения *</Text>
              <TextInput
                style={styles.input}
                placeholder="ДД.ММ.ГГГГ"
                placeholderTextColor={COLORS.gray[400]}
                value={newTaskDeadline}
                onChangeText={(text) => setNewTaskDeadline(formatDateInput(text))}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Исполнитель</Text>
              {assignableUsers.length === 0 ? (
                <View style={styles.emptyAssignees}>
                  <Ionicons name="people-outline" size={22} color={COLORS.gray[400]} />
                  <Text style={styles.emptyAssigneesText}>
                    Сотрудники не загрузились. Проверьте, что пользователи зарегистрированы с ролью "Сотрудник" и в Firebase Rules разрешено чтение коллекции users.
                  </Text>
                </View>
              ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userPicker}>
                {assignableUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userChip,
                      selectedAssignee?.id === user.id && styles.userChipSelected
                    ]}
                    onPress={() => setSelectedAssignee(user)}
                  >
                    <Text style={[
                      styles.userChipText,
                      selectedAssignee?.id === user.id && styles.userChipTextSelected
                    ]}>
                      {user.name}
                    </Text>
                    <Text style={[
                      styles.userChipDepartment,
                      selectedAssignee?.id === user.id && styles.userChipDepartmentSelected
                    ]}>
                      {user.department}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              )}
            </View>

            <Button
              fullWidth
              onPress={handleCreateTask}
            >
              Создать задачу
            </Button>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[500],
  },
  filterTextActive: {
    color: COLORS.surface,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  addButton: {
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[400],
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[800],
    marginBottom: 8,
  },
  taskDesc: {
    fontSize: 14,
    color: COLORS.gray[500],
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
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  taskDetailCard: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginTop: 12,
    marginBottom: 12,
  },
  detailDesc: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  userPicker: {
    flexDirection: 'row',
  },
  userChip: {
    backgroundColor: COLORS.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  userChipText: {
    color: COLORS.gray[700],
    fontSize: 14,
    fontWeight: '600',
  },
  userChipTextSelected: {
    color: COLORS.surface,
  },
  userChipDepartment: {
    color: COLORS.gray[500],
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  userChipDepartmentSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyAssignees: {
    minHeight: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.gray[50],
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyAssigneesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.gray[500],
  },
});
