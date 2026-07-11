/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PillarMetadata,
  ProcessStageMetadata,
  TechniqueMetadata,
  OwnershipLetterMetadata,
  QuestionnaireAnswers
} from '../../../types';

export const PILLARS: PillarMetadata[] = [
  {
    id: 'empatia',
    name: 'Empatía',
    subTitle: 'Entender antes de responder',
    description: 'Comprender la situación, necesidad, emoción e impacto del problema para el cliente (no significa darle siempre la razón).'
  },
  {
    id: 'comunicacion',
    name: 'Comunicación Efectiva',
    subTitle: 'Explicar con claridad',
    description: 'Escucha activa, hacer preguntas, adaptar el lenguaje, confirmar comprensión.'
  },
  {
    id: 'ownership',
    name: 'Ownership / Propiedad',
    subTitle: 'Hacerse responsable del caso',
    description: 'Asumir el problema como propio, evitar "eso no me corresponde", acompañar hasta la solución.'
  },
  {
    id: 'competencia',
    name: 'Competencia Profesional',
    subTitle: 'Conocer producto, proceso y herramientas',
    description: 'Dominio técnico que genera confianza y reduce errores de diagnóstico o ejecución.'
  },
  {
    id: 'orientacion',
    name: 'Orientación a la Solución',
    subTitle: 'Buscar cómo resolver, no excusas',
    description: 'Ser proactivo, analizar alternativas viables, mitigar cuellos de botella y eliminar obstáculos.'
  },
  {
    id: 'profesionalismo',
    name: 'Profesionalismo',
    subTitle: 'Respeto, calma, honestidad y coherencia',
    description: 'Mantener calidad incluso en situaciones difíciles, ser íntegro en las respuestas y cumplir acuerdos.'
  },
  {
    id: 'adaptabilidad',
    name: 'Adaptabilidad',
    subTitle: 'Tratar a cada cliente de forma distinta',
    description: 'Ajustar la profundidad técnica, la velocidad de comunicación y el ritmo según el perfil del usuario.'
  },
  {
    id: 'mejora',
    name: 'Mejora Continua',
    subTitle: 'Aprender de cada caso',
    description: 'Aceptar feedback del usuario y del equipo, identificar oportunidades de automatización o documentación.'
  }
];

export const PROCESS_STAGES: ProcessStageMetadata[] = [
  {
    id: 'recepcion',
    name: 'Recepción',
    technicalTerm: 'Gestión del Requerimiento / Registro',
    description: 'Contacto inicial con el usuario, registro del ticket, escucha activa de la incidencia o solicitud.'
  },
  {
    id: 'diagnostico',
    name: 'Diagnóstico',
    technicalTerm: 'Troubleshooting / Análisis',
    description: 'Búsqueda del origen de la falla técnica, análisis de logs, formulación de hipótesis técnicas.'
  },
  {
    id: 'ejecucion',
    name: 'Ejecución',
    technicalTerm: 'Resolución de Problemas',
    description: 'Aplicación de cambios, reinicios, configuraciones o parches técnicos para mitigar o solucionar la causa raíz.'
  },
  {
    id: 'escalacion',
    name: 'Resolución / Escalación',
    technicalTerm: 'Flujo de Escalamiento / Cierre Técnico',
    description: 'Resolver el problema definitivamente o traspasarlo de manera formal y documentada a un nivel superior si supera el alcance.'
  },
  {
    id: 'seguimiento',
    name: 'Seguimiento y Cierre',
    technicalTerm: 'Aseguramiento de Calidad / Trazabilidad',
    description: 'Confirmar con el usuario que el servicio funciona perfectamente, documentar la solución en el CRM y cerrar formalmente.'
  }
];

export const TECHNIQUES: TechniqueMetadata[] = [
  {
    id: 'regla3c',
    name: 'Regla 3C',
    description: 'Comunicaciones Claras, Concisas y Completas.',
    example: 'Escribir las instrucciones paso a paso con capturas, indicando el tiempo estimado sin rodeos técnicos innecesarios.'
  },
  {
    id: 'regla7030',
    name: 'Principio 70/30',
    description: 'Escuchar o leer el 70% del tiempo; hablar o escribir el 30%.',
    example: 'Permitir al usuario desahogarse y explicar el contexto de su negocio antes de interrumpir con preguntas técnicas rápidas.'
  },
  {
    id: 'prep',
    name: 'Método PREP',
    description: 'Point (Punto), Reason (Razón), Example (Ejemplo), Point (Reiteración del punto).',
    example: '"Debemos reiniciar el ERP (P) porque se saturaron las conexiones huérfanas (R). Por ejemplo, ayer pasó algo similar y tomó 2 minutos volver a operar (E). Hagámoslo ahora para restablecer tus ventas (P)."'
  },
  {
    id: 'oro',
    name: 'Regla de Oro',
    description: 'Tratar al usuario con la misma empatía, urgencia y respeto que esperarías recibir si tu trabajo dependiera de este sistema.',
    example: 'Hacerse cargo del ticket de un ERP caído con el mismo sentido de urgencia que si fuera tu propia nómina la que se está perdiendo.'
  }
];

export const OWNERSHIP_LETTERS: OwnershipLetterMetadata[] = [
  {
    letter: 'O',
    concept: 'Own the issue',
    description: 'Asumir el problema del cliente como propio. Evitar derivaciones vacías o el clásico "eso no me corresponde".'
  },
  {
    letter: 'W',
    concept: 'Win trust',
    description: 'Ganar la confianza del cliente a través de honestidad, lenguaje seguro y explicaciones transparentes.'
  },
  {
    letter: 'N',
    concept: 'Navigate options',
    description: 'Explorar proactivamente alternativas viables en lugar de responder un simple "no se puede".'
  },
  {
    letter: 'E',
    concept: 'Empathetic approach',
    description: 'Reconocer el impacto emocional y comercial que el fallo tiene en la productividad diaria del cliente.'
  },
  {
    letter: 'R',
    concept: 'Responsive communication',
    description: 'Mantener comunicaciones dinámicas, ágiles y oportunas. Evitar dejar al cliente en silencio administrativo.'
  },
  {
    letter: 'S',
    concept: 'Solve proactively',
    description: 'Prevenir incidentes repetitivos y adelantarse a las dudas que el usuario pueda tener en las próximas horas.'
  },
  {
    letter: 'H',
    concept: 'Honor commitments',
    description: 'Cumplir de manera estricta los tiempos, llamadas agendadas y promesas técnicas acordadas.'
  },
  {
    letter: 'I',
    concept: 'Inform continuously',
    description: 'Reportar el progreso del ticket paso a paso, de modo que el cliente sepa que hay alguien trabajando activamente.'
  },
  {
    letter: 'P',
    concept: 'Pursue resolution',
    description: 'Acompañar y dar seguimiento integral al usuario hasta confirmar el éxito y asegurar su total tranquilidad.'
  }
];

export const INITIAL_ANSWERS: QuestionnaireAnswers = {
  section1: {
    energyTech: 50,
    energyReason: '',
    ticketExperience: '',
    evidences: [],
    evidenceDetails: '',
    atenderVsServirDescription: '',
    responseToday: '',
    responseHighService: ''
  },
  section2: {
    pillars: PILLARS.reduce((acc, pillar) => {
      acc[pillar.id] = {
        rating: 5,
        backlogExample: '',
        tenOverTenBehavior: ''
      };
      return acc;
    }, {} as { [key: string]: { rating: number; backlogExample: string; tenOverTenBehavior: string } })
  },
  section3: {
    chequeoType: '',
    chequeoItems: [],
    chequeoReason: '',
    processScores: PROCESS_STAGES.reduce((acc, stage) => {
      acc[stage.id] = 'neutral';
      return acc;
    }, {} as { [key: string]: 'strong' | 'neutral' | 'weak' }),
    processContribution: PROCESS_STAGES.reduce((acc, stage) => {
      acc[stage.id] = '';
      return acc;
    }, {} as { [key: string]: string }),
    blindSpots: '',
    scenarioImpactCustomer: 3,
    scenarioImpactTeam: 3,
    scenarioIntervention: ''
  },
  section4: {
    techniquesUsed: [],
    hardestTechnique: '',
    hardestTechniqueReason: '',
    ownershipScores: OWNERSHIP_LETTERS.reduce((acc, item) => {
      acc[item.letter] = 'medium';
      return acc;
    }, {} as { [key: string]: 'low' | 'medium' | 'high' }),
    ownershipDetails: '',
    badNewsCategory: '',
    badNewsCommunication: '',
    badNewsReflection: ''
  },
  section5: {
    practices: [],
    teamContributionExample: '',
    colleagueAction: '',
    colleagueDialogue: '',
    strengtheningBehaviors: [],
    weakeningBehaviors: [],
    selfRecognizedBehaviors: []
  },
  section6: {
    checklist: [],
    philosophicalRating: 5,
    twoWeeksChange: '',
    commitmentText: '',
    commitmentType: '',
    signature: ''
  }
};
