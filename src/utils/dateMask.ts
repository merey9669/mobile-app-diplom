/**
 * Форматирует ввод даты в формат ДД.ММ.ГГГГ
 * @param value - введенное значение
 * @returns отформатированное значение
 */
export const formatDateInput = (value: string): string => {
  // Удаляем все символы кроме цифр
  const numbers = value.replace(/\D/g, '');

  // Ограничиваем длину до 8 цифр
  const limited = numbers.slice(0, 8);

  // Применяем маску ДД.ММ.ГГГГ
  let formatted = '';

  if (limited.length >= 1) {
    formatted = limited.slice(0, 2);
  }

  if (limited.length >= 3) {
    formatted += '.' + limited.slice(2, 4);
  }

  if (limited.length >= 5) {
    formatted += '.' + limited.slice(4, 8);
  }

  return formatted;
};

/**
 * Проверяет валидность даты в формате ДД.ММ.ГГГГ
 * @param dateString - строка даты
 * @returns true если дата валидна
 */
export const isValidDate = (dateString: string): boolean => {
  // Проверяем формат ДД.ММ.ГГГГ
  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = dateString.match(dateRegex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Проверяем диапазоны
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Проверяем количество дней в месяце
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;

  return true;
};

/**
 * Получает текущую дату в формате ДД.ММ.ГГГГ
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
};
