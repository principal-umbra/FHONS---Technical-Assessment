/**
 * Documento Oficial y Preguntas Evaluativas para:
 * Protocolo de Responsabilidad y Seguimiento de Tickets (FHONS SRL)
 */

import { QuizQuestion } from '../proceso_retroalimentacion/data';

export const MATERIAL_TICKETS = {
  title: "Protocolo de Responsabilidad y Seguimiento de Tickets",
  company: "FHONS SRL",
  intro: `El agente que tiene un ticket asignado es responsable de mantenerlo atendido, actualizado y con seguimiento hasta su cierre o reasignación. Esto incluye tanto el trabajo técnico como la comunicación necesaria para que el caso avance.`,
  sections: [
    {
      num: "1",
      title: "Responsabilidad del agente asignado",
      badge: "Ownership Total",
      content: `El agente debe conocer el estado de sus tickets, identificar qué falta por realizar y dar seguimiento a los compromisos pendientes. Debe mantener informado al cliente sin depender de que RR le recuerde responder o consulte el estado del caso.`
    },
    {
      num: "2",
      title: "Comunicación y seguimiento",
      badge: "Tickets en Espera",
      content: `El agente asignado debe responder los correos y consultas relacionados con sus tickets, comunicar los avances y solicitar la información necesaria para continuar.
Cuando un caso dependa del cliente, de un proveedor o de otro compañero, debe mantenerse pendiente de esa respuesta y dar seguimiento. Dejar el ticket en espera NO elimina su responsabilidad sobre el caso.`
    },
    {
      num: "3",
      title: "Apoyo de coordinación",
      badge: "Rol de RR",
      content: `RR puede intervenir para orientar, apoyar o atender una situación que requiera coordinación. Esa participación NO sustituye el seguimiento que corresponde al agente.
Si RR responde un correo o realiza una gestión, el agente debe revisar lo comunicado, incorporar cualquier compromiso a su seguimiento y continuar con la atención. La intervención de RR NO transfiere automáticamente la responsabilidad del ticket.`
    },
    {
      num: "4",
      title: "Impedimentos y reasignación",
      badge: "Reglas de Reasignación",
      content: `Si el agente necesita apoyo o no puede continuar atendiendo el caso, debe comunicarlo oportunamente, indicando el estado, la dificultad y lo que necesita para avanzar.
Cualquier cambio de responsable debe quedar confirmado y reflejado en el CRM. Solicitar ayuda o incluir a otro compañero en un correo NO equivale a reasignar el ticket.`
    },
    {
      num: "5",
      title: "Actualización y cierre",
      badge: "Documentación Final",
      content: `El ticket debe reflejar las gestiones realizadas, las respuestas relevantes, los pendientes y la próxima acción. Antes de cerrarlo, el agente debe documentar el resultado y comunicarlo al cliente.
La asignación identifica a quien debe impulsar el caso hasta su resolución. Un seguimiento constante evita que el cliente quede esperando, que se dupliquen gestiones y que coordinación tenga que asumir la comunicación habitual de los tickets del equipo.`
    }
  ]
};

export const QUESTIONS_TICKETS: QuizQuestion[] = [
  {
    id: "t1",
    section: "Responsabilidad del Agente",
    question: "Según el protocolo, ¿de quién es la responsabilidad de impulsar el avance del ticket y mantener informado al cliente?",
    type: "single_choice",
    options: [
      { id: "a", text: "De coordinación (RR), quien debe enviar recordatorios diarios al agente." },
      { id: "b", text: "Del agente asignado, quien debe conocer el estado del caso y dar seguimiento sin depender de que RR le recuerde." },
      { id: "c", text: "Del cliente, ya que si no llama se asume que todo funciona correctamente." },
      { id: "d", text: "Del técnico que creó el ticket originalmente en el sistema." }
    ],
    correctAnswer: "b",
    explanation: "El agente asignado es el único responsable de impulsar el ticket y mantener informado al cliente sin depender de recordatorios de RR."
  },
  {
    id: "t2",
    section: "Tickets en Espera de Terceros",
    question: "Cuando un ticket queda en espera de una respuesta del cliente, un proveedor o un compañero, ¿qué sucede con la responsabilidad del agente?",
    type: "single_choice",
    options: [
      { id: "a", text: "La responsabilidad se suspende por completo y el agente puede desentenderse del caso." },
      { id: "b", text: "Dejar el ticket en espera NO elimina la responsabilidad; el agente debe mantenerse pendiente de esa respuesta y dar el seguimiento oportuno." },
      { id: "c", text: "El ticket debe ser cerrado de inmediato como 'Abandonado por el cliente'." },
      { id: "d", text: "Pasa automáticamente a ser responsabilidad del proveedor externo." }
    ],
    correctAnswer: "b",
    explanation: "El texto es explícito: 'Dejar el ticket en espera no elimina su responsabilidad sobre el caso'. El agente debe monitorear y dar seguimiento a la respuesta pendiente."
  },
  {
    id: "t3",
    section: "Intervención de Coordinación (RR)",
    question: "Si RR interviene en un ticket para responder un correo o apoyar con una gestión, ¿qué debe hacer el agente asignado?",
    type: "single_choice",
    options: [
      { id: "a", text: "Asumir que RR ahora es el dueño del caso y borrar el ticket de sus tareas." },
      { id: "b", text: "Revisar lo comunicado por RR, incorporar cualquier compromiso a su seguimiento y continuar con la atención, ya que la intervención de RR no transfiere la responsabilidad." },
      { id: "c", text: "Reclamar a RR por interferir en su ticket." },
      { id: "d", text: "Cerrar el ticket inmediatamente sin confirmación." }
    ],
    correctAnswer: "b",
    explanation: "La participación de RR no sustituye el seguimiento del agente ni transfiere la responsabilidad. El agente debe revisar, incorporar compromisos y continuar la atención."
  },
  {
    id: "t4",
    section: "Impedimentos y Reasignación",
    question: "Si necesitas apoyo de otro compañero y lo copias en un correo del ticket, ¿queda reasignado el ticket a ese compañero?",
    type: "single_choice",
    options: [
      { id: "a", text: "Sí, copiar a alguien en un correo transfiere legalmente la propiedad del caso." },
      { id: "b", text: "No. Solicitar ayuda o incluir a otro compañero en un correo NO equivale a reasignar el ticket; cualquier cambio debe confirmarse y reflejarse en el CRM." },
      { id: "c", text: "Solo si el compañero tiene mayor rango laboral en la empresa." },
      { id: "d", text: "Sí, si el cliente responde directamente al compañero copiado." }
    ],
    correctAnswer: "b",
    explanation: "El protocolo indica taxativamente: 'Solicitar ayuda o incluir a otro compañero en un correo no equivale a reasignar el ticket. Cualquier cambio debe quedar confirmado y reflejado en el CRM'."
  },
  {
    id: "t5",
    section: "Actualización del Caso",
    question: "¿Qué elementos mínimos debe reflejar la bitácora o historial de un ticket activo en el CRM?",
    type: "single_choice",
    options: [
      { id: "a", text: "Únicamente la fecha de apertura y la fecha estimada de cierre." },
      { id: "b", text: "Las gestiones realizadas, respuestas relevantes recibidas, pendientes actuales y la próxima acción programada." },
      { id: "c", text: "Solo una captura de pantalla del error técnico reportado." },
      { id: "d", text: "Ninguno, siempre que el agente lo recuerde mentalmente." }
    ],
    correctAnswer: "b",
    explanation: "El ticket debe reflejar con claridad: gestiones realizadas, respuestas relevantes, pendientes y cuál es la próxima acción a ejecutar."
  },
  {
    id: "t6",
    section: "Procedimiento de Cierre",
    question: "Antes de cerrar formalmente un ticket en el CRM, ¿qué dos pasos son de estricto cumplimiento para el agente?",
    type: "single_choice",
    options: [
      { id: "a", text: "Documentar el resultado alcanzado y comunicarlo formalmente al cliente." },
      { id: "b", text: "Cambiar el estado a cerrado sin escribir nada para ahorrar tiempo." },
      { id: "c", text: "Pedirle a RR que llame al cliente para redactar el cierre." },
      { id: "d", text: "Esperar 30 días calendario sin realizar ninguna acción." }
    ],
    correctAnswer: "a",
    explanation: "Antes de cerrar el caso, el agente debe documentar en el ticket el resultado obtenido y comunicarlo debidamente al cliente."
  },
  {
    id: "t7",
    section: "Casos Prácticos",
    question: "Caso: Un agente se encuentra con una dificultad técnica que le impide avanzar con un ticket urgente. ¿Cómo debe proceder según el protocolo?",
    type: "single_choice",
    options: [
      { id: "a", text: "Ocultar el problema y esperar a que el cliente se queje con gerencia." },
      { id: "b", text: "Comunicarlo oportunamente a coordinación, indicando el estado del caso, la dificultad encontrada y lo que necesita con exactitud para avanzar." },
      { id: "c", text: "Cerrar el ticket y pedirle al cliente que abra uno nuevo la próxima semana." },
      { id: "d", text: "Dejar de responder al cliente hasta que la dificultad se resuelva por sí sola." }
    ],
    correctAnswer: "b",
    explanation: "Debe comunicarlo oportunamente indicando tres aspectos: estado del caso, la dificultad y exactamente qué requiere para continuar."
  },
  {
    id: "t8",
    section: "Propósito del Protocolo",
    question: "¿Cuál es el beneficio primordial de mantener un seguimiento constante y ownership del ticket?",
    type: "single_choice",
    options: [
      { id: "a", text: "Evita que el cliente quede esperando, que se dupliquen gestiones y que coordinación tenga que asumir la comunicación habitual de los tickets del equipo." },
      { id: "b", text: "Permite que los agentes tengan menos trabajo asignado." },
      { id: "c", text: "Garantiza que no se use el CRM durante los fines de semana." },
      { id: "d", text: "Permite transferir todas las llamadas al proveedor de internet." }
    ],
    correctAnswer: "a",
    explanation: "Un seguimiento constante evita que el cliente espere sin respuesta, previene duplicidad de gestiones y evita sobrecargar a coordinación con comunicaciones rutinarias."
  }
];
