import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, COLORS } from '../components/UI';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Управление задачами',
    desc: 'Создавайте, отслеживайте и выполняйте задачи. Будьте в курсе дедлайнов и прогресса работы.',
    icon: 'checkmark-circle' as const,
  },
  {
    title: 'Чек-листы',
    desc: 'Создавайте подробные чек-листы для процессов и контролируйте их выполнение командой.',
    icon: 'list' as const,
  },
  {
    title: 'Новости и каталог',
    desc: 'Читайте корпоративные новости и изучайте каталог товаров.',
    icon: 'newspaper' as const,
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBorder} />
          <Ionicons name={steps[step].icon} size={64} color={COLORS.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{steps[step].title}</Text>
          <Text style={styles.description}>{steps[step].desc}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <Button fullWidth onPress={handleNext}>
            {step === steps.length - 1 ? 'Начать работу' : 'Далее'}
          </Button>

          <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
            <Text style={styles.skipText}>Пропустить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 192,
    height: 192,
    backgroundColor: COLORS.background,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  iconBorder: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    borderWidth: 4,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderStyle: 'dashed',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.gray[200],
  },
  buttons: {
    gap: 12,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray[400],
  },
});
