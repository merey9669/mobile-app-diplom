import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#6366F1',
  secondary: '#E0E7FF',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    700: '#1D4ED8',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    700: '#15803D',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    600: '#DC2626',
    700: '#B91C1C',
  },
};

// Input Component
interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError, style]}
      placeholderTextColor={COLORS.gray[400]}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Button Component
interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  style,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, fullWidth && styles.buttonFullWidth, style];

    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.buttonSecondary];
      case 'outline':
        return [...baseStyle, styles.buttonOutline];
      case 'danger':
        return [...baseStyle, styles.buttonDanger];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.buttonText, styles.buttonTextOutline];
      case 'secondary':
        return [styles.buttonText, styles.buttonTextSecondary];
      case 'danger':
        return [styles.buttonText, styles.buttonTextDanger];
      default:
        return styles.buttonText;
    }
  };

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          style={getButtonStyle()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={getTextStyle()}>{children}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {children}
    </Component>
  );
};

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue' }) => {
  const getBadgeStyle = () => {
    switch (color) {
      case 'green':
        return styles.badgeGreen;
      case 'red':
        return styles.badgeRed;
      case 'gray':
        return styles.badgeGray;
      default:
        return styles.badgeBlue;
    }
  };

  const getTextStyle = () => {
    switch (color) {
      case 'green':
        return styles.badgeTextGreen;
      case 'red':
        return styles.badgeTextRed;
      case 'gray':
        return styles.badgeTextGray;
      default:
        return styles.badgeTextBlue;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle()]}>
      <Text style={[styles.badgeText, getTextStyle()]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.red[600],
  },
  errorText: {
    color: COLORS.red[600],
    fontSize: 12,
    marginTop: 4,
  },

  // Button Styles
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.red[50],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonTextDanger: {
    color: COLORS.red[600],
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Badge Styles
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeBlue: {
    backgroundColor: COLORS.blue[100],
  },
  badgeGreen: {
    backgroundColor: COLORS.green[100],
  },
  badgeRed: {
    backgroundColor: COLORS.red[100],
  },
  badgeGray: {
    backgroundColor: COLORS.gray[100],
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextBlue: {
    color: COLORS.blue[700],
  },
  badgeTextGreen: {
    color: COLORS.green[700],
  },
  badgeTextRed: {
    color: COLORS.red[700],
  },
  badgeTextGray: {
    color: COLORS.gray[600],
  },
});

export { COLORS };
