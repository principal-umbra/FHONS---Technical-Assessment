/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PerfilProfesionalAnswers, EstudioCertificacionItem, LogroProfesionalDetalle } from '../../../types';
import { 
  SKILL_CATEGORIES_DATA, 
  TIPOS_ESTUDIO, 
  ESTADOS_ESTUDIO, 
  CATEGORIAS_LOGRO,
  OPCIONES_ANIO_ESTUDIO,
  OPCIONES_ANIO_LOGRO
} from './data';
import { 
  Sparkles, 
  GraduationCap, 
  Trophy, 
  Plus, 
  X, 
  Check, 
  Search, 
  Trash2, 
  Award, 
  BookOpen, 
  Building2, 
  Calendar, 
  Target, 
  Zap, 
  CheckCircle2,
  Filter,
  Lightbulb
} from 'lucide-react';

interface SectionHabilidadesLogrosProps {
  answers: PerfilProfesionalAnswers;
  onChange: (updatedAnswers: PerfilProfesionalAnswers) => void;
}

export default function SectionHabilidadesLogros({ answers, onChange }: SectionHabilidadesLogrosProps) {
  // State for Skills
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [customSkillInput, setCustomSkillInput] = useState('');

  // State for new Study / Certification form
  const [newTipo, setNewTipo] = useState(TIPOS_ESTUDIO[0]);
  const [newTitulo, setNewTitulo] = useState('');
  const [newInstitucion, setNewInstitucion] = useState('');
  const [newAnio, setNewAnio] = useState('2026');
  const [newEstado, setNewEstado] = useState(ESTADOS_ESTUDIO[0]);
  const [showAddStudyForm, setShowAddStudyForm] = useState(false);

  // -------------------------------------------------------------
  // SKILLS LOGIC
  // -------------------------------------------------------------
  const allCategorizedSkills = useMemo(() => {
    return SKILL_CATEGORIES_DATA;
  }, []);

  const filteredSkills = useMemo(() => {
    const q = skillSearchQuery.trim().toLowerCase();
    let pool = allCategorizedSkills;
    if (selectedCategory !== 'Todas') {
      pool = pool.filter((g) => g.category === selectedCategory);
    }
    const flatList = pool.flatMap((g) => g.skills);
    if (!q) return flatList;
    return flatList.filter((s) => s.toLowerCase().includes(q));
  }, [allCategorizedSkills, selectedCategory, skillSearchQuery]);

  const toggleSkill = (skill: string) => {
    const current = answers.habilidadesEspecialidades || [];
    if (current.includes(skill)) {
      onChange({
        ...answers,
        habilidadesEspecialidades: current.filter((s) => s !== skill)
      });
    } else {
      onChange({
        ...answers,
        habilidadesEspecialidades: [...current, skill]
      });
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    const current = answers.habilidadesEspecialidades || [];
    if (!current.includes(trimmed)) {
      onChange({
        ...answers,
        habilidadesEspecialidades: [...current, trimmed]
      });
    }
    setCustomSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    onChange({
      ...answers,
      habilidadesEspecialidades: (answers.habilidadesEspecialidades || []).filter((s) => s !== skillToRemove)
    });
  };

  // -------------------------------------------------------------
  // ESTUDIOS Y CERTIFICACIONES DINÁMICOS
  // -------------------------------------------------------------
  const estudiosList: EstudioCertificacionItem[] = answers.estudiosCertificacionesList || [];

  const syncEstudiosToAnswers = (newList: EstudioCertificacionItem[]) => {
    const serializedText = newList
      .map(
        (item) =>
          `• ${item.titulo} — ${item.institucion} (${item.anio || 'Año no especificado'}) [${item.tipo}] - ${item.estado || 'Completado'}`
      )
      .join('\n');

    onChange({
      ...answers,
      estudiosCertificacionesList: newList,
      estudiosCertificaciones: serializedText
    });
  };

  const handleAddStudyItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo.trim()) return;

    const newItem: EstudioCertificacionItem = {
      id: 'estudio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo: newTipo,
      titulo: newTitulo.trim(),
      institucion: newInstitucion.trim() || 'No especificada',
      anio: newAnio || 'En curso',
      estado: newAnio === 'En curso' ? 'En curso' : newEstado
    };

    const updatedList = [...estudiosList, newItem];
    syncEstudiosToAnswers(updatedList);

    // Reset input fields
    setNewTitulo('');
    setNewInstitucion('');
    setNewAnio('2026');
    setShowAddStudyForm(false);
  };

  const handleRemoveStudyItem = (idToRemove: string) => {
    const updatedList = estudiosList.filter((item) => item.id !== idToRemove);
    syncEstudiosToAnswers(updatedList);
  };

  // -------------------------------------------------------------
  // LOGRO PROFESIONAL PRÁCTICO Y CONTEXTUAL
  // -------------------------------------------------------------
  const logro: LogroProfesionalDetalle = answers.logroDetallado || {
    titulo: '',
    categoria: '',
    anio: '',
    descripcion: answers.logroProfesional || '',
    impacto: ''
  };

  const handleLogroFieldChange = (field: keyof LogroProfesionalDetalle, value: string) => {
    const updatedLogro: LogroProfesionalDetalle = {
      ...logro,
      [field]: value
    };

    // Serialize to clean text for reports and backwards compatibility
    const parts: string[] = [];
    if (updatedLogro.titulo) parts.push(`• Logro: ${updatedLogro.titulo}`);
    if (updatedLogro.categoria) parts.push(`• Tipo: ${updatedLogro.categoria}`);
    if (updatedLogro.anio) parts.push(`• Período: ${updatedLogro.anio}`);
    if (updatedLogro.descripcion) parts.push(`• Detalle: ${updatedLogro.descripcion}`);
    if (updatedLogro.impacto) parts.push(`• Impacto: ${updatedLogro.impacto}`);
    
    // Support legacy sub-fields if present
    if (!updatedLogro.descripcion && updatedLogro.contextoReto) parts.push(`• Desafío: ${updatedLogro.contextoReto}`);
    if (!updatedLogro.descripcion && updatedLogro.accionRealizada) parts.push(`• Solución: ${updatedLogro.accionRealizada}`);
    if (!updatedLogro.impacto && updatedLogro.impactoResultado) parts.push(`• Resultado: ${updatedLogro.impactoResultado}`);

    const combinedText = parts.length > 0 ? parts.join('\n') : value;

    onChange({
      ...answers,
      logroDetallado: updatedLogro,
      logroProfesional: combinedText
    });
  };

  return (
    <div className="space-y-8" id="section-habilidades-logros">
      {/* ========================================================= */}
      {/* 4. HABILIDADES Y ESPECIALIDADES (CON BUSCADOR Y CATEGORÍAS) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-display">
                4. Habilidades y Especialidades Principales
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                Obligatoria
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Selecciona o busca las tecnologías y competencias en las que destacas, o escribe tus propias habilidades.
            </p>
          </div>
        </div>

        {/* Selected skills badges */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              Habilidades seleccionadas ({answers.habilidadesEspecialidades?.length || 0})
            </label>
            {(answers.habilidadesEspecialidades?.length || 0) > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...answers, habilidadesEspecialidades: [] })}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer font-medium"
              >
                Limpiar selección
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[48px] p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            {(!answers.habilidadesEspecialidades || answers.habilidadesEspecialidades.length === 0) && (
              <span className="text-xs text-slate-400 italic py-1 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-slate-300" />
                Ninguna seleccionada aún. Utiliza el buscador o las categorías a continuación.
              </span>
            )}
            {answers.habilidadesEspecialidades?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xs animate-in fade-in"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="p-0.5 hover:bg-slate-700 rounded-full transition cursor-pointer"
                  title="Eliminar habilidad"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Search bar & Category filter */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar habilidad por nombre o tecnología (ej: Linux, Redes, Cloud, ITIL, Azure, Python)..."
              value={skillSearchQuery}
              onChange={(e) => setSkillSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
            />
            {skillSearchQuery && (
              <button
                type="button"
                onClick={() => setSkillSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter size={11} /> Filtro:
            </span>
            {['Todas', ...SKILL_CATEGORIES_DATA.map((c) => c.category)].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered Skills Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Sugerencias disponibles ({filteredSkills.length}):</span>
            {skillSearchQuery && <span>Filtrado por: "{skillSearchQuery}"</span>}
          </div>
          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
            {filteredSkills.length === 0 ? (
              <div className="w-full py-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200">
                No se encontraron habilidades con ese término. Puedes agregarla abajo en "Otra habilidad".
              </div>
            ) : (
              filteredSkills.map((skill) => {
                const isSelected = answers.habilidadesEspecialidades?.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? <Check size={13} className="stroke-[2.5]" /> : <Plus size={13} className="text-slate-400" />}
                    <span>{skill}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Add custom skill input */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-500 font-mono uppercase tracking-wider block mb-1.5">
            ¿No encuentras una de tus especialidades? Escríbela aquí:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Certificación Mikrotik MTCNA, Soporte ERP SAP, Gestión de Datacenter..."
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSkill();
                }
              }}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
            />
            <button
              type="button"
              onClick={() => handleAddCustomSkill()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>
        </div>

        {/* Optional text area for deep description */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label htmlFor="perfil-habilidades-texto" className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Comentario o profundización sobre tus especialidades (Opcional)
          </label>
          <textarea
            id="perfil-habilidades-texto"
            rows={2}
            placeholder="Si deseas añadir algún contexto adicional sobre tus competencias técnicas o experiencia con herramientas particulares..."
            value={answers.habilidadesTexto}
            onChange={(e) => onChange({ ...answers, habilidadesTexto: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 focus:bg-white transition resize-none"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. ESTUDIOS Y CERTIFICACIONES (SECCIÓN DINÁMICA DE CAMPOS)  */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  5. Estudios y Certificaciones
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                  Opcional
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Registra tus títulos universitarios, diplomados y certificaciones oficiales de manera estructurada.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddStudyForm(!showAddStudyForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition cursor-pointer border border-purple-200"
          >
            {showAddStudyForm ? <X size={14} /> : <Plus size={14} />}
            {showAddStudyForm ? 'Cancelar' : 'Agregar Formación'}
          </button>
        </div>

        {/* Existing Dynamic Studies Cards List */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center justify-between">
            <span>Formaciones Registradas ({estudiosList.length})</span>
            {estudiosList.length === 0 && (
              <span className="text-[11px] font-normal normal-case text-purple-600">
                Haz clic en "+ Agregar Formación"
              </span>
            )}
          </label>

          {estudiosList.length === 0 ? (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
              <BookOpen size={28} className="mx-auto text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-700">No hay certificaciones o estudios registrados aún</p>
                <p className="text-[11px] text-slate-500">
                  Agrega tus títulos universitarios, cursos de especialización o certificados de marcas tecnológicas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudyForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                Agregar Primera Formación
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {estudiosList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 transition space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                      {item.tipo}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStudyItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-slate-900 leading-snug">{item.titulo}</h5>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <Building2 size={13} className="text-slate-400 shrink-0" />
                      <span>{item.institucion}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      {item.anio ? item.anio : 'Sin año'}
                    </span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {item.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Add Form */}
        {showAddStudyForm && (
          <form
            onSubmit={handleAddStudyItem}
            className="p-5 bg-purple-50/40 border border-purple-200 rounded-2xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <span className="text-xs font-bold text-purple-900 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Plus size={14} /> Nuevo Registro de Formación
              </span>
              <button
                type="button"
                onClick={() => setShowAddStudyForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tipo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 font-mono uppercase">
                  Tipo de Estudio / Certificado *
                </label>
                <select
                  value={newTipo}
                  onChange={(e) => setNewTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  {TIPOS_ESTUDIO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 font-mono uppercase">
                  Estado Actual
                </label>
                <select
                  value={newEstado}
                  onChange={(e) => setNewEstado(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  {ESTADOS_ESTUDIO.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Título */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 font-mono uppercase">
                  Nombre del Título o Certificación *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Licenciatura en Informática, Cisco CCNA, AWS Solutions Architect, ITIL 4..."
                  value={newTitulo}
                  onChange={(e) => setNewTitulo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Institución */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 font-mono uppercase">
                  Institución o Emisor
                </label>
                <input
                  type="text"
                  placeholder="Ej: UASD, Cisco, Amazon, INTEC, Microsoft..."
                  value={newInstitucion}
                  onChange={(e) => setNewInstitucion(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Año de Obtención / Finalización (Selector con opción 'En curso') */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 font-mono uppercase">
                    Año de Obtención / Finalización *
                  </label>
                  <span className="text-[10px] text-purple-600 font-mono">Selecciona año o "En curso"</span>
                </div>
                
                <select
                  value={newAnio}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewAnio(val);
                    if (val === 'En curso') {
                      setNewEstado('En curso');
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  {OPCIONES_ANIO_ESTUDIO.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>

                {/* Accesos rápidos de año */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono mr-1">Rápido:</span>
                  {['En curso', '2026', '2025', '2024', '2023', '2022'].map((shortcut) => (
                    <button
                      key={shortcut}
                      type="button"
                      onClick={() => {
                        setNewAnio(shortcut);
                        if (shortcut === 'En curso') setNewEstado('En curso');
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                        newAnio === shortcut
                          ? 'bg-purple-600 text-white font-bold shadow-xs'
                          : 'bg-white text-slate-600 border border-purple-200/80 hover:bg-purple-100'
                      }`}
                    >
                      {shortcut}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddStudyForm(false)}
                className="px-3.5 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newTitulo.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Guardar Formación
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. LOGRO PROFESIONAL MÁS SIGNIFICATIVO (PRÁCTICO Y CONTEXTUAL) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-display">
                6. Logro Profesional Más Significativo
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-200">
                Opcional
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Comparte un proyecto, reto o éxito del cual te sientas orgulloso de tu trayectoria profesional.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Título o Resumen del logro */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <Award size={14} className="text-emerald-600" />
              ¿De qué se trató el logro o proyecto? (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Implementación de la nueva telefonía VoIP y migración de enlaces en sucursal principal"
              value={logro.titulo || ''}
              onChange={(e) => handleLogroFieldChange('titulo', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Categoría / Tipo y Selector de Año o En curso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-mono">
                Tipo o Ámbito del Logro
              </label>
              <select
                value={logro.categoria || ''}
                onChange={(e) => handleLogroFieldChange('categoria', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Selecciona el tipo de logro...</option>
                {CATEGORIAS_LOGRO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Año o En Curso */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-mono">
                  Año o Período *
                </label>
                <span className="text-[10px] text-emerald-700 font-mono">Año o "En curso"</span>
              </div>
              
              <select
                value={logro.anio || ''}
                onChange={(e) => handleLogroFieldChange('anio', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Selecciona el año o período...</option>
                {OPCIONES_ANIO_LOGRO.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              {/* Accesos rápidos de año para el logro */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <span className="text-[10px] text-slate-400 font-mono mr-1">Rápido:</span>
                {['En curso', '2026', '2025', '2024', '2023', '2022'].map((shortcut) => (
                  <button
                    key={shortcut}
                    type="button"
                    onClick={() => handleLogroFieldChange('anio', shortcut)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                      logro.anio === shortcut
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {shortcut}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detalle y explicación del Logro (Unificado y Práctico) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" />
                Detalle del Logro y tu Aporte
              </label>
              <span className="text-[11px] text-slate-400">En tus propias palabras</span>
            </div>
            
            <textarea
              rows={4}
              placeholder="Cuéntanos la historia de este logro: ¿cuál era la situación o necesidad inicial?, ¿qué acciones tomaste tú o tu equipo para solucionarlo?, y ¿qué satisfacción o resultado generó?..."
              value={logro.descripcion || ''}
              onChange={(e) => handleLogroFieldChange('descripcion', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition resize-none leading-relaxed"
            />
            
            <div className="flex items-start gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-slate-600">
              <Lightbulb size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Sugerencia práctica:</strong> Puedes describir el reto previo, las herramientas o decisiones clave que aplicaste y por qué te enorgullece el resultado.
              </span>
            </div>
          </div>

          {/* Resultado o Impacto Clave (Opcional - Una línea) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Impacto o Resultado Clave (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Cero pérdidas de datos, ahorro de 6 horas semanales, felicitación de la dirección..."
              value={logro.impacto || ''}
              onChange={(e) => handleLogroFieldChange('impacto', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
