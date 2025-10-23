import React, { useState } from 'react'
import { MdContentCopy, MdDownload, MdCheckCircle } from 'react-icons/md'
import { IoLogoWhatsapp } from 'react-icons/io5'
import { useAppStore } from '../context/AppState'

const GeneratedTextsViewer = ({ onOpenWhatsApp }) => {
  const { generatedTexts } = useAppStore()
  const [copiedIndex, setCopiedIndex] = useState(null)
  
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }
  
  const handleCopyAll = () => {
    const allText = generatedTexts.join('\n\n---\n\n')
    navigator.clipboard.writeText(allText)
    setCopiedIndex('all')
    setTimeout(() => setCopiedIndex(null), 2000)
  }
  
  const handleDownload = () => {
    const allText = generatedTexts.join('\n\n')
    const blob = new Blob([allText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `textos_generados_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  if (!generatedTexts || generatedTexts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-dark-panel rounded-lg">
        <div className="text-center text-gray-400">
          <p className="text-lg">Sin textos generados</p>
          <p className="text-sm mt-2">
            Carga datos y crea una plantilla para generar textos
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col bg-dark-panel rounded-lg overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-center justify-between p-3 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-xs">Textos Generados</h3>
          <span className="text-xs text-gray-400 mr-2">
            ({generatedTexts.length})
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors flex items-center gap-2 text-sm"
            title="Copiar todos"
          >
                {copiedIndex === 'all' ? (
              <>
                <MdCheckCircle size={16} className="text-green-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <MdContentCopy size={16} />
                <span className="text-xs">Copiar todos</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors flex items-center gap-2 text-sm"
            title="Descargar"
          >
            <MdDownload size={16} />
            <span className="text-xs">Descargar</span>
          </button>
          
          {onOpenWhatsApp && (
            <button
              onClick={onOpenWhatsApp}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1 text-sm"
              title="Enviar a WhatsApp"
            >
              <IoLogoWhatsapp size={16} />
              <span className="text-xs">WhatsApp</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Lista de textos */}
      <div className="flex-1 overflow-auto scrollbar-thin p-3 space-y-3">
        {generatedTexts.map((text, index) => (
          <div
            key={index}
            className="bg-dark-card rounded-lg p-4 border border-dark-border hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-2">
                  Texto #{index + 1}
                </div>
                <pre className="whitespace-pre-wrap break-words text-sm font-mono">
                  {text}
                </pre>
              </div>
              
              <button
                onClick={() => handleCopy(text, index)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-dark-hover rounded transition-all flex-shrink-0"
                title="Copiar"
              >
                {copiedIndex === index ? (
                  <MdCheckCircle size={18} className="text-green-400" />
                ) : (
                  <MdContentCopy size={18} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GeneratedTextsViewer

