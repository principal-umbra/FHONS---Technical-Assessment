import React, { useState, useEffect, useRef } from 'react';
import { Library, FileText, Search, Loader2, Clock, Trash2, X, Download } from 'lucide-react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Questionnaire } from '../types';

interface LaboratoryReport {
  id: string;
  userEmail: string;
  questionnaireId?: string;
  questionnaireTitle?: string;
  collectionPath?: string;
  reportContent: string;
  createdAt: any;
}

interface AdminLibreroProps {
  questionnaire: Questionnaire;
}

export default function AdminLibrero({ questionnaire }: AdminLibreroProps) {
  const [reports, setReports] = useState<LaboratoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedReport, setSelectedReport] = useState<LaboratoryReport | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [questionnaire.id]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'laboratory_reports'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data: LaboratoryReport[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as LaboratoryReport);
      });
      setReports(data);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) return;
    
    try {
      await deleteDoc(doc(db, 'laboratory_reports', id));
      setReports(reports.filter(r => r.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Error al eliminar el reporte.");
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesQ = r.questionnaireId 
      ? r.questionnaireId === questionnaire.id 
      : questionnaire.id === 'servicio_al_cliente';
    if (!matchesQ) return false;
    return r.userEmail.toLowerCase().includes(search.toLowerCase());
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Reciente';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-MX', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }).format(d);
  };

  const handleDownloadPdf = async () => {
    if (!selectedReport) return;
    setIsDownloading(true);
    
    try {
      const sourceElement = document.getElementById('report-content-pdf');
      if (!sourceElement) throw new Error("Contenido no encontrado");

      // Clonar el contenido para manipularlo sin afectar la vista actual
      const clone = sourceElement.cloneNode(true) as HTMLElement;
      
      // Remover TODAS las clases de Tailwind para evitar el error de "oklch" en html2canvas
      clone.removeAttribute('class');
      const allElements = clone.querySelectorAll('*');
      allElements.forEach(el => {
        el.removeAttribute('class');
        // Aplicar estilos inline básicos con colores HEX (soportados por html2canvas)
        const element = el as HTMLElement;
        if (['H1', 'H2', 'H3', 'H4'].includes(element.tagName)) {
          element.style.color = '#1e293b';
          element.style.marginTop = '1.5em';
          element.style.marginBottom = '0.5em';
          element.style.fontWeight = 'bold';
        } else if (['P', 'LI'].includes(element.tagName)) {
          element.style.color = '#334155';
          element.style.lineHeight = '1.6';
          element.style.marginBottom = '0.5em';
        } else if (element.tagName === 'STRONG') {
          element.style.fontWeight = 'bold';
          element.style.color = '#0f172a';
        } else if (element.tagName === 'UL' || element.tagName === 'OL') {
          element.style.paddingLeft = '20px';
          element.style.marginBottom = '1em';
        }
      });

      // Crear un contenedor limpio para el PDF
      const container = document.createElement('div');
      container.style.fontFamily = 'Helvetica, Arial, sans-serif';
      container.style.padding = '20px';
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#333333';
      
      container.innerHTML = `
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="color: #0f172a; margin: 0 0 10px 0; font-size: 24px;">Perfil Conductual y Psicológico</h1>
          <p style="color: #64748b; margin: 0; font-size: 14px;"><strong>Agente Analizado:</strong> ${selectedReport.userEmail}</p>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;"><strong>Fecha del Reporte:</strong> ${formatDate(selectedReport.createdAt)}</p>
        </div>
      `;
      
      // Añadir el contenido limpio de Markdown
      container.appendChild(clone);

      const opt = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: `Perfil_Conductual_${selectedReport.userEmail}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(container).save();
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Library size={24} className="text-indigo-600" />
            Librero de Perfiles IA
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Repositorio de los perfiles conductuales generados por el Laboratorio.
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="text-sm">Cargando librero...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredReports.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-slate-500 text-sm">
                No se encontraron reportes.
              </div>
            ) : (
              filteredReports.map(report => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedReport?.id === report.id
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={16} className={selectedReport?.id === report.id ? 'text-indigo-600' : 'text-slate-400'} />
                      <h4 className="font-semibold text-sm text-slate-800 truncate" title={report.userEmail}>
                        {report.userEmail}
                      </h4>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(report.id, e)}
                      className="p-1 text-slate-300 hover:text-red-500 rounded transition"
                      title="Eliminar reporte"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="md:col-span-2">
            {selectedReport ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[700px] overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <FileText size={20} className="text-indigo-600" />
                      Perfil de {selectedReport.userEmail}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Guardado el {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-semibold transition flex items-center gap-2 border border-indigo-200 disabled:opacity-50"
                    >
                      {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      Descargar PDF
                    </button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 overflow-y-auto">
                  <div id="report-content-pdf" className="prose prose-sm md:prose-base prose-slate max-w-none prose-headings:font-display prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 bg-white p-4">
                    <Markdown>{selectedReport.reportContent}</Markdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Library size={48} className="text-slate-300 mb-4 opacity-50" />
                <h4 className="text-lg font-semibold text-slate-600 mb-2">Selecciona un reporte</h4>
                <p className="text-sm">
                  Haz clic en un reporte de la lista para ver el perfil conductual detallado.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
