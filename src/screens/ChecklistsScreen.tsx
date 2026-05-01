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
import { Checklist, ChecklistItem, UserRole } from '../types';

interface ChecklistsScreenProps {
  lists: Checklist[];
  role: UserRole;
  currentUserName?: string;
  currentUserId: string;
  onUpdate: (id: string, items: ChecklistItem[]) => void;
  onAdd: (checklist: Omit<Checklist, 'id'>) => void;
}

export const ChecklistsScreen: React.FC<ChecklistsScreenProps> = ({
  lists,
  role,
  currentUserName,
  currentUserId,
  onUpdate,
  onAdd,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [newItems, setNewItems] = useState<string[]>(['']);

  const toggleItem = (listId: string, itemId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const updatedItems = list.items.map((i) =>
      i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
    );
    onUpdate(listId, updatedItems);
  };

  const handleAddItemInput = (index: number, val: string) => {
    const updated = [...newItems];
    updated[index] = val;
    setNewItems(updated);
  };

  const addInputLine = () => setNewItems([...newItems, '']);
  const removeInputLine = (index: number) => {
    if (newItems.length === 1) return;
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!title) return;
    const items = newItems
      .filter((t) => t.trim() !== '')
      .map((t, i) => ({ id: `i-${Date.now()}-${i}`, text: t, isCompleted: false }));

    onAdd({
      title,
      items,
      createdBy: currentUserId,
    });
    setShowAdd(false);
    setTitle('');
    setNewItems(['']);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Button
          fullWidth
          variant="outline"
          onPress={() => setShowAdd(true)}
          style={styles.addButton}
        >
          + Создать чек-лист
        </Button>

        {lists.map((list) => {
          const completed = list.items.filter((i) => i.isCompleted).length;
          const total = list.items.length;
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

          return (
            <Card key={list.id} style={styles.listCard}>
              <View style={styles.listHeader}>
                <View style={styles.titleContainer}>
                  <Text style={styles.listTitle}>{list.title}</Text>
                </View>
                <Badge color={progress === 100 ? 'green' : 'blue'}>
                  {progress}%
                </Badge>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress}%` },
                    progress === 100 && styles.progressBarComplete,
                  ]}
                />
              </View>

              <View style={styles.itemsContainer}>
                {list.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemRow}
                    onPress={() => toggleItem(list.id, item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={item.isCompleted ? COLORS.green[500] : COLORS.gray[300]}
                    />
                    <Text
                      style={[
                        styles.itemText,
                        item.isCompleted && styles.itemTextCompleted,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <Modal
        visible={showAdd}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdd(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Новый чек-лист</Text>
            <TouchableOpacity
              onPress={() => setShowAdd(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={COLORS.gray[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Название списка</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Например: Закрытие магазина"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Пункты</Text>
              {newItems.map((item, idx) => (
                <View key={idx} style={styles.itemInputRow}>
                  <TextInput
                    style={[styles.textInput, styles.itemInput]}
                    placeholder={`Пункт ${idx + 1}`}
                    value={item}
                    onChangeText={(val) => handleAddItemInput(idx, val)}
                    placeholderTextColor={COLORS.gray[400]}
                  />
                  <TouchableOpacity
                    onPress={() => removeInputLine(idx)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.gray[400]} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addInputLine} style={styles.addItemButton}>
                <Ionicons name="add" size={16} color={COLORS.primary} />
                <Text style={styles.addItemText}>Добавить пункт</Text>
              </TouchableOpacity>
            </View>

            <Button fullWidth onPress={handleCreate}>
              Создать чек-лист
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
  listCard: {
    marginBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  createdByText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray[500],
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.gray[100],
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressBarComplete: {
    backgroundColor: COLORS.green[500],
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
    flex: 1,
  },
  itemTextCompleted: {
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
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
  formContent: {
    flex: 1,
    padding: 24,
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
  textInput: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  itemInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  itemInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    padding: 4,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
