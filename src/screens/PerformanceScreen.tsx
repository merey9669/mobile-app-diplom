import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, COLORS } from '../components/UI';
import { AppLanguage, PerformanceEvaluation, Task, User, UserRole } from '../types';
import { calculateEmployeePerformance, EmployeePerformance } from '../utils/performance';

interface PerformanceScreenProps {
  tasks: Task[];
  users: User[];
  role: UserRole;
  currentUserId: string;
  currentUserName: string;
  evaluations: PerformanceEvaluation[];
  language: AppLanguage;
  onSaveEvaluation: (evaluation: Omit<PerformanceEvaluation, 'id' | 'updatedAt'>) => void;
}

const text = {
  ru: {
    high: 'Высокая эффективность',
    stable: 'Стабильная эффективность',
    improve: 'Нужно усилить результат',
    noData: 'Нет данных',
    rating: 'рейтинг',
    result: 'Результат',
    quality: 'Качество',
    productivity: 'Производительность',
    discipline: 'Дисциплина',
    teamwork: 'Командная работа',
    total: 'всего',
    done: 'готово',
    inWork: 'в работе',
    overdue: 'просрочено',
    points: 'баллов',
    bonusSystem: 'бонусная система',
    managerScores: 'Оценка руководителя',
    qualityWork: 'Качество работы',
    title: 'Рейтинг сотрудников',
    subtitle: 'KPI считается по критериям: результат, качество работы, производительность, дисциплина и командная работа.',
    average: 'средний рейтинг',
    bonusPoints: 'бонусных баллов',
    myResult: 'Мой результат',
    leaderboard: 'Лидерборд команды',
    indicators: 'Показатели эффективности',
    emptyTitle: 'Пока нет данных для рейтинга',
    emptyText: 'Назначьте сотрудникам задачи и меняйте их статусы, чтобы система рассчитала эффективность.',
  },
  kk: {
    high: 'Жоғары тиімділік',
    stable: 'Тұрақты тиімділік',
    improve: 'Нәтижені күшейту керек',
    noData: 'Дерек жоқ',
    rating: 'рейтинг',
    result: 'Нәтиже',
    quality: 'Жұмыс сапасы',
    productivity: 'Өнімділік',
    discipline: 'Тәртіп',
    teamwork: 'Командалық жұмыс',
    total: 'барлығы',
    done: 'дайын',
    inWork: 'жұмыста',
    overdue: 'кешіккен',
    points: 'балл',
    bonusSystem: 'бонус жүйесі',
    managerScores: 'Жетекші бағасы',
    qualityWork: 'Жұмыс сапасы',
    title: 'Қызметкерлер рейтингі',
    subtitle: 'KPI бес критерий бойынша есептеледі: нәтиже, жұмыс сапасы, өнімділік, тәртіп және командалық жұмыс.',
    average: 'орташа рейтинг',
    bonusPoints: 'бонус балдары',
    myResult: 'Менің нәтижем',
    leaderboard: 'Команда көшбасшылары',
    indicators: 'Тиімділік көрсеткіштері',
    emptyTitle: 'Рейтинг үшін деректер жоқ',
    emptyText: 'Қызметкерлерге тапсырма беріп, статустарын өзгертіңіз, сонда жүйе тиімділікті есептейді.',
  },
};

const getRatingColor = (rating: number) => {
  if (rating >= 80) return COLORS.green[700];
  if (rating >= 50) return COLORS.blue[700];
  return COLORS.red[700];
};

const getRatingLabel = (rating: number, t: typeof text.ru) => {
  if (rating >= 80) return t.high;
  if (rating >= 50) return t.stable;
  if (rating > 0) return t.improve;
  return t.noData;
};

const StatBlock = ({ label, value }: { label: string; value: number | string }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const CriteriaRow = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.criteriaRow}>
    <Text style={styles.criteriaLabel}>{label}</Text>
    <View style={styles.criteriaTrack}>
      <View style={[styles.criteriaFill, { width: `${value}%` }]} />
    </View>
    <Text style={styles.criteriaValue}>{value}%</Text>
  </View>
);

const ScoreButtons = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <View style={styles.scoreRow}>
    <Text style={styles.scoreLabel}>{label}</Text>
    <View style={styles.scoreButtons}>
      {[1, 2, 3, 4, 5].map((score) => (
        <TouchableOpacity
          key={score}
          style={[styles.scoreButton, value === score && styles.scoreButtonActive]}
          onPress={() => onChange(score)}
        >
          <Text style={[styles.scoreButtonText, value === score && styles.scoreButtonTextActive]}>
            {score}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const EmployeeCard = ({
  item,
  isCurrentUser,
  role,
  currentUserId,
  currentUserName,
  language,
  onSaveEvaluation,
}: {
  item: EmployeePerformance;
  isCurrentUser: boolean;
  role: UserRole;
  currentUserId: string;
  currentUserName: string;
  language: AppLanguage;
  onSaveEvaluation: (evaluation: Omit<PerformanceEvaluation, 'id' | 'updatedAt'>) => void;
}) => {
  const t = text[language];
  const quality = item.evaluation?.quality ?? 3;
  const discipline = item.evaluation?.discipline ?? 3;
  const teamwork = item.evaluation?.teamwork ?? 3;

  const saveScore = (field: 'quality' | 'discipline' | 'teamwork', value: number) => {
    onSaveEvaluation({
      employeeId: item.user.id,
      employeeName: item.user.name,
      quality: field === 'quality' ? value : quality,
      discipline: field === 'discipline' ? value : discipline,
      teamwork: field === 'teamwork' ? value : teamwork,
      managerId: currentUserId,
      managerName: currentUserName,
    });
  };

  return (
  <Card style={[styles.employeeCard, isCurrentUser && styles.currentUserCard]}>
    <View style={styles.employeeHeader}>
      <View style={styles.employeeInfo}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{item.rank}</Text>
        </View>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.nameBlock}>
          <Text style={styles.employeeName}>{item.user.name}</Text>
          <Text style={styles.department}>{item.user.department}</Text>
        </View>
      </View>
      <View style={styles.ratingBox}>
        <Text style={[styles.ratingValue, { color: getRatingColor(item.rating) }]}>
          {item.rating}%
        </Text>
        <Text style={styles.ratingCaption}>{t.rating}</Text>
      </View>
    </View>

    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${item.rating}%`,
            backgroundColor: getRatingColor(item.rating),
          },
        ]}
      />
    </View>

    <Text style={styles.ratingLabel}>{getRatingLabel(item.rating, t)}</Text>

    <View style={styles.criteriaBlock}>
      <CriteriaRow label={t.result} value={item.criteria.result} />
      <CriteriaRow label={t.quality} value={item.criteria.quality} />
      <CriteriaRow label={t.productivity} value={item.criteria.productivity} />
      <CriteriaRow label={t.discipline} value={item.criteria.discipline} />
      <CriteriaRow label={t.teamwork} value={item.criteria.teamwork} />
    </View>

    <View style={styles.statsGrid}>
      <StatBlock label={t.total} value={item.totalTasks} />
      <StatBlock label={t.done} value={item.completedTasks} />
      <StatBlock label={t.inWork} value={item.inProgressTasks} />
      <StatBlock label={t.overdue} value={item.overdueTasks} />
    </View>

    <View style={styles.bonusRow}>
      <View style={styles.bonusIcon}>
        <Ionicons name="sparkles-outline" size={18} color={COLORS.primary} />
      </View>
      <View>
        <Text style={styles.bonusValue}>{item.bonusPoints} {t.points}</Text>
        <Text style={styles.bonusLabel}>{t.bonusSystem}</Text>
      </View>
    </View>

    {role === 'MANAGER' && (
      <View style={styles.managerScores}>
        <Text style={styles.managerScoresTitle}>{t.managerScores}</Text>
        <ScoreButtons label={t.qualityWork} value={quality} onChange={(value) => saveScore('quality', value)} />
        <ScoreButtons label={t.discipline} value={discipline} onChange={(value) => saveScore('discipline', value)} />
        <ScoreButtons label={t.teamwork} value={teamwork} onChange={(value) => saveScore('teamwork', value)} />
      </View>
    )}
  </Card>
  );
};

export const PerformanceScreen: React.FC<PerformanceScreenProps> = ({
  tasks,
  users,
  role,
  currentUserId,
  currentUserName,
  evaluations,
  language,
  onSaveEvaluation,
}) => {
  const t = text[language];
  const performance = useMemo(
    () => calculateEmployeePerformance(users, tasks, evaluations),
    [users, tasks, evaluations],
  );

  const currentUserPerformance = performance.find((item) => item.user.id === currentUserId);
  const visiblePerformance = role === 'MANAGER'
    ? performance
    : performance.filter((item) => item.user.id === currentUserId);

  const averageRating = performance.length > 0
    ? Math.round(performance.reduce((sum, item) => sum + item.rating, 0) / performance.length)
    : 0;
  const totalBonusPoints = performance.reduce((sum, item) => sum + item.bonusPoints, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>
            {t.subtitle}
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <Ionicons name="podium-outline" size={22} color={COLORS.primary} />
            <Text style={styles.summaryValue}>{averageRating}%</Text>
            <Text style={styles.summaryLabel}>{t.average}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Ionicons name="gift-outline" size={22} color={COLORS.green[700]} />
            <Text style={styles.summaryValue}>{totalBonusPoints}</Text>
            <Text style={styles.summaryLabel}>{t.bonusPoints}</Text>
          </Card>
        </View>

        {role === 'EMPLOYEE' && currentUserPerformance && (
          <View style={styles.personalBlock}>
            <Text style={styles.sectionTitle}>{t.myResult}</Text>
            <EmployeeCard
              item={currentUserPerformance}
              isCurrentUser
              role={role}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              language={language}
              onSaveEvaluation={onSaveEvaluation}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>
          {role === 'MANAGER' ? t.leaderboard : t.indicators}
        </Text>

        {visiblePerformance.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="analytics-outline" size={28} color={COLORS.gray[400]} />
            <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
            <Text style={styles.emptyText}>
              {t.emptyText}
            </Text>
          </Card>
        ) : (
          visiblePerformance.map((item) => (
            <EmployeeCard
              key={item.user.id}
              item={item}
              isCurrentUser={item.user.id === currentUserId}
              role={role}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              language={language}
              onSaveEvaluation={onSaveEvaluation}
            />
          ))
        )}
      </ScrollView>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gray[800],
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray[500],
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    minHeight: 116,
    justifyContent: 'space-between',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.gray[800],
    marginTop: 10,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  personalBlock: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray[800],
    marginBottom: 12,
  },
  employeeCard: {
    marginBottom: 12,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  employeeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.gray[100],
  },
  nameBlock: {
    flex: 1,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.gray[800],
  },
  department: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  ratingValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  ratingCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[400],
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[100],
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[600],
    marginBottom: 14,
  },
  criteriaBlock: {
    gap: 8,
    marginBottom: 14,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criteriaLabel: {
    width: 118,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[600],
  },
  criteriaTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray[100],
    overflow: 'hidden',
  },
  criteriaFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  criteriaValue: {
    width: 34,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray[700],
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBlock: {
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.gray[800],
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray[400],
    marginTop: 2,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  bonusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
  },
  bonusValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gray[800],
  },
  bonusLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  managerScores: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    gap: 10,
  },
  managerScoresTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.gray[800],
  },
  scoreRow: {
    gap: 8,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[600],
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  scoreButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  scoreButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.gray[600],
  },
  scoreButtonTextActive: {
    color: COLORS.surface,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gray[700],
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});
