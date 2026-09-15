/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  email: string;
  date: string;
  acceptedConsent: boolean;
  editToken?: string;
}

export interface Section1Answers {
  energyTech: number; // 0 to 100 for technical energy, remaining is customer service energy
  energyReason: string;
  ticketExperience: string; // 'only_tech' | 'partial_relation' | 'excellent_ownership'
  evidences: string[]; // custom selected checkmarks
  evidenceDetails: string;
  atenderVsServirDescription: string;
  responseToday: string;
  responseHighService: string;
}

export interface PillarEvaluation {
  rating: number; // 1 to 10
  backlogExample: string;
  tenOverTenBehavior: string;
}

export interface Section2Answers {
  pillars: {
    [key: string]: PillarEvaluation;
  };
}

export interface Section3Answers {
  chequeoType: 'reactive' | 'proactive' | '';
  chequeoItems: string[];
  chequeoReason: string;
  processScores: {
    [stageId: string]: 'strong' | 'neutral' | 'weak';
  };
  processContribution: {
    [stageId: string]: string;
  };
  blindSpots: string;
  scenarioImpactCustomer: number; // 1 to 5
  scenarioImpactTeam: number; // 1 to 5
  scenarioIntervention: string;
}

export interface Section4Answers {
  techniquesUsed: string[];
  hardestTechnique: string;
  hardestTechniqueReason: string;
  ownershipScores: {
    [letter: string]: 'low' | 'medium' | 'high';
  };
  ownershipDetails: string;
  badNewsCategory: string; // 'escalation' | 'delay' | 'limitation' | 'other'
  badNewsCommunication: string;
  badNewsReflection: 'confidence' | 'uncertainty' | '';
}

export interface Section5Answers {
  practices: string[];
  teamContributionExample: string;
  colleagueAction: string;
  colleagueDialogue: string;
  strengtheningBehaviors: string[];
  weakeningBehaviors: string[];
  selfRecognizedBehaviors: string[];
}

export interface Section6Answers {
  checklist: string[];
  philosophicalRating: number; // 1 to 10
  twoWeeksChange: string;
  commitmentText: string;
  commitmentType: 'public' | 'private' | '';
  signature: string;
}

export interface QuestionnaireAnswers {
  section1: Section1Answers;
  section2: Section2Answers;
  section3: Section3Answers;
  section4: Section4Answers;
  section5: Section5Answers;
  section6: Section6Answers;
}

export interface EstudioCertificacionItem {
  id: string;
  tipo: string;
  titulo: string;
  institucion: string;
  anio?: string;
  estado?: string;
}

export interface LogroProfesionalDetalle {
  titulo: string;
  categoria?: string;
  anio?: string;
  descripcion?: string;
  impacto?: string;
  contextoReto?: string;
  accionRealizada?: string;
  impactoResultado?: string;
}

export interface PerfilProfesionalAnswers {
  // Sección 1: Trayectoria y Rol en FHONS
  cargo: string;
  queHaces: string;
  fechaIngreso: string;
  aniosExperiencia: string;

  // Sección 2: Especialidades, Formación y Logros
  habilidadesEspecialidades: string[];
  habilidadesTexto: string;
  estudiosCertificaciones: string;
  estudiosCertificacionesList?: EstudioCertificacionItem[];
  logroProfesional: string;
  logroDetallado?: LogroProfesionalDetalle;

  // Sección 3: Pasión y Cultura FHONS
  disfruteTrabajo: string;
  gustoFhons: string;
  tresPalabras: [string, string, string];
  hobbies: string;
  talentoOculto: string;

  // Sección 4: Factor Humano, Redes y Privacidad
  anecdotaDivertida: string;
  temaHoras: string;
  fraseLema: string;
  algoMas: string;
  linkedinUrl: string;
  fotoPreferencia: 'tengo_foto' | 'coordinar_sesion' | '';
  fotoUrl?: string;
  restriccionesPrivacidad: string;
  editToken?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  collectionPath: string;
  uiPath: string;
  createdAt?: string;
}

export type ActiveStep = 
  | 'welcome' 
  | 'section1' | 'section2' | 'section3' | 'section4' | 'section5' | 'section6' | 'summary'
  | 'perfil_section1' | 'perfil_section2' | 'perfil_section3' | 'perfil_section4' | 'perfil_summary';

export interface PillarMetadata {
  id: string;
  name: string;
  description: string;
  subTitle: string;
}

export interface ProcessStageMetadata {
  id: string;
  name: string;
  description: string;
  technicalTerm: string;
}

export interface TechniqueMetadata {
  id: string;
  name: string;
  description: string;
  example: string;
}

export interface OwnershipLetterMetadata {
  letter: string;
  concept: string;
  description: string;
}
