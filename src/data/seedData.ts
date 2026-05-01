import { firestoreService } from '../services/firestoreService';
import { NewsItem, Checklist, Task, DocumentItem, Product, ChatMessage } from '../types';

export const seedNews: Omit<NewsItem, 'id'>[] = [
  {
    title: 'Цель смены: повысить выполнение задач',
    description: 'Фокус дня - переводить назначенные задачи в работу и закрывать их до дедлайна.',
    content: 'Сегодня главный показатель эффективности - выполнение задач в срок. Сотрудники получают рейтинг за завершенные задачи, активную работу и отсутствие просрочек. Руководителю рекомендуется отслеживать KPI на главном экране и помогать тем, у кого много неначатых задач.',
    date: '29 Апр 2026',
    author: 'Руководство'
  },
  {
    title: 'Как начисляются бонусы',
    description: 'Бонусные баллы зависят от рейтинга сотрудника и количества выполненных задач.',
    content: 'Система начисляет баллы за выполненные задачи, задачи в работе и общий рейтинг эффективности. Просроченные задачи уменьшают итоговый показатель. Баллы можно использовать как мотивационную часть: обменивать на товары, обучение или внутренние поощрения.',
    date: '29 Апр 2026',
    author: 'HR Отдел'
  },
  {
    title: 'Рекомендация руководителю',
    description: 'Используйте рейтинг не для наказания, а для анализа и поддержки сотрудников.',
    content: 'Если у сотрудника низкий рейтинг, проверьте количество задач, нагрузку, дедлайны и статус выполнения. Система помогает увидеть слабые места: кто перегружен, кто не начал задачи, где нужна помощь или обучение.',
    date: '29 Апр 2026',
    author: 'Администрация'
  },
  {
    title: 'Еженедельный анализ эффективности',
    description: 'В конце недели сравнивайте KPI команды и личные показатели сотрудников.',
    content: 'Для защиты проекта можно показать, что приложение решает управленческую задачу: собирает данные по задачам, считает рейтинг, начисляет бонусы и помогает принимать решения по мотивации персонала.',
    date: '29 Апр 2026',
    author: 'Руководство'
  }
];

// Чек-листы удалены из seed-данных - будут создаваться пользователями

// Задачи удалены из seed-данных - будут создаваться пользователями

// Документы удалены из seed-данных - будут добавляться пользователями

export const seedProducts: Omit<Product, 'id'>[] = [
  {
    name: 'Худи с логотипом',
    category: 'Одежда',
    price: '2500 бонусных баллов',
    description: 'Качественное хлопковое худи с вышитым логотипом компании для повседневной носки.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400',
    features: ['100% хлопок', 'Вышивка логотипа', 'Размеры S-XXL', 'Классический крой']
  },
  {
    name: 'Планер А5',
    category: 'Канцелярия',
    price: '700 бонусных баллов',
    description: 'Кожаный планер формата А5 с логотипом компании для эффективного планирования.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400',
    features: ['Формат А5', 'Натуральная кожа', 'Еженедельный планировщик', 'Отделения для документов']
  },
  {
    name: 'Тренинг: Продажи',
    category: 'Обучение',
    price: '1800 бонусных баллов',
    description: 'Продвинутый видеокурс по технике продаж для развития навыков коммуникации.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    features: ['8 модулей', 'Видео формат', 'Сертификат', 'Практические задания']
  },
  {
    name: 'Термокружка',
    category: 'Аксессуары',
    price: '1000 бонусных баллов',
    description: 'Стильная термокружка из нержавеющей стали с логотипом компании.',
    image: 'https://avatars.mds.yandex.net/i?id=9d7e246ec9a723981d98b94a95a9d8ae556e4c1a-4815576-images-thumbs&n=13',
    features: ['Нержавеющая сталь', 'Объем 350 мл', 'Сохраняет температуру', 'Удобная ручка']
  },
  {
    name: 'Рюкзак для ноутбука',
    category: 'Аксессуары',
    price: '3200 бонусных баллов',
    description: 'Водонепроницаемый рюкзак с отделением для ноутбука до 15 дюймов.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    features: ['Водонепроницаемый', 'Отделение для ноутбука', 'USB порт', 'Регулируемые лямки']
  },
  {
    name: 'Тренинг: Лидерство',
    category: 'Обучение',
    price: '2200 бонусных баллов',
    description: 'Курс по развитию лидерских качеств от ведущих бизнес-тренеров компании.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    features: ['Онлайн формат', '12 уроков', 'Практические упражнения', 'Сертификат']
  },
];

// Сообщения чата удалены из seed-данных - будут создаваться пользователями

// Функция для очистки старых задач с неправильными ID
export const clearOldTasks = async () => {
  try {
    console.log('🔍 Clearing old tasks with invalid IDs...');
    const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');

    const querySnapshot = await getDocs(collection(db, 'tasks'));
    console.log(`📋 Total tasks in Firestore: ${querySnapshot.size}`);

    const deletePromises: Promise<void>[] = [];
    const toDelete: string[] = [];

    querySnapshot.forEach((document) => {
      const taskId = document.id;
      const taskData = document.data();
      const assigneeId = taskData.assigneeId;

      // Проверяем, является ли ID числовой строкой (старый формат Date.now())
      const isNumericId = /^\d+$/.test(taskId);

      // Проверяем, является ли assigneeId простой строкой '1', '2', '3' (старые mock данные)
      const hasInvalidAssigneeId = assigneeId && /^[1-9]$/.test(assigneeId);

      if (isNumericId || hasInvalidAssigneeId) {
        console.log(`❌ Found old task to delete: ${taskId} (assigneeId: ${assigneeId})`);
        toDelete.push(taskId);
        deletePromises.push(deleteDoc(doc(db, 'tasks', taskId)));
      }
    });

    if (deletePromises.length > 0) {
      console.log(`🗑️  Deleting ${deletePromises.length} old tasks...`);
      await Promise.all(deletePromises);
      console.log(`✅ Successfully cleared ${deletePromises.length} old tasks:`, toDelete);
    } else {
      console.log('✅ No old tasks found to delete');
    }

    return deletePromises.length;
  } catch (error) {
    console.error('❌ Error clearing old tasks:', error);
    return 0;
  }
};

// Функция для очистки старых чек-листов с неправильными ID
export const clearOldChecklists = async () => {
  try {
    console.log('🔍 Clearing old checklists with invalid IDs...');
    const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');

    const querySnapshot = await getDocs(collection(db, 'checklists'));
    console.log(`📋 Total checklists in Firestore: ${querySnapshot.size}`);

    const deletePromises: Promise<void>[] = [];
    const toDelete: string[] = [];

    querySnapshot.forEach((document) => {
      const checklistId = document.id;
      console.log(`Checking checklist ID: ${checklistId}, is numeric: ${/^\d+$/.test(checklistId)}`);

      // Проверяем, является ли ID числовой строкой (старый формат)
      if (/^\d+$/.test(checklistId)) {
        console.log(`❌ Found old checklist to delete: ${checklistId}`);
        toDelete.push(checklistId);
        deletePromises.push(deleteDoc(doc(db, 'checklists', checklistId)));
      } else {
        console.log(`✅ Valid checklist ID: ${checklistId}`);
      }
    });

    if (deletePromises.length > 0) {
      console.log(`🗑️  Deleting ${deletePromises.length} old checklists...`);
      await Promise.all(deletePromises);
      console.log(`✅ Successfully cleared ${deletePromises.length} old checklists:`, toDelete);
    } else {
      console.log('✅ No old checklists found to delete');
    }

    return deletePromises.length;
  } catch (error) {
    console.error('❌ Error clearing old checklists:', error);
    return 0;
  }
};

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed News
    console.log('Seeding news...');
    for (const news of seedNews) {
      try {
        await firestoreService.addNews(news);
      } catch (error) {
        console.log('Skipping news item (may already exist)');
      }
    }

    // Seed Products
    console.log('Seeding products...');
    for (const product of seedProducts) {
      try {
        await firestoreService.addProduct(product);
      } catch (error) {
        console.log('Skipping product (may already exist)');
      }
    }

    console.log('Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
