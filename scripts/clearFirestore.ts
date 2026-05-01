/**
 * Скрипт для полной очистки Firestore
 *
 * Удаляет все данные из следующих коллекций:
 * - users (пользователи)
 * - tasks (задачи)
 * - checklists (чек-листы)
 * - news (новости)
 * - products (товары)
 * - documents (документы)
 * - messages (сообщения чата)
 *
 * ВАЖНО: Firebase Authentication НЕ очищается!
 * Пользователи останутся в Authentication, но их данные в Firestore будут удалены.
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

// Конфигурация Firebase (копируем из config/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDkf1vKLFuTaPJQ-fRaNdFZhPwS_u68wFY",
  authDomain: "diplomnaya-d7b1a.firebaseapp.com",
  projectId: "diplomnaya-d7b1a",
  storageBucket: "diplomnaya-d7b1a.firebasestorage.app",
  messagingSenderId: "843447867449",
  appId: "1:843447867449:web:40ca00e68d2dfed74fad46"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Коллекции для очистки
const COLLECTIONS = [
  'users',
  'tasks',
  'checklists',
  'news',
  'products',
  'documents',
  'messages'
];

/**
 * Удаляет все документы из указанной коллекции
 */
async function clearCollection(collectionName: string): Promise<number> {
  try {
    console.log(`\n🔍 Очистка коллекции "${collectionName}"...`);

    const querySnapshot = await getDocs(collection(db, collectionName));
    const totalDocs = querySnapshot.size;

    if (totalDocs === 0) {
      console.log(`✅ Коллекция "${collectionName}" уже пуста`);
      return 0;
    }

    console.log(`📋 Найдено документов: ${totalDocs}`);

    const deletePromises: Promise<void>[] = [];

    querySnapshot.forEach((document) => {
      console.log(`   ❌ Удаление: ${document.id}`);
      deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Коллекция "${collectionName}" очищена (удалено: ${totalDocs})`);

    return totalDocs;
  } catch (error) {
    console.error(`❌ Ошибка при очистке коллекции "${collectionName}":`, error);
    return 0;
  }
}

/**
 * Главная функция
 */
async function clearAllFirestore() {
  console.log('🚀 Начинаем полную очистку Firestore...\n');
  console.log('⚠️  ВНИМАНИЕ: Эта операция необратима!');
  console.log('⚠️  Будут удалены ВСЕ данные из следующих коллекций:');
  COLLECTIONS.forEach(col => console.log(`   - ${col}`));
  console.log('');

  let totalDeleted = 0;

  for (const collectionName of COLLECTIONS) {
    const deleted = await clearCollection(collectionName);
    totalDeleted += deleted;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Очистка завершена!`);
  console.log(`📊 Всего удалено документов: ${totalDeleted}`);
  console.log('='.repeat(50));
  console.log('\n📝 Примечания:');
  console.log('   - Firebase Authentication НЕ затронут');
  console.log('   - Пользователи могут войти, но их данные в Firestore удалены');
  console.log('   - После очистки рекомендуется также очистить AsyncStorage в приложении');
  console.log('   - Или перезапустить приложение с флагом: npm start -- --reset-cache\n');
}

// Запуск скрипта
clearAllFirestore()
  .then(() => {
    console.log('✅ Скрипт завершен успешно');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка выполнения скрипта:', error);
    process.exit(1);
  });
