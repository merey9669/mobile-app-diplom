import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../components/UI';
import { ChatMessage, User } from '../types';

interface ChatScreenProps {
  messages: ChatMessage[];
  currentUser: User;
  users?: User[];
  onSend: (text: string, recipientId?: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  currentUser,
  users = [],
  onSend,
}) => {
  const [input, setInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserSelect, setShowUserSelect] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (!selectedUser) {
      console.warn('No user selected');
      return;
    }
    onSend(input, selectedUser.id);
    setInput('');
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowUserSelect(false);
  };

  // Получить последнее сообщение с пользователем
  const getLastMessage = (userId: string): string => {
    const userMessages = messages.filter(msg =>
      (msg.senderId === currentUser.id && msg.recipientId === userId) ||
      (msg.senderId === userId && msg.recipientId === currentUser.id)
    );

    if (userMessages.length === 0) {
      return 'Нет сообщений';
    }

    const lastMsg = userMessages[userMessages.length - 1];
    const isMyMessage = lastMsg.senderId === currentUser.id;
    const prefix = isMyMessage ? 'Вы: ' : '';
    const text = lastMsg.text.length > 30 ? lastMsg.text.substring(0, 30) + '...' : lastMsg.text;

    return prefix + text;
  };

  // Show user selection screen if no user is selected
  if (showUserSelect || !selectedUser) {
    return (
      <View style={styles.container}>
        <View style={styles.userSelectHeader}>
          <Text style={styles.userSelectTitle}>Выберите собеседника</Text>
          <Text style={styles.userSelectSubtitle}>
            Начните беседу с коллегой
          </Text>
        </View>
        <ScrollView
          style={styles.userList}
          contentContainerStyle={styles.userListContent}
          showsVerticalScrollIndicator={false}
        >
          {users
            .filter((user) => user.id !== currentUser.id)
            .map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userItem}
                onPress={() => handleUserSelect(user)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userLastMessage} numberOfLines={1}>
                    {getLastMessage(user.id)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    );
  }

  // Фильтруем сообщения для текущего диалога
  const filteredMessages = messages.filter(msg => {
    const isMatch = (msg.senderId === currentUser.id && msg.recipientId === selectedUser.id) ||
                   (msg.senderId === selectedUser.id && msg.recipientId === currentUser.id);

    if (isMatch) {
      console.log('Message match found:', msg);
    }

    return isMatch;
  });

  console.log('Chat filtering:', {
    currentUserId: currentUser.id,
    selectedUserId: selectedUser.id,
    totalMessages: messages.length,
    filteredMessages: filteredMessages.length,
    messages: messages.map(m => ({ senderId: m.senderId, recipientId: m.recipientId, text: m.text }))
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.chatHeader}
        onPress={() => setShowUserSelect(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.gray[800]} />
        <Image source={{ uri: selectedUser.avatar }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{selectedUser.name}</Text>
          <Text style={styles.headerDepartment}>{selectedUser.department}</Text>
        </View>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={[styles.keyboardAvoid, {
          marginBottom: Platform.OS === 'ios' ? 84 + insets.bottom : 68
        }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
        {filteredMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray[300]} />
            <Text style={styles.emptyText}>Нет сообщений</Text>
            <Text style={styles.emptySubtext}>Начните диалог с {selectedUser.name}</Text>
          </View>
        ) : (
          <>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>Сегодня</Text>
            </View>

            {filteredMessages.map((msg) => {
              const isCurrentUserMessage = msg.senderId === currentUser.id;
              return (
                <View
                  key={msg.id}
                  style={[styles.messageRow, isCurrentUserMessage && styles.messageRowMe]}
                >
                  {!isCurrentUserMessage && msg.avatar && (
                    <Image source={{ uri: msg.avatar }} style={styles.avatar} />
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isCurrentUserMessage ? styles.messageBubbleMe : styles.messageBubbleOther,
                    ]}
                  >
                    {!isCurrentUserMessage && (
                      <Text style={styles.senderName}>{msg.sender}</Text>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        isCurrentUserMessage && styles.messageTextMe,
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <View style={styles.timestampRow}>
                      <Text
                        style={[
                          styles.timestamp,
                          isCurrentUserMessage && styles.timestampMe,
                        ]}
                      >
                        {msg.timestamp || ''}
                      </Text>
                      {isCurrentUserMessage && (
                        <Ionicons
                          name="checkmark-done"
                          size={14}
                          color="rgba(255, 255, 255, 0.7)"
                          style={styles.checkmark}
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={30} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Сообщение..."
              placeholderTextColor={COLORS.gray[400]}
              multiline
              maxLength={500}
            />
          </View>

          {input.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
              <Ionicons name="mic" size={30} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  messagesContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 80,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[500],
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  messageRowMe: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  messageBubbleOther: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.gray[800],
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextMe: {
    color: COLORS.surface,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.gray[400],
  },
  timestampMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  checkmark: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  input: {
    fontSize: 15,
    color: COLORS.text,
    minHeight: 22,
    maxHeight: 80,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  userSelectHeader: {
    padding: 20,
    paddingTop: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userSelectTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  userSelectSubtitle: {
    fontSize: 15,
    color: COLORS.gray[500],
    lineHeight: 20,
  },
  userList: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  userListContent: {
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[50],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 3,
  },
  userDepartment: {
    fontSize: 13,
    color: COLORS.gray[500],
  },
  userLastMessage: {
    fontSize: 14,
    color: COLORS.gray[500],
    lineHeight: 18,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: COLORS.gray[100],
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  headerDepartment: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[700],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.gray[500],
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
