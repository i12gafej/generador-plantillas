import React from 'react'
import { 
  FaFileImport, 
  FaSave, 
  FaPlay, 
  FaQuestionCircle
} from 'react-icons/fa'
import { IoLogoWhatsapp } from 'react-icons/io5'

const Toolbar = ({ 
  onLoadTemplate, 
  onSaveTemplate, 
  onGenerate, 
  onOpenWhatsApp,
  onOpenHelp,
  canGenerate,
  hasGeneratedTexts 
}) => {
  return (
    <div className="bg-dark-panel border-b border-dark-border px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Plantillas */}
        <div className="flex items-center gap-2 pr-3 border-r border-dark-border">
          <button
            onClick={onLoadTemplate}
            className="flex items-center gap-2 px-3 py-2 hover:bg-dark-hover rounded-lg transition-colors"
            title="Cargar plantilla"
          >
            <FaFileImport size={16} />
            <span className="text-sm">Cargar plantilla</span>
          </button>
          
          <button
            onClick={onSaveTemplate}
            className="flex items-center gap-2 px-3 py-2 hover:bg-dark-hover rounded-lg transition-colors"
            title="Guardar plantilla"
          >
            <FaSave size={16} />
            <span className="text-sm">Guardar plantilla</span>
          </button>
        </div>
        
        {/* Acciones */}
        <div className="flex items-center gap-2 pr-3 border-r border-dark-border">
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary-disabled disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            title="Generar textos"
          >
            <FaPlay size={14} />
            <span className="text-sm">Generar textos</span>
          </button>
        </div>
        
        {/* WhatsApp */}
        <div className="flex items-center gap-2 pr-3 border-r border-dark-border">
          <button
            onClick={onOpenWhatsApp}
            disabled={!hasGeneratedTexts}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Enviar a WhatsApp"
          >
            <IoLogoWhatsapp size={18} />
            <span className="text-sm">WhatsApp</span>
          </button>
        </div>
        
        {/* Ayuda */}
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-2 px-3 py-2 hover:bg-dark-hover rounded-lg transition-colors"
          title="Ayuda"
        >
          <FaQuestionCircle size={16} />
          <span className="text-sm">Ayuda</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar

