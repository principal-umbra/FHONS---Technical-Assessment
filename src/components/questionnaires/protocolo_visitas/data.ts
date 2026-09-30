/**
 * Documento Oficial y Preguntas Evaluativas para:
 * Protocolo de Visitas Técnicas y Trabajos Fuera de la Oficina (FHONS SRL)
 */

import { QuizQuestion } from '../proceso_retroalimentacion/data';

export const MATERIAL_VISITAS = {
  title: "Protocolo de Visitas Técnicas y Trabajos Fuera de la Oficina",
  company: "FHONS SRL",
  intro: `Este protocolo establece cómo el agente debe preparar, comunicar y documentar los trabajos realizados fuera de la oficina, así como dar continuidad a su jornada laboral.`,
  sections: [
    {
      num: "1",
      title: "Coordinación de la visita",
      badge: "Preparación Previa",
      content: `Antes de salir, el agente debe revisar el ticket y confirmar los detalles del trabajo, la fecha y la hora de la visita.
Debe verificar que cuenta con los equipos, materiales, herramientas y accesos necesarios. Cualquier duda o limitación que pueda impedir la atención debe comunicarse a coordinación antes del desplazamiento.`
    },
    {
      num: "2",
      title: "Identificación y registro del desplazamiento",
      badge: "Uniforme y Carnet",
      content: `El agente debe salir con su uniforme de trabajo y portar su carnet de identificación visible en todo momento durante la visita o el trabajo fuera de la oficina.
Debe informar cuándo sale de la oficina y cuándo llega a las instalaciones del cliente. Estos avisos permiten conocer su ubicación laboral y dejar constancia de los desplazamientos ante cualquier eventualidad relacionada con riesgos laborales.
Los retrasos o cambios que afecten la llegada deben comunicarse oportunamente a coordinación y al cliente, indicando la nueva hora estimada.`
    },
    {
      num: "3",
      title: "Impedimentos para iniciar",
      badge: "Falta de Acceso",
      content: `Si al llegar no hay personal disponible, no se permite el acceso o falta alguna condición necesaria para trabajar, el agente debe informar la situación a coordinación.
Debe mantenerse localizable mientras se determina si corresponde esperar, reprogramar o trasladarse a otro lugar. Su retiro o cambio de destino debe quedar coordinado.`
    },
    {
      num: "4",
      title: "Ejecución y comunicación",
      badge: "Alcance Acordado",
      content: `El agente debe concentrarse en el trabajo descrito en el ticket y mantenerse atento a las comunicaciones relacionadas con la visita.
Debe informar las eventualidades que afecten el alcance, la duración o la operación del cliente, así como cualquier necesidad de apoyo. La asistencia básica se documenta en el ticket; las situaciones urgentes o con impacto operativo deben comunicarse oportunamente a coordinación y al cliente.`
    },
    {
      num: "5",
      title: "Solicitudes adicionales del cliente",
      badge: "Evaluación Tripartita",
      content: `Si durante la visita el cliente presenta otra incidencia o solicita un trabajo adicional, el agente debe preguntarle primero si existe un ticket. Si no lo hay, debe solicitarle que lo cree en ese momento.
El agente debe evaluar el requerimiento considerando:
• Importancia: Qué necesidad atiende y qué consecuencias tendría dejarlo pendiente.
• Urgencia: Si requiere intervención inmediata o puede programarse.
• Impacto técnico: Qué sistemas, servicios o usuarios están afectados y qué implicaciones tendría intervenir.
Con esa evaluación, debe determinar si es prudente o necesario atenderlo durante la misma visita. Estar en las instalaciones del cliente NO implica que toda solicitud deba ejecutarse en ese momento. Escuchar con empatía y explicar la valoración con claridad.
Si implica cambios relevantes en las condiciones de la visita o recursos adicionales, debe consultar a coordinación antes de comprometer su ejecución.`
    },
    {
      num: "6",
      title: "Salida del cliente y continuidad de la jornada",
      badge: "Continuidad Laboral",
      content: `Antes de retirarse, el agente debe comunicar al cliente el resultado del trabajo y cualquier pendiente. También debe informar a coordinación su salida y si la tarea fue completada o quedó alguna situación por resolver.
Cuando aún quede tiempo de su jornada, debe regresar a la oficina o continuar con la asignación que indique coordinación. La finalización de la visita NO implica el cierre de la jornada ni autoriza por sí sola a continuar desde casa.`
    },
    {
      num: "7",
      title: "Extensión del trabajo",
      badge: "Horario Regular",
      content: `Si la visita se prolonga más de lo previsto o puede superar su horario regular, el agente debe comunicarlo tan pronto identifique esa posibilidad, indicando el estado del trabajo y qué falta por realizar.
Coordinación determinará cómo continuar. Si la extensión puede afectar su incorporación al día siguiente, debe informarlo con anticipación.`
    },
    {
      num: "8",
      title: "Registro y documentación",
      badge: "Traslado de Equipos",
      content: `El agente debe documentar en el ticket las actividades realizadas, el tiempo dedicado, el resultado, las eventualidades y los pendientes. Los requerimientos adicionales deben quedar registrados en sus respectivos tickets.
Debe adjuntar las evidencias y elaborar un informe cuando el caso lo requiera. Si entrega o retira equipos o materiales, debe dejar constancia de qué se trasladó, quién lo entregó o recibió y su destino.`
    }
  ]
};

export const QUESTIONS_VISITAS: QuizQuestion[] = [
  {
    id: "v1",
    section: "Preparación y Coordinación",
    question: "¿Qué debe verificar el agente antes de salir de la oficina hacia las instalaciones de un cliente?",
    type: "single_choice",
    options: [
      { id: "a", text: "Solo debe verificar que la batería de su celular personal esté cargada." },
      { id: "b", text: "Revisar el ticket, confirmar detalles, fecha y hora de la visita, y verificar que cuenta con equipos, materiales, herramientas y accesos necesarios." },
      { id: "c", text: "Esperar a llegar al cliente para ver qué herramientas y cables hacen falta." },
      { id: "d", text: "No necesita verificar nada porque el cliente debe suministrar todas las herramientas." }
    ],
    correctAnswer: "b",
    explanation: "El agente debe revisar el ticket, confirmar fecha y hora, y verificar de antemano que cuenta con equipos, materiales, herramientas y accesos necesarios."
  },
  {
    id: "v2",
    section: "Identificación y Riesgos Laborales",
    question: "¿Por qué es obligatorio portar uniforme, carnet visible e informar la salida de la oficina y la llegada al cliente?",
    type: "single_choice",
    options: [
      { id: "a", text: "Para saber la ubicación laboral del agente y dejar constancia de los desplazamientos ante riesgos laborales y seguridad corporativa." },
      { id: "b", text: "Solo para fines publicitarios de la marca FHONS en la calle." },
      { id: "c", text: "Es un requisito opcional que solo aplica para visitas a clientes gubernamentales." },
      { id: "d", text: "Para que el cliente no le solicite credenciales de acceso." }
    ],
    correctAnswer: "a",
    explanation: "El uniforme y carnet visible identifican al agente. Informar salida y llegada permite conocer su ubicación laboral y deja constancia ante riesgos laborales y seguridad."
  },
  {
    id: "v3",
    section: "Impedimentos de Acceso",
    question: "Si al llegar a las instalaciones del cliente no hay personal disponible o no le permiten el acceso, ¿cuál es el paso a seguir?",
    type: "single_choice",
    options: [
      { id: "a", text: "Regresar de inmediato a casa sin avisar a nadie." },
      { id: "b", text: "Informar la situación a coordinación y mantenerse localizable mientras se determina si corresponde esperar, reprogramar o trasladarse." },
      { id: "c", text: "Forzar el acceso a las instalaciones por cuenta propia." },
      { id: "d", text: "Cerrar el ticket de inmediato como 'Cancelado por el cliente'." }
    ],
    correctAnswer: "b",
    explanation: "Debe avisar a coordinación de la falta de acceso y mantenerse localizable mientras se define si espera, reprograma o se mueve a otro destino."
  },
  {
    id: "v4",
    section: "Solicitudes Adicionales del Cliente",
    question: "Si durante la visita el cliente solicita un trabajo adicional que no estaba en el ticket original, ¿cuál es el primer paso obligatorio?",
    type: "single_choice",
    options: [
      { id: "a", text: "Realizar el trabajo de inmediato sin importar si está registrado." },
      { id: "b", text: "Preguntarle primero si existe un ticket; si no lo hay, solicitarle amablemente que lo cree en ese momento." },
      { id: "c", text: "Rechazar de forma grosera al cliente diciéndole que no es su problema." },
      { id: "d", text: "Pedirle dinero en efectivo para realizar el trabajo adicional." }
    ],
    correctAnswer: "b",
    explanation: "El protocolo indica: 'El agente debe preguntarle primero si existe un ticket. Si no lo hay, debe solicitarle que lo cree en ese momento'."
  },
  {
    id: "v5",
    section: "Evaluación de Requerimientos Adicionales",
    question: "¿Bajo cuáles tres criterios debe evaluar el agente un requerimiento imprevisto antes de decidir si lo atiende?",
    type: "single_choice",
    options: [
      { id: "a", text: "Importancia, Urgencia e Impacto técnico." },
      { id: "b", text: "Costo financiero, amistad con el usuario y clima del día." },
      { id: "c", text: "Velocidad de internet, marca de la computadora y hora de almuerzo." },
      { id: "d", text: "Únicamente si el cliente insiste enérgicamente." }
    ],
    correctAnswer: "a",
    explanation: "Debe evaluar: 1) Importancia (consecuencias de dejarlo pendiente), 2) Urgencia (si requiere acción inmediata o se programa), y 3) Impacto técnico (sistemas/usuarios afectados)."
  },
  {
    id: "v6",
    section: "Continuidad de la Jornada Laboral",
    question: "Al terminar la visita en el cliente a las 2:00 p. m., si la jornada del agente culmina a las 6:00 p. m., ¿qué debe hacer?",
    type: "single_choice",
    options: [
      { id: "a", text: "Irse a su casa a descansar porque ya completó la visita técnica asignada." },
      { id: "b", text: "Informar su salida a coordinación y regresar a la oficina o continuar con la asignación que indique coordinación, ya que la salida no autoriza irse a casa." },
      { id: "c", text: "Quedarse en las instalaciones del cliente conversando hasta las 6:00 p. m." },
      { id: "d", text: "Desconectarse de los canales de la empresa." }
    ],
    correctAnswer: "b",
    explanation: "La finalización de la visita no implica el cierre de la jornada ni autoriza a continuar desde casa. Debe regresar a la oficina o seguir las instrucciones de coordinación."
  },
  {
    id: "v7",
    section: "Traslado de Equipos y Materiales",
    question: "Si durante la visita el agente entrega o retira equipos o materiales del cliente (ej. un servidor o switch), ¿qué constancia debe dejar?",
    type: "single_choice",
    options: [
      { id: "a", text: "No es necesaria constancia escrita si el cliente lo vio personalmente." },
      { id: "b", text: "Dejar constancia detallada en el ticket de qué se trasladó, quién lo entregó o recibió formalmente y su destino." },
      { id: "c", text: "Solo guardar el equipo en el baúl del vehículo sin registrar nada." },
      { id: "d", text: "Esperar a fin de año para reportar los equipos que se movieron." }
    ],
    correctAnswer: "b",
    explanation: "Si entrega o retira equipos o materiales, debe dejar constancia explícita de qué se trasladó, quién lo entregó o recibió y su destino."
  },
  {
    id: "v8",
    section: "Extensión del Trabajo Fuera de Horario",
    question: "Si la visita técnica se complica y el trabajo superará el horario laboral habitual, ¿en qué momento debe comunicarse a coordinación?",
    type: "single_choice",
    options: [
      { id: "a", text: "Tan pronto identifique esa posibilidad, indicando el estado del trabajo y qué falta por realizar para que coordinación determine cómo proceder." },
      { id: "b", text: "Al día siguiente en la tarde mediante un correo breve." },
      { id: "c", text: "Nunca, el agente debe quedarse trabajando indefinidamente sin avisar." },
      { id: "d", text: "Solo si el cliente decide invitarle la cena." }
    ],
    correctAnswer: "a",
    explanation: "Debe comunicarlo tan pronto identifique la posibilidad de prolongación, indicando estado del caso y qué falta para que coordinación determine las acciones."
  }
];
