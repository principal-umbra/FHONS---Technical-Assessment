/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PerfilProfesionalAnswers, ActiveStep } from '../../../types';

export const INITIAL_PERFIL_ANSWERS: PerfilProfesionalAnswers = {
  cargo: '',
  queHaces: '',
  fechaIngreso: '',
  aniosExperiencia: '',

  habilidadesEspecialidades: [],
  habilidadesTexto: '',
  estudiosCertificaciones: '',
  estudiosCertificacionesList: [],
  logroProfesional: '',
  logroDetallado: {
    titulo: '',
    categoria: '',
    contextoReto: '',
    accionRealizada: '',
    impactoResultado: '',
    anio: ''
  },

  disfruteTrabajo: '',
  gustoFhons: '',
  tresPalabras: ['', '', ''],
  hobbies: '',
  talentoOculto: '',

  anecdotaDivertida: '',
  temaHoras: '',
  fraseLema: '',
  algoMas: '',
  linkedinUrl: '',
  fotoPreferencia: '',
  fotoUrl: '',
  restriccionesPrivacidad: ''
};

export interface SkillCategoryGroup {
  category: string;
  skills: string[];
}

export const SKILL_CATEGORIES_DATA: SkillCategoryGroup[] = [
  {
    category: 'Soporte & Helpdesk',
    skills: [
      'Soporte Técnico Nivel 1 & 2',
      'Atención & Mesa de Ayuda (Help Desk)',
      'Diagnóstico & Mantenimiento de Hardware',
      'Gestión de Incidentes (ITIL)',
      'Soporte Remoto & Asistencia en Sitio',
      'Capacitación a Usuarios Finales',
      'Gestión de Inventario de Activos TI'
    ]
  },
  {
    category: 'Redes & Infraestructura',
    skills: [
      'Administración de Redes (LAN / WAN / VLAN)',
      'Conmutación & Enrutamiento (Cisco / MikroTik)',
      'Cableado Estructurado & Fibra Óptica',
      'Wi-Fi Corporativo & Controladores',
      'Infraestructura TI & Servidores Físicos',
      'Comunicaciones Unificadas & VoIP',
      'Enlaces Punto a Punto & VPNs'
    ]
  },
  {
    category: 'Sistemas & Cloud',
    skills: [
      'Windows Server & Active Directory',
      'Linux (Ubuntu / Debian / RedHat)',
      'macOS & Soporte Apple',
      'Cloud Computing (AWS / Azure / GCP)',
      'Virtualización (VMware / Hyper-V / Proxmox)',
      'Gestión de Dispositivos Móviles (MDM)',
      'Copias de Seguridad & Recuperación (DRP)'
    ]
  },
  {
    category: 'Ciberseguridad & Gobernanza',
    skills: [
      'Ciberseguridad & Protección de Datos',
      'Firewalls Perimetrales (Fortinet / pfSense)',
      'Gestión de Identidades & Accesos (IAM)',
      'Antivirus Corporativo & EDR',
      'Políticas de Seguridad & Cumplimiento',
      'Análisis de Vulnerabilidades & Parcheo'
    ]
  },
  {
    category: 'Datos & Automatización',
    skills: [
      'Gestión de Bases de Datos (SQL Server / MySQL)',
      'Automatización de Procesos (PowerShell / Python / Bash)',
      'Monitoreo de Infraestructura (Zabbix / PRTG)',
      'Integración de APIs & Webhooks',
      'Business Intelligence & Reportes Dashboards',
      'Desarrollo Web & Software'
    ]
  },
  {
    category: 'Gestión & Metodologías',
    skills: [
      'Resolución Rápida de Problemas',
      'Trabajo en Equipo & Liderazgo',
      'Metodologías Ágiles (Scrum / Kanban)',
      'Gestión de Proyectos Tecnológicos',
      'Servicio & Orientación al Cliente',
      'Comunicación Asertiva'
    ]
  }
];

export const SUGGESTED_SKILLS = SKILL_CATEGORIES_DATA.flatMap((group) => group.skills);

export const TIPOS_ESTUDIO = [
  'Certificación Técnica',
  'Carrera Universitaria / Grado',
  'Maestría / Posgrado',
  'Diplomado / Especialización',
  'Curso Técnico Especializado',
  'Técnico Superior / Tecnólogo',
  'Otro'
];

export const ESTADOS_ESTUDIO = [
  'Completado / Certificado',
  'En curso',
  'En preparación / Próximo examen'
];

export const OPCIONES_ANIO_ESTUDIO = [
  'En curso',
  ...Array.from({ length: 2026 - 1980 + 1 }, (_, i) => String(2026 - i)),
  'Anterior a 1980'
];

export const OPCIONES_ANIO_LOGRO = [
  'En curso',
  ...Array.from({ length: 2026 - 1995 + 1 }, (_, i) => String(2026 - i)),
  'Anterior a 1995'
];

export const CATEGORIAS_LOGRO = [
  'Proyecto o Implementación Técnica',
  'Resolución de Incidencia o Contingencia Crítica',
  'Optimización, Automatización o Ahorro de Tiempo',
  'Soporte, Servicio y Satisfacción del Cliente',
  'Infraestructura, Redes o Migración Cloud',
  'Seguridad, Respaldo o Prevención de Riesgos',
  'Reconocimiento, Certificación o Hito Laboral',
  'Otro'
];

export const PERFIL_STEPS_METADATA: { id: ActiveStep; label: string }[] = [
  { id: 'perfil_section1', label: '1. Trayectoria y Rol en FHONS' },
  { id: 'perfil_section2', label: '2. Especialidades y Logros' },
  { id: 'perfil_section3', label: '3. Pasión, Cultura y Personalidad' },
  { id: 'perfil_section4', label: '4. Presencia Web y Privacidad' },
  { id: 'perfil_summary', label: 'Ficha Web Oficial' }
];
