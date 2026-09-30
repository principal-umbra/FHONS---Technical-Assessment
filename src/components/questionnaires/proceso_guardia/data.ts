/**
 * Documento Oficial y Preguntas Evaluativas para:
 * Proceso de Guardia de FHONS
 */

import { QuizQuestion } from '../proceso_retroalimentacion/data';

export const MATERIAL_GUARDIA = {
  title: "Proceso de Guardia de FHONS",
  company: "FHONS SRL",
  intro: `La guardia tiene como objetivo asegurar la atención y el seguimiento de los requerimientos fuera del horario habitual de oficina. Este procedimiento establece las responsabilidades del agente asignado y la comunicación necesaria con el cliente y la administración.`,
  sections: [
    {
      num: "1",
      title: "Asignación y horario",
      badge: "Rotación Semanal",
      content: `La guardia se asigna a un agente del equipo técnico los lunes por la mañana, mediante rotación semanal. La responsabilidad del agente anterior termina en el momento en que se asigna al siguiente.
Durante su jornada regular, el agente cumple sus funciones habituales. Al finalizar, inicia el horario de guardia hasta las 11:00 p. m. Los fines de semana y días feriados, cubre tanto el horario regular que le corresponde como el período de guardia.`
    },
    {
      num: "2",
      title: "Disponibilidad y atención",
      badge: "Modalidad Remota",
      content: `La guardia se realiza habitualmente de forma remota. El agente debe mantenerse operativo, con equipo, conexión y accesos funcionales, y permanecer atento a los chats, correos, alertas, notificaciones y al CRM.
Debe mantener su trabajo asignado en orden y recibir los requerimientos que surjan, organizando su atención según la urgencia y el impacto. Cualquier eventualidad que limite su disponibilidad o capacidad de atención debe comunicarse a la administración.`
    },
    {
      num: "3",
      title: "Prioridades y comunicación de incidencias",
      badge: "Gestión de Emergencias",
      content: `Las situaciones urgentes o que afecten la operación de FHONS o del cliente deben comunicarse al cliente y a la administración, indicando el inicio de la atención, las eventualidades relevantes y su finalización. La asistencia básica se documenta en el ticket, sin requerir un aviso separado por cada etapa.
Si el agente está atendiendo otra situación, debe confirmar que recibió el nuevo requerimiento e informar que lo trabajará a la brevedad posible, según su prioridad.
Cuando la carga de trabajo o una emergencia le impidan atender una incidencia con la urgencia que requiere, debe informar a la administración qué está trabajando y qué necesita atención, para que esta determine cómo proceder.`
    },
    {
      num: "4",
      title: "Registro y organización del CRM",
      badge: "Documentación Obligatoria",
      content: `Toda atención debe quedar documentada en un ticket. Si el requerimiento llega por otro medio y no tiene uno, el agente debe crearlo.
Los registros deben reflejar las acciones realizadas, el estado del caso y los próximos pasos. El agente debe mantener el CRM organizado, revisar los tickets nuevos o sin asignar y gestionar su atención o asignación. Cuando el caso lo amerite, debe elaborar el informe correspondiente.`
    },
    {
      num: "5",
      title: "Trabajos programados y prolongación de la jornada",
      badge: "Notificación Anticipada",
      content: `Los trabajos programados, como las migraciones, que se realicen durante la guardia o se extiendan más allá de su horario deben comunicarse a la administración al iniciar, durante sus avances relevantes y al finalizar, incluyendo la evidencia correspondiente. El cliente debe mantenerse informado según lo requiera el trabajo.
Si la intervención se prolonga o presenta alguna eventualidad que pueda afectar la incorporación del agente a su horario regular del día siguiente, debe notificarlo con anticipación a la administración, tan pronto identifique esa posibilidad, para dejar constancia y permitir que se coordinen los ajustes necesarios.`
    }
  ]
};

export const QUESTIONS_GUARDIA: QuizQuestion[] = [
  {
    id: "g1",
    section: "Asignación y Horarios",
    question: "¿En qué momento se asigna la guardia y cuándo finaliza formalmente la responsabilidad del agente anterior?",
    type: "single_choice",
    options: [
      { id: "a", text: "Se asigna los viernes a las 5:00 p. m. y el agente anterior termina el domingo en la noche." },
      { id: "b", text: "Se asigna los lunes por la mañana mediante rotación semanal, y la responsabilidad del agente anterior termina en el momento en que se asigna al siguiente." },
      { id: "c", text: "Se asigna diariamente de forma aleatoria mediante un sorteo en el chat grupal." },
      { id: "d", text: "La guardia es permanente y no tiene rotación entre los miembros del equipo." }
    ],
    correctAnswer: "b",
    explanation: "La guardia se asigna a un agente del equipo técnico los lunes por la mañana mediante rotación semanal, terminando la responsabilidad del anterior cuando se asigna al siguiente."
  },
  {
    id: "g2",
    section: "Asignación y Horarios",
    question: "¿Hasta qué hora se extiende el horario de guardia en días laborales y cómo opera los fines de semana y feriados?",
    type: "single_choice",
    options: [
      { id: "a", text: "En días laborales hasta las 11:00 p. m.; y en fines de semana/feriados cubre tanto el horario regular que le corresponde como el período de guardia." },
      { id: "b", text: "Termina a las 7:00 p. m. y los fines de semana no hay guardia activa." },
      { id: "c", text: "Es de 24 horas continuas sin interrupción durante 30 días seguidos." },
      { id: "d", text: "Termina a medianoche en días laborables y en feriados se suspende la atención." }
    ],
    correctAnswer: "a",
    explanation: "Al finalizar su jornada regular, el horario de guardia se extiende hasta las 11:00 p. m. Fines de semana y feriados, cubre tanto el horario regular como el período de guardia."
  },
  {
    id: "g3",
    section: "Disponibilidad y Canales",
    question: "¿A cuáles canales debe permanecer atento el agente durante su turno de guardia remota?",
    type: "single_choice",
    options: [
      { id: "a", text: "Únicamente a su teléfono personal por llamadas de voz." },
      { id: "b", text: "A los chats, correos, alertas, notificaciones del sistema y al CRM de FHONS." },
      { id: "c", text: "Solo a las notificaciones que el cliente envíe por redes sociales." },
      { id: "d", text: "A revisar el CRM una sola vez al día a las 10:55 p. m." }
    ],
    correctAnswer: "b",
    explanation: "El agente debe mantenerse con equipo y accesos funcionales, atento a chats, correos, alertas, notificaciones y al CRM."
  },
  {
    id: "g4",
    section: "Prioridades y Gestión de Concurrencia",
    question: "Si el agente está atendiendo un caso y entra una nueva solicitud urgente, ¿cuál es el procedimiento indicado?",
    type: "single_choice",
    options: [
      { id: "a", text: "Ignorar la nueva solicitud hasta terminar la primera, sin acusar recibo." },
      { id: "b", text: "Confirmar que recibió el nuevo requerimiento e informar que lo trabajará a la brevedad según su prioridad; si la carga o emergencia excede su capacidad, informar de inmediato a la administración." },
      { id: "c", text: "Abandonar el caso previo sin guardar cambios ni documentar." },
      { id: "d", text: "Pedirle al cliente que llame directamente al director general de FHONS." }
    ],
    correctAnswer: "b",
    explanation: "Debe confirmar recepción de inmediato e informar prioridad. Si la carga le impide atender con la debida urgencia, debe informar a la administración para determinar el apoyo."
  },
  {
    id: "g5",
    section: "Registro en CRM",
    question: "Si un cliente solicita asistencia durante la guardia a través de WhatsApp o llamada telefónica sin existir un ticket previo, ¿qué debe hacer el agente?",
    type: "single_choice",
    options: [
      { id: "a", text: "Atenderlo y no registrar nada porque la guardia es informal." },
      { id: "b", text: "Crear el ticket en el CRM documentando la solicitud, acciones realizadas, estado y próximos pasos." },
      { id: "c", text: "Rechazar la llamada y decirle al cliente que solo se atiende en horario regular de oficina." },
      { id: "d", text: "Esperar al lunes por la mañana para que el coordinador cree el ticket." }
    ],
    correctAnswer: "b",
    explanation: "Toda atención debe quedar documentada en un ticket. Si llega por otro medio y no tiene uno, el agente debe crearlo inmediatamente en el CRM."
  },
  {
    id: "g6",
    section: "Trabajos Programados y Jornada Siguiente",
    question: "Si una intervención o migración durante la guardia se prolonga y puede afectar la incorporación del agente a su horario habitual del día siguiente, ¿qué exige el protocolo?",
    type: "single_choice",
    options: [
      { id: "a", text: "Tomarse el día libre al día siguiente sin avisar a nadie." },
      { id: "b", text: "Notificarlo con anticipación a la administración tan pronto identifique esa posibilidad, para que se coordinen y confirmen los ajustes necesarios." },
      { id: "c", text: "Desconectarse a las 11:00 p. m. en punto aunque la migración del cliente quede a medio proceso." },
      { id: "d", text: "Notificar a los clientes que la empresa no laborará al día siguiente." }
    ],
    correctAnswer: "b",
    explanation: "Debe notificar con anticipación a la administración tan pronto identifique la posibilidad de prolongación, para dejar constancia y permitir la coordinación de ajustes."
  },
  {
    id: "g7",
    section: "Comunicación de Incidencias",
    question: "¿En qué situaciones se debe comunicar tanto al cliente como a la administración el inicio, eventualidades y finalización de la atención?",
    type: "single_choice",
    options: [
      { id: "a", text: "En situaciones urgentes o que afecten la operación de FHONS o del cliente." },
      { id: "b", text: "En absolutamente todas las consultas, incluso las preguntas triviales o cambios de contraseña." },
      { id: "c", text: "Únicamente si el cliente es una entidad gubernamental." },
      { id: "d", text: "Solo cuando la guardia se realiza en días feriados." }
    ],
    correctAnswer: "a",
    explanation: "Las situaciones urgentes o que afecten la operación de FHONS o del cliente requieren comunicación al cliente y a administración al iniciar, durante eventualidades y al finalizar."
  },
  {
    id: "g8",
    section: "Gestión Operativa del CRM",
    question: "Además de sus casos asignados, ¿qué responsabilidad tiene el agente de guardia respecto a los tickets nuevos del CRM?",
    type: "single_choice",
    options: [
      { id: "a", text: "Mantener el CRM organizado, revisar los tickets nuevos o sin asignar y gestionar su atención o asignación oportuna." },
      { id: "b", text: "Eliminar los tickets sin asignar para mantener la bandeja en cero." },
      { id: "c", text: "Cerrar los tickets automáticamente con un mensaje predeterminado." },
      { id: "d", text: "No debe abrir el CRM para no alterar las métricas de la semana." }
    ],
    correctAnswer: "a",
    explanation: "El agente debe mantener el CRM organizado, revisar los tickets nuevos o sin asignar y gestionar su atención o asignación correspondiente."
  }
];
