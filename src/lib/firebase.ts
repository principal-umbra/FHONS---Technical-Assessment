/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { UserProfile, QuestionnaireAnswers, ActiveStep, Questionnaire } from '../types';

const firebaseConfig = {

  apiKey: "AIzaSyCkas-14QxS9hfY9ZI8ZPjzJChqRaDDrpo",
  authDomain: "project-a2296006-dbfa-47b2-aea.firebaseapp.com",
  projectId: "project-a2296006-dbfa-47b2-aea",
  storageBucket: "project-a2296006-dbfa-47b2-aea.firebasestorage.app",
  messagingSenderId: "474355715465",
  appId: "1:474355715465:web:7fa2cd0da3d5d256286558"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId using getFirestore
export const db = getFirestore(app, "ai-studio-cuestionariodeev-1e446a7e-4f8a-4c8e-8c30-94f6f7b18e73");
export const auth = getAuth(app);

export interface EvaluationDocument {
  id: string;
  profile: UserProfile;
  answers: QuestionnaireAnswers;
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  currentStep?: ActiveStep;
}

/**
 * Fetches all available questionnaires from the 'questionnaires' collection.
 */
export async function getQuestionnaires(): Promise<Questionnaire[]> {
  const collRef = collection(db, 'questionnaires');
  const snapshot = await getDocs(collRef);
  const questionnaires: Questionnaire[] = [];
  snapshot.forEach(d => {
    questionnaires.push({ id: d.id, ...d.data() } as Questionnaire);
  });
  return questionnaires;
}

/**
 * Saves or updates an evaluation in Firestore
 */
export async function saveEvaluation(
  id: string,
  profile: UserProfile,
  answers: QuestionnaireAnswers,
  status: 'in_progress' | 'completed',
  currentStep?: ActiveStep,
  collectionPath: string = 'evaluations_servicio_al_cliente'
): Promise<void> {
  if (!id) return;
  const docRef = doc(db, collectionPath, id);
  const now = new Date().toISOString();
  
  // Try to check if document exists to preserve createdAt
  let createdAt = now;
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      createdAt = existingData.createdAt || now;
    }
  } catch (e) {
    console.error('Error fetching existing doc', e);
  }

  const payload: EvaluationDocument = {
    id,
    profile,
    answers,
    status,
    createdAt,
    updatedAt: now,
    currentStep
  };

  await setDoc(docRef, payload);
}

/**
 * Retrieves a specific evaluation from Firestore
 */
export async function getEvaluation(id: string, collectionPath: string = 'evaluations_servicio_al_cliente'): Promise<EvaluationDocument | null> {
  if (!id) return null;
  const docRef = doc(db, collectionPath, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as EvaluationDocument;
  }
  return null;
}

/**
 * Deletes a specific evaluation from Firestore
 */
export async function deleteEvaluation(id: string, collectionPath: string = 'evaluations_servicio_al_cliente'): Promise<void> {
  if (!id) return;
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}

/**
 * Lists all evaluations, sorted by updatedAt descending.
 * Optionally filtered by email.
 */
export async function listEvaluations(email?: string, collectionPath: string = 'evaluations_servicio_al_cliente'): Promise<EvaluationDocument[]> {
  const collRef = collection(db, collectionPath);
  let q = query(collRef, orderBy('updatedAt', 'desc'));
  
  if (email && email.trim()) {
    q = query(
      collRef, 
      where('profile.email', '==', email.trim().toLowerCase()),
      orderBy('updatedAt', 'desc')
    );
  }

  const querySnapshot = await getDocs(q);
  const records: EvaluationDocument[] = [];
  querySnapshot.forEach((doc) => {
    records.push(doc.data() as EvaluationDocument);
  });
  return records;
}
