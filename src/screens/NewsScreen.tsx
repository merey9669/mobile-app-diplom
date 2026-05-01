import React, { useMemo, useState } from 'react';
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
import { Card, Button, COLORS } from '../components/UI';
import { AppLanguage, AppRatingSummary, NewsItem, Task, User, UserRole } from '../types';
import { showToast } from '../utils/toast';
import { calculateEmployeePerformance } from '../utils/performance';

interface NewsScreenProps {
  news: NewsItem[];
  role: UserRole;
  tasks: Task[];
  users: User[];
  currentUserId: string;
  currentUserName: string;
  appRatingSummary: AppRatingSummary;
  language: AppLanguage;
  onAddNews: (item: Omit<NewsItem, 'id'>) => void;
  onRateApp: (rating: number) => void;
}

const text = {
  ru: {
    eyebrow: 'Система повышения эффективности',
    title: 'Эффект+',
    hero: 'Приложение помогает руководителю видеть результат команды, а сотрудникам понимать свои задачи, рейтинг и бонусы.',
    completion: 'Выполнение',
    activity: 'Активность',
    bonuses: 'Бонусы',
    waiting: 'Ожидают',
    tasksOf: 'из',
    tasks: 'задач',
    inProgress: 'в работе',
    bonusHint: 'баллов мотивации',
    needStart: 'нужно начать',
    appRating: 'Оценка приложения',
    average: 'Средняя оценка',
    from5: 'из 5',
    rateQuestion: 'оцените удобство приложения',
    managerFocus: 'Фокус руководителя',
    myFocus: 'Мой фокус',
    managerPending: 'Контролируйте {count} неначатых задач и переводите их в работу.',
    employeePending: 'Начните {count} назначенных задач, чтобы поднять рейтинг.',
    leader: 'Лидер эффективности',
    leaderEmpty: 'Лидер появится после назначения задач сотрудникам.',
    bonusRule: 'Выполненные задачи повышают рейтинг и начисляют бонусные баллы сотруднику.',
    addRecommendation: 'Добавить рекомендацию по эффективности',
    recommendations: 'Рекомендации и объявления',
    emptyTitle: 'Пока нет рекомендаций',
    emptyText: 'Здесь будут появляться советы руководителя, цели смены и объявления для повышения результата.',
    open: 'Открыть',
    recommendation: 'Рекомендация',
    newRecommendation: 'Новая рекомендация',
    name: 'Название',
    shortDesc: 'Краткое описание',
    details: 'Подробности',
    publish: 'Опубликовать',
  },
  kk: {
    eyebrow: 'Қызметкерлер тиімділігін арттыру жүйесі',
    title: 'Әсер+',
    hero: 'Қолданба жетекшіге команданың нәтижесін көруге, ал қызметкерлерге тапсырмаларын, рейтингін және бонустарын түсінуге көмектеседі.',
    completion: 'Орындалуы',
    activity: 'Белсенділік',
    bonuses: 'Бонустар',
    waiting: 'Күтуде',
    tasksOf: '/',
    tasks: 'тапсырма',
    inProgress: 'орындалуда',
    bonusHint: 'мотивациялық балл',
    needStart: 'бастау керек',
    appRating: 'Қолданба бағасы',
    average: 'Орташа баға',
    from5: '5-тен',
    rateQuestion: 'қолданбаның ыңғайлылығын бағалаңыз',
    managerFocus: 'Жетекші фокусы',
    myFocus: 'Менің фокусым',
    managerPending: '{count} басталмаған тапсырманы бақылап, жұмысқа қосыңыз.',
    employeePending: 'Рейтингті көтеру үшін {count} тапсырманы бастаңыз.',
    leader: 'Тиімділік көшбасшысы',
    leaderEmpty: 'Қызметкерлерге тапсырма берілгеннен кейін көшбасшы пайда болады.',
    bonusRule: 'Орындалған тапсырмалар рейтингті көтеріп, қызметкерге бонус балдарын береді.',
    addRecommendation: 'Тиімділік бойынша ұсыныс қосу',
    recommendations: 'Ұсыныстар мен хабарландырулар',
    emptyTitle: 'Әзірге ұсыныстар жоқ',
    emptyText: 'Мұнда жетекшінің кеңестері, ауысым мақсаттары және нәтижені арттыру хабарландырулары көрсетіледі.',
    open: 'Ашу',
    recommendation: 'Ұсыныс',
    newRecommendation: 'Жаңа ұсыныс',
    name: 'Атауы',
    shortDesc: 'Қысқаша сипаттама',
    details: 'Толық ақпарат',
    publish: 'Жариялау',
  },
};

const getPercent = (value: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

const MetricCard = ({
  icon,
  label,
  value,
  hint,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  hint: string;
  color: string;
}) => (
  <Card style={styles.metricCard}>
    <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricHint}>{hint}</Text>
  </Card>
);

export const NewsScreen: React.FC<NewsScreenProps> = ({
  news,
  role,
  tasks,
  users,
  currentUserId,
  currentUserName,
  appRatingSummary,
  language,
  onAddNews,
  onRateApp,
}) => {
  const t = text[language];
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newContent, setNewContent] = useState('');

  const performance = useMemo(() => calculateEmployeePerformance(users, tasks), [users, tasks]);
  const currentPerformance = performance.find((item) => item.user.id === currentUserId);
  const leader = performance[0];

  const visibleTasks = role === 'MANAGER'
    ? tasks
    : tasks.filter((task) => task.assigneeId === currentUserId);

  const totalTasks = visibleTasks.length;
  const doneTasks = visibleTasks.filter((task) => task.status === 'DONE').length;
  const inProgressTasks = visibleTasks.filter((task) => task.status === 'IN_PROGRESS').length;
  const pendingTasks = visibleTasks.filter((task) => task.status === 'PENDING').length;
  const completionPercent = getPercent(doneTasks, totalTasks);
  const activePercent = getPercent(doneTasks + inProgressTasks, totalTasks);

  const handleAdd = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast.error('Ошибка', 'Заполните название и краткое описание');
      return;
    }

    const newsData: Omit<NewsItem, 'id'> = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      content: newContent.trim() || newDesc.trim(),
      date: new Date().toLocaleDateString('ru-RU'),
      author: 'Руководство',
    };

    try {
      onAddNews(newsData);
      showToast.success('Успешно', 'Рекомендация опубликована');
      setShowAdd(false);
      setNewTitle('');
      setNewDesc('');
      setNewContent('');
    } catch (error) {
      console.error('NewsScreen: Error in onAddNews:', error);
      showToast.error('Ошибка', 'Не удалось опубликовать рекомендацию');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.eyebrow}>{t.eyebrow}</Text>
              <Text style={styles.heroTitle}>{t.title}</Text>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons name="trending-up" size={28} color={COLORS.surface} />
            </View>
          </View>
          <Text style={styles.heroText}>
            {t.hero}
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="checkmark-done-outline"
            label={t.completion}
            value={`${completionPercent}%`}
            hint={language === 'kk' ? `${doneTasks} ${t.tasksOf} ${totalTasks} ${t.tasks}` : `${doneTasks} ${t.tasksOf} ${totalTasks} ${t.tasks}`}
            color={COLORS.green[700]}
          />
          <MetricCard
            icon="pulse-outline"
            label={t.activity}
            value={`${activePercent}%`}
            hint={`${inProgressTasks} ${t.inProgress}`}
            color={COLORS.blue[700]}
          />
          <MetricCard
            icon="gift-outline"
            label={t.bonuses}
            value={`${currentPerformance?.bonusPoints ?? 0}`}
            hint={t.bonusHint}
            color={COLORS.primary}
          />
          <MetricCard
            icon="hourglass-outline"
            label={t.waiting}
            value={`${pendingTasks}`}
            hint={t.needStart}
            color={COLORS.red[700]}
          />
        </View>

        <Card style={styles.appRatingCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t.appRating}</Text>
              <Text style={styles.ratingSummary}>
                {t.average}: {appRatingSummary.average.toFixed(1)} {t.from5} ({appRatingSummary.count})
              </Text>
            </View>
            <Ionicons name="star" size={22} color="#F59E0B" />
          </View>
          <Text style={styles.ratingQuestion}>{currentUserName}, {t.rateQuestion}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => onRateApp(star)}>
                <Ionicons
                  name={(appRatingSummary.currentUserRating || 0) >= star ? 'star' : 'star-outline'}
                  size={34}
                  color="#F59E0B"
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.focusCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {role === 'MANAGER' ? t.managerFocus : t.myFocus}
            </Text>
            <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.focusList}>
            <View style={styles.focusItem}>
              <Ionicons name="flag-outline" size={18} color={COLORS.primary} />
              <Text style={styles.focusText}>
                {role === 'MANAGER'
                  ? t.managerPending.replace('{count}', `${pendingTasks}`)
                  : t.employeePending.replace('{count}', `${pendingTasks}`)}
              </Text>
            </View>
            <View style={styles.focusItem}>
              <Ionicons name="trophy-outline" size={18} color={COLORS.green[700]} />
              <Text style={styles.focusText}>
                {leader
                  ? `${t.leader}: ${leader.user.name}, ${leader.rating}%.`
                  : t.leaderEmpty}
              </Text>
            </View>
            <View style={styles.focusItem}>
              <Ionicons name="sparkles-outline" size={18} color={COLORS.blue[700]} />
              <Text style={styles.focusText}>
                {t.bonusRule}
              </Text>
            </View>
          </View>
        </Card>

        {role === 'MANAGER' && (
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => setShowAdd(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.addText}>{t.addRecommendation}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>{t.recommendations}</Text>
        {news.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="bulb-outline" size={28} color={COLORS.gray[400]} />
            <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
            <Text style={styles.emptyText}>
              {t.emptyText}
            </Text>
          </Card>
        ) : (
          news.map((item) => (
            <Card
              key={item.id}
              onPress={() => setSelectedNews(item)}
              style={styles.newsCard}
            >
              <View style={styles.newsHeader}>
                <View style={styles.newsIcon}>
                  <Ionicons name="bulb-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.newsContent}>
                  <Text style={styles.newsDate}>{item.date}</Text>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>{t.open}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={!!selectedNews}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedNews(null)}
      >
        {selectedNews && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>{t.recommendation}</Text>
              <TouchableOpacity
                onPress={() => setSelectedNews(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color={COLORS.gray[700]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalBody}>
                <Text style={styles.modalDate}>{selectedNews.date}</Text>
                <Text style={styles.modalTitle}>{selectedNews.title}</Text>
                <Text style={styles.modalText}>{selectedNews.content || selectedNews.description}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal
        visible={showAdd}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdd(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>{t.newRecommendation}</Text>
            <TouchableOpacity
              onPress={() => setShowAdd(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={COLORS.gray[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.name}</Text>
              <TextInput
                style={styles.textInput}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Например: Цель смены"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.shortDesc}</Text>
              <TextInput
                style={styles.textInput}
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="Что нужно улучшить сегодня"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.details}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newContent}
                onChangeText={setNewContent}
                placeholder="Опишите цель, критерии и ожидаемый результат"
                placeholderTextColor={COLORS.gray[400]}
                multiline
                numberOfLines={6}
              />
            </View>

            <Button fullWidth onPress={handleAdd}>
              {t.publish}
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.surface,
    marginTop: 4,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.surface,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    minHeight: 142,
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.gray[900],
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.gray[700],
    marginTop: 2,
  },
  metricHint: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 5,
  },
  focusCard: {
    marginBottom: 16,
  },
  appRatingCard: {
    marginBottom: 16,
  },
  ratingSummary: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[500],
    marginTop: -6,
  },
  ratingQuestion: {
    fontSize: 13,
    color: COLORS.gray[600],
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.gray[900],
    marginBottom: 12,
  },
  focusList: {
    gap: 12,
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  focusText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray[600],
  },
  addCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.22)',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  newsCard: {
    marginBottom: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  newsIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsContent: {
    flex: 1,
  },
  newsDate: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.gray[900],
    marginBottom: 6,
  },
  newsDesc: {
    fontSize: 13,
    color: COLORS.gray[600],
    lineHeight: 19,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 12,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.gray[800],
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.gray[500],
    textAlign: 'center',
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
    fontWeight: '900',
    color: COLORS.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  modalBody: {
    padding: 24,
  },
  modalDate: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[400],
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.gray[900],
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.gray[600],
    lineHeight: 24,
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
    fontWeight: '700',
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
