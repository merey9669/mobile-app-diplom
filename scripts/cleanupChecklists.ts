/**
 * Скрипт для удаления чек-листов с числовыми ID из Firestore
 * Запуск: npx ts-node scripts/cleanupChecklists.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBn_wf046_tgnC-yknUpPgXovDgqZU2Mo8",
  authDomain: "diplomnaya-b13b7.firebaseapp.com",
  projectId: "diplomnaya-b13b7",
  storageBucket: "diplomnaya-b13b7.firebasestorage.app",
  messagingSenderId: "123322400802",
  appId: "1:123322400802:web:63ab038f3296d0c8d10a7b"
};

async function cleanupOldChecklists() {
  console.log('🔧 Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('📋 Fetching all checklists from Firestore...');
  const querySnapshot = await getDocs(collection(db, 'checklists'));

  console.log(`Found ${querySnapshot.size} total checklists`);

  const deletePromises: Promise<void>[] = [];
  const toDelete: string[] = [];

  querySnapshot.forEach((document) => {
    const checklistId = document.id;
    // Проверяем, является ли ID числовой строкой (старый формат)
    if (/^\d+$/.test(checklistId)) {
      console.log(`❌ Found old checklist with numeric ID: ${checklistId}`);
      toDelete.push(checklistId);
      deletePromises.push(deleteDoc(doc(db, 'checklists', checklistId)));
    } else {
      console.log(`✅ Valid checklist ID: ${checklistId}`);
    }
  });

  if (deletePromises.length > 0) {
    console.log(`\n🗑️  Deleting ${deletePromises.length} old checklists...`);
    await Promise.all(deletePromises);
    console.log(`✅ Successfully deleted ${deletePromises.length} old checklists:`);
    toDelete.forEach(id => console.log(`   - ${id}`));
  } else {
    console.log('\n✅ No old checklists found. Database is clean!');
  }

  console.log('\n🎉 Cleanup complete!');
}

cleanupOldChecklists()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  });
