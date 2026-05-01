import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/*
Firestore Security Rules (нужно добавить в Firebase Console > Firestore > Rules):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать список сотрудников для назначения задач и рейтинга.
    // Редактировать профиль может только сам пользователь.
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }

    // Все аутентифицированные пользователи могут читать новости
    match /news/{newsId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MANAGER';
    }

    // Задачи доступны всем аутентифицированным пользователям
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Чек-листы
    match /checklists/{checklistId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Сообщения чата
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }

    // Продукты
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MANAGER';
    }

    // Документы
    match /documents/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MANAGER';
    }

    // KPI-оценки руководителя
    match /performanceEvaluations/{employeeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MANAGER';
    }

    // Оценки приложения пользователями
    match /appRatings/{userId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6WFWkUmBS_iSIbDQ3J_xIVg3op0ZZNVs",
  authDomain: "diplom-app-25922.firebaseapp.com",
  projectId: "diplom-app-25922",
  storageBucket: "diplom-app-25922.firebasestorage.app",
  messagingSenderId: "66736366322",
  appId: "1:66736366322:web:aedb332fe2129f3a6ee66b"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (AsyncStorage persistence works automatically in React Native)
const auth = initializeAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
