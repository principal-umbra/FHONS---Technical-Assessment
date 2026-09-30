/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { UserProfile, QuestionnaireAnswers, PerfilProfesionalAnswers, ActiveStep, Questionnaire, QuestionnaireAssignment } from '../types';

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
  status: 'pending' | 'in_progress' | 'abierto_pendiente' | 'completed';
  createdAt: string;
  updatedAt: string;
  currentStep?: ActiveStep | string;
  editToken?: string;
}

/**
 * Generates a clean, human-readable edit token (e.g. FH-7K9P2X)
 */
export function generateEditToken(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FH-${result}`;
}

export const DEFAULT_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'servicio_al_cliente',
    title: 'Soporte TI de Excelencia',
    description: 'Cuestionario de autoevaluación introspectivo para evaluar empatía, ownership y criterios de servicio técnico.',
    collectionPath: 'evaluations_servicio_al_cliente',
    uiPath: 'servicio_al_cliente',
    category: 'Soporte & Habilidades Blandas',
    status: 'active',
    estimatedMinutes: 20,
    icon: 'Headphones',
    tags: ['Soporte TI', 'Pilares', 'Atención']
  },
  {
    id: 'perfil_profesional',
    title: 'Perfil Profesional FHONS (Web Oficial)',
    description: 'Cuestionario para crear el perfil público de los colaboradores en el website oficial de la compañía.',
    collectionPath: 'evaluations_perfil_profesional',
    uiPath: 'perfil_profesional',
    category: 'Talento & Presencia Digital',
    status: 'active',
    estimatedMinutes: 15,
    icon: 'Globe',
    tags: ['Web Oficial', 'Biografía', 'Habilidades']
  },
  {
    id: 'proceso_retroalimentacion',
    title: 'Proceso de Retroalimentación y Seguimiento de Incumplimientos',
    description: 'Material oficial y cuestionario sobre las 4 etapas disciplinarias, reglas de no reincidencia y marco legal (Ley 16-92).',
    collectionPath: 'evaluations_proceso_retroalimentacion',
    uiPath: 'proceso_retroalimentacion',
    category: 'Procesos Laborales & Talento',
    status: 'active',
    estimatedMinutes: 20,
    icon: 'ShieldAlert',
    tags: ['Procesos', 'Retroalimentación', 'Ley 16-92', 'Faltas']
  },
  {
    id: 'proceso_guardia',
    title: 'Proceso de Guardia de FHONS',
    description: 'Material oficial y evaluación de rotación semanal, disponibilidad remota, atención de emergencias y registro en CRM fuera de horario.',
    collectionPath: 'evaluations_proceso_guardia',
    uiPath: 'proceso_guardia',
    category: 'Procesos Operativos & Continuidad',
    status: 'active',
    estimatedMinutes: 15,
    icon: 'Moon',
    tags: ['Procesos', 'Guardia', 'Disponibilidad', 'CRM']
  },
  {
    id: 'protocolo_tickets',
    title: 'Protocolo de Responsabilidad y Seguimiento de Tickets',
    description: 'Material oficial y evaluación de propiedad del ticket, proactividad, rol de coordinación RR y reglas estrictas de reasignación.',
    collectionPath: 'evaluations_protocolo_tickets',
    uiPath: 'protocolo_tickets',
    category: 'Protocolos de Servicio al Cliente',
    status: 'active',
    estimatedMinutes: 15,
    icon: 'Inbox',
    tags: ['Protocolos', 'Tickets', 'Ownership', 'Seguimiento']
  },
  {
    id: 'protocolo_migraciones',
    title: 'Protocolo de Migraciones de FHONS',
    description: 'Material oficial y evaluación sobre gestión operativa y administrativa: programación, autorizaciones, imprevistos y comunicación.',
    collectionPath: 'evaluations_protocolo_migraciones',
    uiPath: 'protocolo_migraciones',
    category: 'Protocolos de Infraestructura & Proyectos',
    status: 'active',
    estimatedMinutes: 20,
    icon: 'Server',
    tags: ['Protocolos', 'Migraciones', 'Operaciones', 'Jornada']
  },
  {
    id: 'protocolo_visitas',
    title: 'Protocolo de Visitas Técnicas y Trabajos Fuera de la Oficina',
    description: 'Material oficial y evaluación sobre salidas a clientes, uniformidad y carnet, solicitudes imprevistas y registro de desplazamientos.',
    collectionPath: 'evaluations_protocolo_visitas',
    uiPath: 'protocolo_visitas',
    category: 'Protocolos de Campo & Seguridad',
    status: 'active',
    estimatedMinutes: 20,
    icon: 'Briefcase',
    tags: ['Protocolos', 'Visitas Técnicas', 'Terreno', 'Seguridad']
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
  lastStatus: 'pending' | 'in_progress' | 'abierto_pendiente' | 'completed';
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
      lastStatus: 'pending' | 'in_progress' | 'abierto_pendiente' | 'completed';
    }>();

    snapshot.forEach((d) => {
      const data = d.data() as EvaluationDocument;
      if (!data.profile?.email) return;
      const rawEmail = normalizeEmail(data.profile.email);
      const canonical = getCanonicalEmail(rawEmail);
      const isCompleted = data.status === 'completed';

      if (userMap.has(canonical)) {
        const u = userMap.get(canonical)!;
        u.count += 1;
        if (isCompleted) u.completedCount += 1;
        else u.inProgressCount += 1;

        if (new Date(data.updatedAt) > new Date(u.lastEval)) {
          u.lastEval = data.updatedAt;
          u.lastStatus = data.status;
          if (data.profile.name && !data.profile.name.includes('@')) {
            u.name = data.profile.name;
          }
        }
      } else {
        userMap.set(canonical, {
          email: canonical,
          name: (data.profile.name && !data.profile.name.includes('@')) ? data.profile.name : canonical.split('@')[0],
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
  if (clean.startsWith('evaluations_')) return clean;
  return `evaluations_${clean}`;
}

/**
 * Saves or updates an evaluation in Firestore
 */
export async function saveEvaluation(
  id: string,
  profile: UserProfile,
  answers: any,
  status: 'in_progress' | 'abierto_pendiente' | 'completed',
  currentStep?: ActiveStep | string,
  collectionPath: string = 'evaluations_servicio_al_cliente',
  questionnaireId?: string,
  explicitToken?: string
): Promise<string | undefined> {
  if (!id) return undefined;
  const targetCollection = normalizeCollectionPath(collectionPath);
  const targetQuestionnaireId = questionnaireId || 
    (targetCollection.startsWith('evaluations_') ? targetCollection.replace('evaluations_', '') : targetCollection);

  const docRef = doc(db, targetCollection, id);
  const now = new Date().toISOString();
  
  // Try to check if document exists to preserve original createdAt and editToken
  let createdAt = now;
  let finalEditToken = explicitToken || answers?.editToken || profile?.editToken;

  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      createdAt = existingData.createdAt || now;
      if (!finalEditToken && existingData.editToken) {
        finalEditToken = existingData.editToken;
      }
    }
  } catch (e) {
    console.error('Error fetching existing doc', e);
  }

  // Generate edit token if still missing
  if (!finalEditToken) {
    finalEditToken = generateEditToken();
  }

  const updatedProfile: UserProfile = {
    ...profile,
    ...(finalEditToken ? { editToken: finalEditToken } : {})
  };

  const updatedAnswers = {
    ...answers,
    ...(finalEditToken ? { editToken: finalEditToken } : {})
  };

  const payload: EvaluationDocument = {
    id,
    questionnaireId: targetQuestionnaireId,
    profile: updatedProfile,
    answers: updatedAnswers,
    status,
    createdAt,
    updatedAt: now,
    currentStep,
    editToken: finalEditToken
  };

  const cleanPayload = sanitizeForFirestore(payload);
  await setDoc(docRef, cleanPayload);

  // Auto-sync assignment status if assignment exists for this email and questionnaire
  if (updatedProfile.email && targetQuestionnaireId) {
    syncAssignmentProgress(
      updatedProfile.email,
      targetQuestionnaireId,
      status
    ).catch(console.error);
  }

  return finalEditToken;
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
  
  try {
    let querySnapshot;
    if (email && email.trim()) {
      // Do NOT combine where and orderBy across different fields to avoid composite index requirements!
      const q = query(collRef, where('profile.email', '==', email.trim().toLowerCase()));
      querySnapshot = await getDocs(q);
    } else {
      const q = query(collRef, orderBy('updatedAt', 'desc'));
      querySnapshot = await getDocs(q);
    }

    const records: EvaluationDocument[] = [];
    querySnapshot.forEach((docSnap) => {
      records.push(docSnap.data() as EvaluationDocument);
    });
    // In-memory sort ensures perfect ordering without requiring Firestore composite indexes
    records.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return records;
  } catch (err) {
    console.error(`Error listing evaluations in ${targetCollection}:`, err);
    return [];
  }
}

/**
 * Fetches all evaluations across all questionnaires for a given email dynamically, unifying any linked aliases.
 */
export async function listAllUserEvaluations(email: string): Promise<EvaluationDocument[]> {
  if (!email || !email.trim()) return [];
  const cleanEmail = normalizeEmail(email);
  const associated = getAllAssociatedEmails(cleanEmail);
  const allQ = await getQuestionnaires();
  
  const results = await Promise.all(
    associated.flatMap(em =>
      allQ.map(q => 
        listEvaluations(em, q.collectionPath)
          .then(docs => docs.map(d => ({ ...d, questionnaireId: q.id })))
          .catch(() => [] as EvaluationDocument[])
      )
    )
  );

  const combined = results.flat();
  const map = new Map<string, EvaluationDocument>();
  combined.forEach(docItem => {
    if (!map.has(docItem.id)) {
      map.set(docItem.id, docItem);
    }
  });

  const uniqueList = Array.from(map.values());
  uniqueList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return uniqueList;
}

/**
 * Normalizes email for assignment document IDs and consistent queries
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Known agent aliases mapping. Links alternative corporate or personal emails to the canonical profile.
 */
export const KNOWN_AGENT_ALIASES: Record<string, string[]> = {
  'raymond@fhons.com.do': ['rquintana@fhons.com.do', 'raymondquintana23@gmail.com'],
  'rquintana@fhons.com.do': ['raymond@fhons.com.do', 'raymondquintana23@gmail.com'],
  'raymondquintana23@gmail.com': ['raymond@fhons.com.do', 'rquintana@fhons.com.do'],
};

/**
 * Returns the canonical email for an agent (to unify multiple aliases under one profile)
 */
export function getCanonicalEmail(email: string): string {
  const clean = normalizeEmail(email);
  if (
    clean === 'rquintana@fhons.com.do' || 
    clean === 'raymondquintana23@gmail.com' || 
    clean === 'raymond@fhons.com.do'
  ) {
    return 'raymond@fhons.com.do';
  }
  return clean;
}

/**
 * Returns all associated emails for a given email (including itself and known aliases)
 */
export function getAllAssociatedEmails(email: string): string[] {
  const clean = normalizeEmail(email);
  const aliases = KNOWN_AGENT_ALIASES[clean];
  if (aliases && aliases.length > 0) {
    return Array.from(new Set([clean, ...aliases]));
  }
  return [clean];
}

/**
 * Creates or updates an assignment for a questionnaire to an agent, automatically syncing all linked aliases
 */
export async function saveAssignment(
  assignment: Omit<QuestionnaireAssignment, 'id'> & { id?: string }
): Promise<string> {
  const cleanEmail = normalizeEmail(assignment.agentEmail);
  const id = assignment.id || `${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${assignment.questionnaireId}`;
  const docRef = doc(db, 'questionnaire_assignments', id);
  
  const payload: QuestionnaireAssignment = {
    ...assignment,
    id,
    agentEmail: cleanEmail,
    assignedAt: assignment.assignedAt || new Date().toISOString(),
    status: assignment.status || 'pending'
  };

  const cleanPayload = sanitizeForFirestore(payload);
  await setDoc(docRef, cleanPayload, { merge: true });

  // Automatically mirror to all associated aliases for this agent
  const associated = getAllAssociatedEmails(cleanEmail).filter(e => e !== cleanEmail);
  for (const altEmail of associated) {
    const altId = `${altEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${assignment.questionnaireId}`;
    const altDocRef = doc(db, 'questionnaire_assignments', altId);
    await setDoc(altDocRef, sanitizeForFirestore({
      ...payload,
      id: altId,
      agentEmail: altEmail
    }), { merge: true }).catch(() => {});
  }

  return id;
}

/**
 * Bulk assigns a questionnaire to multiple agent emails
 */
export async function bulkAssignQuestionnaire(
  emails: string[],
  questionnaireId: string,
  questionnaireTitle?: string,
  notes?: string,
  assignedBy?: string,
  agentName?: string
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const rawEmail of emails) {
    const cleanEmail = normalizeEmail(rawEmail);
    if (!cleanEmail || !cleanEmail.includes('@')) continue;

    const allEmailsToAssign = getAllAssociatedEmails(cleanEmail);

    for (const targetEmail of allEmailsToAssign) {
      const id = `${targetEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${questionnaireId}`;
      const docRef = doc(db, 'questionnaire_assignments', id);
      const existingSnap = await getDoc(docRef);

      if (existingSnap.exists()) {
        await setDoc(docRef, sanitizeForFirestore({
          agentEmail: targetEmail,
          questionnaireTitle: questionnaireTitle || existingSnap.data()?.questionnaireTitle,
          notes: notes !== undefined ? notes : existingSnap.data()?.notes,
          assignedBy: assignedBy || existingSnap.data()?.assignedBy,
          ...(agentName ? { agentName } : {})
        }), { merge: true });
        updated++;
      } else {
        const payload: QuestionnaireAssignment = {
          id,
          agentEmail: targetEmail,
          agentName: agentName || targetEmail.split('@')[0],
          questionnaireId,
          questionnaireTitle: questionnaireTitle || (questionnaireId === 'perfil_profesional' ? 'Perfil Profesional FHONS (Web Oficial)' : 'Soporte TI de Excelencia'),
          assignedAt: new Date().toISOString(),
          assignedBy: assignedBy || 'Administrador',
          status: 'pending',
          notes: notes || ''
        };
        await setDoc(docRef, sanitizeForFirestore(payload));
        created++;
      }
    }
  }

  return { created, updated };
}

/**
 * Lists all assignments for a specific email with multi-layer fallback & alias unification:
 * 1. Deterministic docId lookup for each known questionnaire across all associated emails
 * 2. Firestore query where agentEmail in associated emails
 * 3. In-memory filter over all assignments (avoids any index/cache miss)
 */
export async function getAssignmentsByEmail(email: string): Promise<QuestionnaireAssignment[]> {
  if (!email || !email.trim()) return [];
  const cleanEmail = normalizeEmail(email);
  const associatedEmails = getAllAssociatedEmails(cleanEmail);
  const assignmentsMap = new Map<string, QuestionnaireAssignment>();

  // Priority order for status: completed > abierto_pendiente > in_progress > pending
  const statusPriority: Record<string, number> = {
    'completed': 4,
    'abierto_pendiente': 3,
    'in_progress': 2,
    'pending': 1
  };

  const mergeAssignment = (a: QuestionnaireAssignment) => {
    if (!a || !a.questionnaireId) return;
    const existing = assignmentsMap.get(a.questionnaireId);
    if (!existing) {
      assignmentsMap.set(a.questionnaireId, a);
    } else {
      const currentScore = statusPriority[existing.status] || 0;
      const newScore = statusPriority[a.status] || 0;
      if (newScore > currentScore) {
        assignmentsMap.set(a.questionnaireId, a);
      }
    }
  };

  // Strategy 1: Direct document lookups for all associated emails
  try {
    const allQ = await getQuestionnaires();
    for (const em of associatedEmails) {
      const docLookups = await Promise.all(
        allQ.map(async (q) => {
          const docId = `${em.replace(/[^a-zA-Z0-9]/g, '_')}_${q.id}`;
          try {
            const snap = await getDoc(doc(db, 'questionnaire_assignments', docId));
            if (snap.exists()) {
              return snap.data() as QuestionnaireAssignment;
            }
          } catch {
            // ignore individual error
          }
          return null;
        })
      );
      docLookups.forEach((a) => {
        if (a) mergeAssignment(a);
      });
    }
  } catch (err) {
    console.warn('Direct doc lookup in getAssignmentsByEmail:', err);
  }

  // Strategy 2: Query by agentEmail field for all associated emails
  try {
    const collRef = collection(db, 'questionnaire_assignments');
    for (const em of associatedEmails) {
      const q = query(collRef, where('agentEmail', '==', em));
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as QuestionnaireAssignment;
        if (data) mergeAssignment(data);
      });
    }
  } catch (err) {
    console.warn('Field query where agentEmail in getAssignmentsByEmail:', err);
  }

  // Strategy 3: Global fallback in memory across all assignments
  try {
    const all = await getAllAssignments();
    all.forEach((a) => {
      if (a && a.agentEmail) {
        const aNorm = normalizeEmail(a.agentEmail);
        if (associatedEmails.includes(aNorm)) {
          mergeAssignment(a);
        }
      }
    });
  } catch (err) {
    console.warn('Fallback getAllAssignments in getAssignmentsByEmail:', err);
  }

  // Strategy 4: Raymond Quintana fallback (ensures complete default catalog is guaranteed)
  const isRaymond = associatedEmails.includes('raymond@fhons.com.do') || 
                    associatedEmails.includes('rquintana@fhons.com.do') || 
                    associatedEmails.includes('raymondquintana23@gmail.com');

  if (isRaymond) {
    const allQ = await getQuestionnaires();
    for (const q of allQ) {
      if (!assignmentsMap.has(q.id)) {
        const fallbackAssignment: QuestionnaireAssignment = {
          id: `${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${q.id}`,
          agentEmail: cleanEmail,
          agentName: 'Raymond Quintana',
          questionnaireId: q.id,
          questionnaireTitle: q.title,
          assignedAt: new Date().toISOString(),
          assignedBy: 'Administrador FHONS',
          status: 'pending',
          notes: 'Cuestionario institucional asignado por la administración'
        };
        assignmentsMap.set(q.id, fallbackAssignment);
        saveAssignment(fallbackAssignment).catch(() => {});
      }
    }
  }

  return Array.from(assignmentsMap.values());
}

/**
 * Lists all assignments across all questionnaires and agents
 */
export async function getAllAssignments(): Promise<QuestionnaireAssignment[]> {
  try {
    const collRef = collection(db, 'questionnaire_assignments');
    const snapshot = await getDocs(collRef);
    const list: QuestionnaireAssignment[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as QuestionnaireAssignment);
    });
    list.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
    return list;
  } catch (err) {
    console.error('Error fetching all assignments:', err);
    return [];
  }
}

/**
 * Deletes an assignment (also cleans up mirrors if applicable)
 */
export async function deleteAssignment(id: string, agentEmail?: string, questionnaireId?: string): Promise<void> {
  if (!id) return;
  const docRef = doc(db, 'questionnaire_assignments', id);
  await deleteDoc(docRef);

  if (agentEmail && questionnaireId) {
    const associated = getAllAssociatedEmails(agentEmail).filter(e => normalizeEmail(e) !== normalizeEmail(agentEmail));
    for (const alt of associated) {
      const altId = `${alt.replace(/[^a-zA-Z0-9]/g, '_')}_${questionnaireId}`;
      deleteDoc(doc(db, 'questionnaire_assignments', altId)).catch(() => {});
    }
  }
}

/**
 * Updates status of an assignment if exists (e.g. from pending to in_progress or completed) across all aliases
 */
export async function syncAssignmentProgress(
  email: string,
  questionnaireId: string,
  status: 'pending' | 'abierto_pendiente' | 'in_progress' | 'completed',
  extraData?: { scorePercentage?: number; attemptsCount?: number }
): Promise<void> {
  if (!email || !questionnaireId) return;
  try {
    const cleanEmail = normalizeEmail(email);
    const associated = getAllAssociatedEmails(cleanEmail);

    for (const em of associated) {
      const id = `${em.replace(/[^a-zA-Z0-9]/g, '_')}_${questionnaireId}`;
      const docRef = doc(db, 'questionnaire_assignments', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await setDoc(docRef, { 
          status, 
          updatedAt: new Date().toISOString(),
          ...(extraData ? extraData : {})
        }, { merge: true });
      }
    }
  } catch (err) {
    console.error('Error syncing assignment progress:', err);
  }
}

/**
 * Saves or updates a questionnaire configuration in Firestore
 */
export async function saveQuestionnaire(questionnaire: Questionnaire): Promise<void> {
  const docRef = doc(db, 'questionnaires', questionnaire.id);
  await setDoc(docRef, sanitizeForFirestore({
    ...questionnaire,
    createdAt: questionnaire.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), { merge: true });
}

