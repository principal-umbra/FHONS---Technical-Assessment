/**
 * Documento Oficial y Preguntas Evaluativas para:
 * Protocolo de Migraciones de FHONS (Gestión Operativa y Administrativa)
 */

import { QuizQuestion } from '../proceso_retroalimentacion/data';

export const MATERIAL_MIGRACIONES = {
  title: "Protocolo de Migraciones de FHONS",
  company: "FHONS SRL",
  intro: `Este protocolo establece cómo el agente debe organizar, comunicar y documentar una migración, esté de guardia o no. Su alcance es operativo y administrativo; no describe los pasos técnicos para ejecutarla.`,
  sections: [
    {
      num: "1",
      title: "Programación y horario",
      badge: "Horarios y Turnos",
      content: `Debe quedar definida y comunicada la fecha, la hora de inicio y la duración estimada de la migración.
Las migraciones se realizan normalmente dentro del horario de guardia, que termina a las 11:00 p. m. Según la programación o el desarrollo del trabajo, también pueden iniciar fuera de ese horario o extenderse más allá de él. Las responsabilidades de comunicación y documentación se mantienen durante toda la intervención.`
    },
    {
      num: "2",
      title: "Condiciones y autorización excepcional",
      badge: "Afectación a Producción",
      content: `Una migración solicitada por el cliente, que forme parte de sus requerimientos habituales y se realice en condiciones normales, no requiere aprobación administrativa adicional.
Si presenta una condición fuera de lo habitual, como una posible afectación a la producción u operación del cliente, debe coordinarse previamente con la administración y el cliente para acordar las condiciones y obtener la autorización correspondiente.`
    },
    {
      num: "3",
      title: "Atención durante la migración",
      badge: "Concurrencia de Tareas",
      content: `El agente debe ajustar su atención al tipo de migración y a las condiciones acordadas. Cuando el proceso requiera concentración continua, debe enfocarse en su ejecución y mantenerse atento a las comunicaciones para identificar cualquier eventualidad de mayor urgencia.
Recibir una nueva solicitud no implica interrumpir inmediatamente la migración. El agente debe confirmar su recepción, evaluar su prioridad e informar cómo se atenderá. Si requiere atención urgente y no puede asumirla, debe comunicarlo a la administración para que determine cómo proceder.
En migraciones sencillas o con períodos de espera que permitan atender otras tareas, el agente puede continuar con sus asignaciones, siempre que esto no comprometa el proceso.
La participación en una migración no convierte automáticamente al agente en responsable de la guardia si esta no le corresponde.`
    },
    {
      num: "4",
      title: "Inicio y comunicación de avances",
      badge: "Actualizaciones Continuas",
      content: `El agente debe notificar a la administración cuando inicie la migración y mantener informado al cliente según sea necesario.
Durante el trabajo, debe comunicar avances relevantes, cambios en la hora estimada de finalización y cualquier dificultad o afectación no prevista. Estas actualizaciones deben permitir conocer el estado del proceso sin necesidad de solicitarlo repetidamente.`
    },
    {
      num: "5",
      title: "Manejo de eventualidades",
      badge: "Gestión de Contingencias",
      content: `Cuando surja una eventualidad que afecte el desarrollo, la duración o el resultado de la migración, el agente debe informar qué ocurrió, su impacto y cómo la está atendiendo. Si necesita apoyo o alguna decisión administrativa, debe indicarlo expresamente.
La administración intervendrá cuando lo considere prudente o cuando el agente solicite su apoyo.`
    },
    {
      num: "6",
      title: "Extensión del trabajo y jornada siguiente",
      badge: "Afectación al Horario Siguiente",
      content: `Si la migración se prolonga o presenta una eventualidad que pueda afectar la incorporación del agente a su horario habitual del día siguiente, debe notificarlo con anticipación a la administración, tan pronto identifique esa posibilidad.
Debe informar el estado del trabajo y la hora estimada de terminación, si puede determinarla. Al finalizar, debe confirmar la hora real de cierre.
La administración comunicará cualquier ajuste necesario para la jornada siguiente. El agente debe contar con esa confirmación antes de asumir un cambio de horario o modalidad.`
    },
    {
      num: "7",
      title: "Finalización",
      badge: "Cierre Operativo",
      content: `Al terminar, el agente debe comunicar a la administración el resultado, la hora de finalización y las evidencias correspondientes, indicando cualquier pendiente, limitación o validación que aún sea necesaria.
También debe informar al cliente del resultado y de cualquier acción que este necesite realizar.`
    },
    {
      num: "8",
      title: "Registro y documentación",
      badge: "Evidencia y Reporte",
      content: `La migración debe quedar registrada en un ticket que incluya la programación, el trabajo realizado, el tiempo dedicado, las eventualidades, las decisiones tomadas y el resultado final.
El agente debe incorporar las evidencias correspondientes y elaborar un informe cuando el caso lo requiera.`
    }
  ]
};

export const QUESTIONS_MIGRACIONES: QuizQuestion[] = [
  {
    id: "m1",
    section: "Alcance del Protocolo",
    question: "¿Cuál es el alcance primordial de este protocolo de migraciones?",
    type: "single_choice",
    options: [
      { id: "a", text: "Es un manual con comandos de consola Linux y scripts técnicos para migrar bases de datos." },
      { id: "b", text: "Establece cómo el agente debe organizar, comunicar y documentar una migración desde el punto de vista operativo y administrativo." },
      { id: "c", text: "Establece los costos financieros y tarifas por hora que se cobran al cliente." },
      { id: "d", text: "Reemplaza al manual del fabricante del servidor de correo." }
    ],
    correctAnswer: "b",
    explanation: "Su alcance es operativo y administrativo (organización, comunicación y documentación); no describe los pasos técnicos para ejecutarla."
  },
  {
    id: "m2",
    section: "Autorización Excepcional",
    question: "¿En qué circunstancia una migración requiere autorización y coordinación previa con la administración y el cliente?",
    type: "single_choice",
    options: [
      { id: "a", text: "Siempre que dure más de 10 minutos." },
      { id: "b", text: "Cuando presente una condición fuera de lo habitual, como una posible afectación a la producción u operación del cliente." },
      { id: "c", text: "Únicamente si la solicita un cliente nuevo con menos de un mes de contrato." },
      { id: "d", text: "Nunca, el agente puede apagar los servidores del cliente a discreción." }
    ],
    correctAnswer: "b",
    explanation: "Las migraciones habituales en condiciones normales no requieren aprobación extra. Pero si hay riesgo de afectación a la producción del cliente, se requiere coordinación y autorización previa."
  },
  {
    id: "m3",
    section: "Atención y Tareas Paralelas",
    question: "Si durante una migración crítica que requiere concentración continua entra una nueva solicitud, ¿cómo debe actuar el agente?",
    type: "single_choice",
    options: [
      { id: "a", text: "Debe abandonar de inmediato la migración sin avisar a nadie." },
      { id: "b", text: "Confirmar recepción de la nueva solicitud, evaluar su prioridad e informar cómo se atenderá; si es urgente y no puede asumirla, comunicarlo a la administración." },
      { id: "c", text: "Bloquear los correos del cliente entrante para que no interrumpa." },
      { id: "d", text: "Tratar de hacer ambas tareas a ciegas sin evaluar prioridades." }
    ],
    correctAnswer: "b",
    explanation: "Recibir una solicitud no implica parar la migración. El agente confirma recepción, evalúa prioridad y si es urgente y no puede asumirla, avisa a la administración."
  },
  {
    id: "m4",
    section: "Turno de Guardia",
    question: "Si un agente participa en una migración nocturna pero no es el agente asignado a la guardia semanal, ¿qué regla aplica?",
    type: "single_choice",
    options: [
      { id: "a", text: "Pasa a ser el responsable de toda la guardia semanal y de todos los tickets del CRM." },
      { id: "b", text: "La participación en una migración NO convierte automáticamente al agente en responsable de la guardia si esta no le corresponde." },
      { id: "c", text: "Debe atender todas las llamadas telefónicas de la empresa hasta el día siguiente." },
      { id: "d", text: "Debe suspender la migración porque solo el agente de guardia puede migrar." }
    ],
    correctAnswer: "b",
    explanation: "El protocolo señala claramente: 'La participación en una migración no convierte automáticamente al agente en responsable de la guardia si esta no le corresponde'."
  },
  {
    id: "m5",
    section: "Comunicación de Avances",
    question: "¿Qué debe comunicar el agente durante el desarrollo de la migración?",
    type: "single_choice",
    options: [
      { id: "a", text: "Nada hasta que finalice por completo, sin importar cuántas horas tome." },
      { id: "b", text: "Notificar el inicio, comunicar avances relevantes, cambios en la hora estimada de finalización y cualquier dificultad o afectación no prevista." },
      { id: "c", text: "Solo debe avisar si ocurre un fallo catastrófico e irreversible." },
      { id: "d", text: "Debe enviar un mensaje cada 30 segundos sin importar si hay avances." }
    ],
    correctAnswer: "b",
    explanation: "Debe notificar a administración y cliente el inicio, avances relevantes, cambios en hora de fin y dificultades no previstas, sin esperar que se lo pidan repetidamente."
  },
  {
    id: "m6",
    section: "Prolongación y Jornada Siguiente",
    question: "Si una migración se extiende hasta la madrugada y afectará tu horario habitual de la mañana siguiente, ¿cuál es el requisito indispensable antes de asumir un cambio?",
    type: "single_choice",
    options: [
      { id: "a", text: "Apagar la alarma y decidir por cuenta propia no ir a la oficina." },
      { id: "b", text: "Notificar con anticipación a la administración y contar con la confirmación de la administración antes de asumir un cambio de horario o modalidad." },
      { id: "c", text: "Publicar un estado en redes sociales para que los compañeros se enteren." },
      { id: "d", text: "Pedirle permiso al cliente para ausentarse de FHONS." }
    ],
    correctAnswer: "b",
    explanation: "El agente debe notificar con anticipación estado y hora estimada, y contar obligatoriamente con la confirmación de la administración antes de asumir cambios."
  },
  {
    id: "m7",
    section: "Finalización",
    question: "¿Cuáles son las obligaciones del agente al concluir la migración?",
    type: "single_choice",
    options: [
      { id: "a", text: "Cerrar su laptop inmediatamente sin enviar ningún mensaje." },
      { id: "b", text: "Comunicar a administración el resultado, hora de fin y evidencias (indicando pendientes o validaciones), e informar al cliente del resultado y acciones a su cargo." },
      { id: "c", text: "Esperar a la reunión mensual de fin de año para informar del trabajo." },
      { id: "d", text: "Solo enviar un sticker por WhatsApp." }
    ],
    correctAnswer: "b",
    explanation: "Debe comunicar a la administración hora de fin, resultado, evidencias y pendientes, además de notificar al cliente del resultado y de acciones necesarias."
  },
  {
    id: "m8",
    section: "Registro en Ticket",
    question: "¿Qué información debe quedar documentada en el ticket de la migración?",
    type: "single_choice",
    options: [
      { id: "a", text: "Programación, trabajo realizado, tiempo dedicado, eventualidades, decisiones tomadas, evidencias y resultado final." },
      { id: "b", text: "Únicamente la palabra 'Migrado con éxito'." },
      { id: "c", text: "Solo el correo electrónico del cliente." },
      { id: "d", text: "No se requiere ticket si la migración fue coordinada verbalmente." }
    ],
    correctAnswer: "a",
    explanation: "El ticket debe ser exhaustivo: programación, trabajo realizado, tiempo dedicado, eventualidades surgidas, decisiones tomadas, evidencias y resultado final."
  }
];
