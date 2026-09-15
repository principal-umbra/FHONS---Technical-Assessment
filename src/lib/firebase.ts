/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { UserProfile, QuestionnaireAnswers, PerfilProfesionalAnswers, ActiveStep, Questionnaire } from '../types';

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
  questionnaireId?: string;
  profile: UserProfile;
  answers: QuestionnaireAnswers | PerfilProfesionalAnswers | any;
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  currentStep?: ActiveStep | string;
}

export const DEFAULT_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'servicio_al_cliente',
    title: 'Soporte TI de Excelencia',
    description: 'Cuestionario de autoevaluación introspectivo para evaluar empatía, ownership y criterios de servicio técnico.',
    collectionPath: 'evaluations_servicio_al_cliente',
    uiPath: 'servicio_al_cliente'
  },
  {
    id: 'perfil_profesional',
    title: 'Perfil Profesional FHONS (Web Oficial)',
    description: 'Cuestionario para crear el perfil público de los colaboradores en el website oficial de la compañía.',
    collectionPath: 'evaluations_perfil_profesional',
    uiPath: 'perfil_profesional'
  }
];

/**
 * Ensures default questionnaires are persisted in Firestore collection 'questionnaires'
 */
export async function seedQuestionnairesIfMissing(): Promise<void> {
  try {
    for (const q of DEFAULT_QUESTIONNAIRES) {
      const qDocRef = doc(db, 'questionnaires', q.id);
      const snap = await getDoc(qDocRef);
      if (!snap.exists()) {
        await setDoc(qDocRef, {
          ...q,
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.error('Error seeding questionnaires:', err);
  }
}

/**
 * Fetches all available questionnaires from the 'questionnaires' collection or fallback defaults.
 */
export async function getQuestionnaires(): Promise<Questionnaire[]> {
  try {
    const collRef = collection(db, 'questionnaires');
    const snapshot = await getDocs(collRef);
    const questionnairesMap = new Map<string, Questionnaire>();

    // Seed default questionnaires
    DEFAULT_QUESTIONNAIRES.forEach(q => questionnairesMap.set(q.id, q));

    snapshot.forEach(d => {
      questionnairesMap.set(d.id, { id: d.id, ...d.data() } as Questionnaire);
    });

    // If Firestore collection was empty, seed asynchronously
    if (snapshot.empty) {
      seedQuestionnairesIfMissing().catch(console.error);
    }

    return Array.from(questionnairesMap.values());
  } catch (err) {
    console.error('Error fetching questionnaires from firestore, using defaults:', err);
    return DEFAULT_QUESTIONNAIRES;
  }
}

/**
 * Returns distinct users for a specific questionnaire collection, ensuring zero cross-contamination.
 */
export async function getUsersByQuestionnaire(collectionPath: string): Promise<Array<{
  email: string;
  name: string;
  count: number;
  completedCount: number;
  inProgressCount: number;
  lastEval: string;
  lastStatus: 'in_progress' | 'completed';
}>> {
  try {
    const collRef = collection(db, collectionPath);
    const q = query(collRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    const userMap = new Map<string, {
      email: string;
      name: string;
      count: number;
      completedCount: number;
      inProgressCount: number;
      lastEval: string;
      lastStatus: 'in_progress' | 'completed';
    }>();

    snapshot.forEach((d) => {
      const data = d.data() as EvaluationDocument;
      if (!data.profile?.email) return;
      const email = data.profile.email.toLowerCase().trim();
      const isCompleted = data.status === 'completed';

      if (userMap.has(email)) {
        const u = userMap.get(email)!;
        u.count += 1;
        if (isCompleted) u.completedCount += 1;
        else u.inProgressCount += 1;

        if (new Date(data.updatedAt) > new Date(u.lastEval)) {
          u.lastEval = data.updatedAt;
          u.lastStatus = data.status;
          u.name = data.profile.name || u.name;
        }
      } else {
        userMap.set(email, {
          email,
          name: data.profile.name || 'Sin nombre',
          count: 1,
          completedCount: isCompleted ? 1 : 0,
          inProgressCount: isCompleted ? 0 : 1,
          lastEval: data.updatedAt || new Date().toISOString(),
          lastStatus: data.status
        });
      }
    });

    const list = Array.from(userMap.values());
    list.sort((a, b) => new Date(b.lastEval).getTime() - new Date(a.lastEval).getTime());
    return list;
  } catch (err) {
    console.error(`Error fetching users for ${collectionPath}:`, err);
    return [];
  }
}

/**
 * Calculates aggregate stats for a specific questionnaire collection
 */
export async function getQuestionnaireStats(collectionPath: string): Promise<{
  totalUsers: number;
  totalEvaluations: number;
  completedCount: number;
  inProgressCount: number;
  lastActivity: string | null;
}> {
  try {
    const collRef = collection(db, collectionPath);
    const q = query(collRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    const emails = new Set<string>();
    let totalEvaluations = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let lastActivity: string | null = null;

    snapshot.forEach((d) => {
      const data = d.data() as EvaluationDocument;
      totalEvaluations += 1;
      if (data.profile?.email) {
        emails.add(data.profile.email.toLowerCase().trim());
      }
      if (data.status === 'completed') {
        completedCount += 1;
      } else {
        inProgressCount += 1;
      }
      if (!lastActivity && data.updatedAt) {
        lastActivity = data.updatedAt;
      }
    });

    return {
      totalUsers: emails.size,
      totalEvaluations,
      completedCount,
      inProgressCount,
      lastActivity
    };
  } catch (err) {
    console.error(`Error getting stats for ${collectionPath}:`, err);
    return {
      totalUsers: 0,
      totalEvaluations: 0,
      completedCount: 0,
      inProgressCount: 0,
      lastActivity: null
    };
  }
}

/**
 * Helper to recursively remove undefined values so Firestore setDoc never fails with unsupported value errors.
 */
function sanitizeForFirestore(val: any): any {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirestore);
  }
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirestore(v);
    }
  }
  return clean;
}

/**
 * Normalizes collection paths so both internal form IDs and full collection names map reliably.
 */
export function normalizeCollectionPath(path?: string): string {
  if (!path) return 'evaluations_servicio_al_cliente';
  const clean = path.trim();
  if (clean === 'perfil_profesional' || clean === 'evaluations_perfil_profesional') {
    return 'evaluations_perfil_profesional';
  }
  if (clean === 'servicio_al_cliente' || clean === 'evaluations_servicio_al_cliente') {
    return 'evaluations_servicio_al_cliente';
  }
  return clean;
}

/**
 * Saves or updates an evaluation in Firestore
 */
export async function saveEvaluation(
  id: string,
  profile: UserProfile,
  answers: any,
  status: 'in_progress' | 'completed',
  currentStep?: ActiveStep | string,
  collectionPath: string = 'evaluations_servicio_al_cliente',
  questionnaireId?: string
): Promise<void> {
  if (!id) return;
  const targetCollection = normalizeCollectionPath(collectionPath);
  const targetQuestionnaireId = questionnaireId || 
    (targetCollection === 'evaluations_perfil_profesional' ? 'perfil_profesional' : 'servicio_al_cliente');

  const docRef = doc(db, targetCollection, id);
  const now = new Date().toISOString();
  
  // Try to check if document exists to preserve original createdAt
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
    questionnaireId: targetQuestionnaireId,
    profile,
    answers,
    status,
    createdAt,
    updatedAt: now,
    currentStep
  };

  const cleanPayload = sanitizeForFirestore(payload);
  await setDoc(docRef, cleanPayload);
}

/**
 * Retrieves a specific evaluation from Firestore
 */
export async function getEvaluation(id: string, collectionPath: string = 'evaluations_servicio_al_cliente'): Promise<EvaluationDocument | null> {
  if (!id) return null;
  const targetCollection = normalizeCollectionPath(collectionPath);
  const docRef = doc(db, targetCollection, id);
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
  const targetCollection = normalizeCollectionPath(collectionPath);
  const docRef = doc(db, targetCollection, id);
  await deleteDoc(docRef);
}

/**
 * Lists all evaluations, sorted by updatedAt descending.
 * Optionally filtered by email.
 */
export async function listEvaluations(email?: string, collectionPath: string = 'evaluations_servicio_al_cliente'): Promise<EvaluationDocument[]> {
  const targetCollection = normalizeCollectionPath(collectionPath);
  const collRef = collection(db, targetCollection);
  let q = query(collRef, orderBy('updatedAt', 'desc'));
  
  if (email && email.trim()) {
    q = query(
      collRef, 
      where('profile.email', '==', email.trim()),
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
