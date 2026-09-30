/**
 * Documento Oficial y Preguntas Evaluativas para:
 * Proceso de Retroalimentación y Seguimiento de Incumplimientos (FHONS SRL)
 */

export interface QuizQuestion {
  id: string;
  section: string;
  question: string;
  type: 'single_choice' | 'multi_choice' | 'boolean' | 'scenario';
  options: { id: string; text: string }[];
  correctAnswer: string | string[]; // id or array of ids
  explanation: string;
}

export const MATERIAL_RETROALIMENTACION = {
  title: "Proceso de Retroalimentación y Seguimiento de Incumplimientos",
  company: "FHONS SRL",
  intro: `Este proceso tiene como objetivo comunicar las faltas de manera clara, escuchar al agente y establecer la corrección esperada. La reincidencia se evalúa mediante hechos documentados y considerando las circunstancias de cada caso. Las cuatro etapas constituyen una política interna de seguimiento. Su aplicación debe respetar las medidas disciplinarias y las condiciones de terminación previstas en el Código de Trabajo dominicano.`,
  sections: [
    {
      num: "1",
      title: "Primera retroalimentación escrita",
      badge: "Interna de Coordinación",
      content: `Ante una primera situación, se realiza una sesión privada con el agente para explicar lo ocurrido, escuchar su versión y dejar por escrito qué debe corregir.
El documento se conserva como constancia interna de coordinación y se entrega una copia al agente. En esta etapa NO se solicita su incorporación formal al expediente laboral.
Debe indicar el comportamiento esperado y cuándo se revisará su cumplimiento. Aunque su manejo sea interno, la llamada de atención debe quedar comunicada al agente.`
    },
    {
      num: "2",
      title: "Segunda retroalimentación por reincidencia",
      badge: "Incorporación a Expediente",
      content: `Cuando se produzca un nuevo incumplimiento de la misma naturaleza o directamente relacionado con la conducta previamente advertida, se realiza otra sesión y se documenta la reincidencia.
Después de la reunión, la persona responsable de impartir la retroalimentación debe enviar el documento firmado por correo a la administración o a quien gestione los expedientes, solicitando expresamente su incorporación al expediente laboral del agente.
El documento debe identificar el nuevo hecho, su relación con el antecedente y la corrección requerida. El agente recibe una copia.`
    },
    {
      num: "3",
      title: "Tercera retroalimentación y revisión de gerencia",
      badge: "Advertencia Formal Final",
      content: `Ante una nueva reincidencia, se repite la sesión, la documentación y el envío para archivo en el expediente laboral.
El caso se eleva a gerencia para valorar su gravedad y establecer una advertencia formal final, acompañada de compromisos concretos de mejora, apoyo cuando corresponda y una fecha de revisión.
La gerencia determina cómo proceder dentro de las medidas permitidas por la legislación. Esta etapa NO incluye una penalidad económica ni una sanción indeterminada.`
    },
    {
      num: "4",
      title: "Cuarta incidencia y evaluación de continuidad laboral",
      badge: "Evaluación de Continuidad",
      content: `Una cuarta incidencia relacionada se eleva a gerencia para evaluar la continuidad de la relación laboral, considerando los hechos, las evidencias, las explicaciones del agente y los antecedentes.
Cualquier terminación requiere aprobación de gerencia y revisión laboral previa para determinar la vía legal correspondiente. NO constituye una consecuencia automática del número de retroalimentaciones.`
    },
    {
      num: "Reglas",
      title: "Reglas para aplicar el proceso",
      badge: "Normas Operativas",
      content: `• Hechos nuevos: Cada etapa debe responder a un nuevo incumplimiento. Una consecuencia del incidente original no debe contarse automáticamente como otra reincidencia.
• Relación entre las faltas: Debe explicarse qué obligación o conducta vuelve a incumplirse. La referencia a una situación similar debe sustentarse en hechos concretos.
• Escucha del agente: La sesión debe permitir que el agente explique lo ocurrido. Su versión y cualquier evidencia que aporte deben quedar recogidas.
• Firma y entrega: La firma debe identificarse como constancia de recepción y conocimiento, permitiendo que el agente añada observaciones o desacuerdo. Si se niega a firmar, se documenta la entrega y la negativa, preferiblemente con un testigo. El registro y el envío para archivo continúan con esa constancia.
• Confidencialidad: La información se limita al agente y a las personas responsables de coordinación, administración, gerencia o asesoría laboral que necesiten intervenir.
• Faltas graves: Una posible causa legal de despido requiere evaluación inmediata. La secuencia no obliga a esperar cuatro incidentes para valorar una falta grave.`
    },
    {
      num: "Garantías",
      title: "Garantías y condiciones de aplicación",
      badge: "Garantías Laborales",
      content: `• Medidas formativas: El proceso se orienta a la corrección y aprendizaje mediante amonestaciones y registro de seguimiento. No contempla multas económicas ni deducciones salariales.
• Causa justificada: La acumulación de retroalimentaciones no constituye por sí sola una causa automática de despido sin la debida evaluación de pruebas y antecedentes.
• Comunicación formal: Todo proceso de seguimiento se maneja de forma respetuosa, documentada y a través de los canales institucionales correspondientes.
• Protección de derechos: Las medidas aplicadas se enmarcan siempre en el respeto a los derechos del colaborador y las normativas laborales vigentes.`
    }
  ]
};

export const QUESTIONS_RETROALIMENTACION: QuizQuestion[] = [
  {
    id: "q1",
    section: "Etapas del Proceso",
    question: "¿En cuál etapa se solicita por primera vez la incorporación formal del documento al expediente laboral del agente?",
    type: "single_choice",
    options: [
      { id: "a", text: "En la primera retroalimentación escrita, para que conste desde el inicio." },
      { id: "b", text: "En la segunda retroalimentación por reincidencia, enviándolo expresamente por correo a administración." },
      { id: "c", text: "Únicamente en la cuarta incidencia cuando se evalúa la continuidad laboral." },
      { id: "d", text: "En la tercera retroalimentación por orden directa de la gerencia." }
    ],
    correctAnswer: "b",
    explanation: "El documento de la 1ª etapa se conserva como constancia interna de coordinación y NO va al expediente. Es en la 2ª etapa donde se solicita expresamente su incorporación formal al expediente laboral."
  },
  {
    id: "q2",
    section: "Etapas del Proceso",
    question: "¿Qué ocurre si un colaborador incurre en una cuarta incidencia relacionada?",
    type: "single_choice",
    options: [
      { id: "a", text: "Se produce una terminación automática inmediata sin necesidad de reunión ni revisión previa." },
      { id: "b", text: "Se le aplica una multa salarial equivalente a los días de retraso del proyecto." },
      { id: "c", text: "Se eleva el caso a gerencia para evaluar la continuidad de la relación laboral con previa revisión formal, sin ser una consecuencia automática." },
      { id: "d", text: "Se reinicia el ciclo desde la primera retroalimentación escrita." }
    ],
    correctAnswer: "c",
    explanation: "La terminación NO es una consecuencia automática del número de retroalimentaciones; requiere aprobación de gerencia y revisión previa de hechos, pruebas y antecedentes."
  },
  {
    id: "q3",
    section: "Reglas Operativas",
    question: "Si un agente se niega a firmar el documento de retroalimentación, ¿cuál es el procedimiento correcto a seguir?",
    type: "single_choice",
    options: [
      { id: "a", text: "El proceso se anula por completo hasta que el agente decida firmar voluntariamente." },
      { id: "b", text: "Se le suspende de su jornada laboral sin goce de sueldo hasta que firme." },
      { id: "c", text: "Se documenta la entrega y la negativa a firmar (preferiblemente con un testigo), y el registro y envío continúan válidamente." },
      { id: "d", text: "Se reemplaza su firma con la de cualquier otro agente sin registrar la negativa." }
    ],
    correctAnswer: "c",
    explanation: "La firma es constancia de conocimiento y recepción. Si se niega a firmar, se deja constancia escrita de la entrega y la negativa con un testigo, continuando el trámite."
  },
  {
    id: "q4",
    section: "Reglas Operativas",
    question: "Respecto a la regla de 'Hechos Nuevos', ¿cuál afirmación es correcta?",
    type: "single_choice",
    options: [
      { id: "a", text: "Una consecuencia directa o derivada del incidente original puede computarse como otra reincidencia independiente." },
      { id: "b", text: "Cada etapa debe responder a un nuevo incumplimiento; una consecuencia del incidente original no debe contarse automáticamente como otra reincidencia." },
      { id: "c", text: "Se pueden acumular tres retroalimentaciones en la misma semana por el mismo evento original." },
      { id: "d", text: "Los hechos no necesitan sustentarse en evidencias si la coordinación lo considera evidente." }
    ],
    correctAnswer: "b",
    explanation: "El protocolo prohíbe contar las consecuencias del incidente original como reincidencias independientes. Cada etapa debe responder a un nuevo hecho comprobado."
  },
  {
    id: "q5",
    section: "Medidas y Consecuencias",
    question: "¿Contempla este proceso disciplinario interno multas económicas, descuentos salariales o suspensiones de sueldo como sanción?",
    type: "single_choice",
    options: [
      { id: "a", text: "Sí, se descuenta un porcentaje del salario según la gravedad del error." },
      { id: "b", text: "No, el proceso no contempla multas ni penalidades económicas; se basa en amonestaciones documentadas y compromisos de mejora." },
      { id: "c", text: "Solo si el cliente solicita explícitamente una penalización monetaria." },
      { id: "d", text: "Sí, previa aprobación del coordinador de área." }
    ],
    correctAnswer: "b",
    explanation: "El proceso de retroalimentación de FHONS no contempla multas económicas ni descuentos salariales como castigo; su objetivo es la corrección documentada y el seguimiento del desempeño."
  },
  {
    id: "q6",
    section: "Confidencialidad",
    question: "¿Quiénes tienen acceso a la información y documentos generados durante las sesiones de retroalimentación?",
    type: "single_choice",
    options: [
      { id: "a", text: "Todo el equipo técnico en el chat grupal para que sirva de ejemplo público." },
      { id: "b", text: "Únicamente el colaborador y las personas responsables de coordinación, administración o gerencia que necesiten intervenir." },
      { id: "c", text: "Cualquier cliente que solicite el historial de incidencias del colaborador." },
      { id: "d", text: "Es de libre consulta para todos los departamentos de la empresa." }
    ],
    correctAnswer: "b",
    explanation: "La confidencialidad es estricta: la información se limita exclusivamente al colaborador y a las personas responsables de coordinación, administración o gerencia que deban intervenir."
  },
  {
    id: "q7",
    section: "Reglas Operativas",
    question: "Si un colaborador comete una falta calificada como grave o crítica, ¿es obligatorio agotar las 4 etapas del proceso antes de evaluar medidas mayores?",
    type: "single_choice",
    options: [
      { id: "a", text: "Sí, la empresa está obligada a esperar a la 4ª etapa sin excepción." },
      { id: "b", text: "No, una situación calificada como falta grave requiere evaluación inmediata y la secuencia de 4 etapas no obliga a esperar múltiples incidentes." },
      { id: "c", text: "Solo si el cliente directo exige que se salten las etapas." },
      { id: "d", text: "Sí, pero se deben hacer las cuatro reuniones en un mismo día." }
    ],
    correctAnswer: "b",
    explanation: "El protocolo indica expresamente que una falta grave requiere evaluación inmediata y la secuencia no obliga a esperar cuatro incidentes para valorar la situación."
  },
  {
    id: "q8",
    section: "Casos Prácticos",
    question: "Caso: Un agente comete un error en un ticket por primera vez. Durante la sesión de retroalimentación, el agente presenta evidencias y explicaciones. ¿Qué debe hacer el coordinador?",
    type: "single_choice",
    options: [
      { id: "a", text: "Descartar la versión del agente porque el error ya fue reportado por el cliente." },
      { id: "b", text: "Recoger y documentar la versión del agente y sus evidencias en el documento, fijando el comportamiento esperado y la fecha de revisión." },
      { id: "c", text: "Dar por terminada la relación laboral de inmediato." },
      { id: "d", text: "Reenviar el ticket a otro compañero y no documentar nada para evitar fricción." }
    ],
    correctAnswer: "b",
    explanation: "El principio de 'Escucha del agente' exige recoger su versión y evidencias en el documento, estableciendo la corrección esperada y la fecha de revisión."
  }
];
