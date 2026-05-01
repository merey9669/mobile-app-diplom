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
import { Card, COLORS } from '../components/UI';
import { DocumentItem, UserRole } from '../types';
import { Linking, Clipboard } from 'react-native';
import { showToast } from '../utils/toast';

interface DocumentsScreenProps {
  documents: DocumentItem[];
  role: UserRole;
  onAddDocument?: (document: Omit<DocumentItem, 'id'>) => void;
}

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ documents, role, onAddDocument }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'PDF' as 'PDF' | 'IMAGE' | 'DOC',
    date: new Date().toLocaleDateString('ru-RU'),
    url: ''
  });
  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'document-text';
      case 'IMAGE':
        return 'image';
      case 'DOC':
        return 'document';
      default:
        return 'document';
    }
  };

  const handleDocumentPress = (document: DocumentItem) => {
    setSelectedDocument(document);
  };

  const handleAddDocument = () => {
    if (!newDocument.title.trim()) {
      showToast.error('Ошибка', 'Введите название документа');
      return;
    }

    if (!newDocument.url.trim()) {
      showToast.error('Ошибка', 'Введите ссылку на документ');
      return;
    }

    // Validate URL format
    try {
      new URL(newDocument.url);
    } catch {
      showToast.error('Ошибка', 'Введите корректную ссылку на документ');
      return;
    }

    onAddDocument?.({
      title: newDocument.title,
      type: newDocument.type,
      date: newDocument.date,
      url: newDocument.url
    });

    showToast.success('Успешно', 'Документ добавлен');

    setNewDocument({
      title: '',
      type: 'PDF',
      date: new Date().toLocaleDateString('ru-RU'),
      url: ''
    });
    setShowAddModal(false);
  };


  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {documents.map((doc) => (
            <Card key={doc.id} onPress={() => handleDocumentPress(doc)} style={styles.docCard}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIcon(doc.type) as any}
                  size={32}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.docTitle} numberOfLines={1}>
                {doc.title}
              </Text>
              <Text style={styles.docDate}>{doc.date}</Text>
            </Card>
          ))}

          {role === 'MANAGER' && (
            <TouchableOpacity
              style={styles.addCard}
              onPress={() => setShowAddModal(true)}
            >
              <View style={styles.addIconContainer}>
                <Ionicons name="add" size={24} color={COLORS.primary} />
              </View>
              <Text style={[styles.addText, styles.addTextManager]}>
                Добавить
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Модальное окно просмотра документа */}
      {selectedDocument && (
        <Modal
          visible={true}
          animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDocument(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedDocument.title}</Text>
            <TouchableOpacity onPress={() => setSelectedDocument(null)}>
              <Ionicons name="close" size={28} color={COLORS.gray[700]} />
            </TouchableOpacity>
          </View>

          <View style={styles.documentViewer}>
            <View style={styles.documentInfo}>
              <View style={styles.documentIconContainer}>
                <Ionicons
                  name={getIcon(selectedDocument.type) as any}
                  size={64}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.documentType}>{selectedDocument.type}</Text>
              <Text style={styles.documentDate}>Дата: {selectedDocument.date}</Text>
            </View>

            <View style={styles.documentActions}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={async () => {
                  if (selectedDocument.url) {
                    try {
                      const supported = await Linking.canOpenURL(selectedDocument.url);
                      if (supported) {
                        await Linking.openURL(selectedDocument.url);
                      } else {
                        showToast.error('Ошибка', 'Не удалось открыть ссылку на документ');
                      }
                    } catch (error) {
                      showToast.error('Ошибка', 'Не удалось открыть документ');
                      console.error('Error opening document:', error);
                    }
                  } else {
                    showToast.error('Ошибка', 'Ссылка на документ отсутствует');
                  }
                }}
              >
                <Ionicons name="eye" size={20} color={COLORS.surface} />
                <Text style={styles.viewButtonText}>Открыть</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={async () => {
                  if (selectedDocument.url) {
                    try {
                      await Clipboard.setString(selectedDocument.url);
                      showToast.success('Ссылка скопирована', 'Ссылка на документ скопирована в буфер обмена');
                    } catch (error) {
                      showToast.error('Ошибка', 'Не удалось скопировать ссылку');
                    }
                  } else {
                    showToast.error('Ошибка', 'Ссылка на документ отсутствует');
                  }
                }}
              >
                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                <Text style={styles.copyButtonText}>Копировать ссылку</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      )}

      {/* Модальное окно добавления документа */}
      {showAddModal && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Добавить документ</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.gray[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Название документа *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newDocument.title}
                  onChangeText={(text) => setNewDocument(prev => ({ ...prev, title: text }))}
                  placeholder="Например: Трудовой договор"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Тип документа *</Text>
                <View style={styles.typeButtons}>
                  {(['PDF', 'IMAGE', 'DOC'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newDocument.type === type && styles.typeButtonActive,
                      ]}
                      onPress={() => setNewDocument(prev => ({ ...prev, type }))}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          newDocument.type === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Ссылка на документ *</Text>
                  <TouchableOpacity
                    style={styles.pasteButton}
                    onPress={async () => {
                      try {
                        const text = await Clipboard.getString();
                        if (text) {
                          setNewDocument(prev => ({ ...prev, url: text }));
                          showToast.success('Ссылка вставлена', 'Ссылка из буфера обмена добавлена');
                        }
                      } catch (error) {
                        showToast.error('Ошибка', 'Не удалось вставить ссылку из буфера');
                      }
                    }}
                  >
                    <Ionicons name="clipboard-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.pasteButtonText}>Вставить</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={newDocument.url}
                  onChangeText={(text) => setNewDocument(prev => ({ ...prev, url: text }))}
                  placeholder="https://example.com/document.pdf"
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="url"
                  autoCapitalize="none"
                />
                <Text style={styles.inputHint}>
                  Вставьте ссылку на документ из Google Drive, Dropbox или другого сервиса
                </Text>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddDocument}
              >
                <Text style={styles.submitButtonText}>Добавить документ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  docCard: {
    width: '47%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[800],
    textAlign: 'center',
  },
  docDate: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addCard: {
    width: '47%',
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray[200],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[500],
  },
  addTextManager: {
    color: COLORS.primary,
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
  modalContent: {
    flex: 1,
  },
  documentViewer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  documentIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  documentDate: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  documentActions: {
    width: '100%',
    gap: 16,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  copyButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  typeButtonTextActive: {
    color: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 8,
    lineHeight: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.blue[50],
  },
  pasteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
