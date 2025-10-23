import React, { useState } from 'react'
import { useAppStore } from './context/AppState'
import Toolbar from './components/Toolbar'
import FormulaBar from './components/FormulaBar'
import TemplateEditor from './components/TemplateEditor'
import ExcelViewer from './components/ExcelViewer'
import GeneratedTextsViewer from './components/GeneratedTextsViewer'
import WhatsAppModal from './components/WhatsAppModal'
import FormulaModal from './components/FormulaModal'
import HelpModal from './components/HelpModal'
import { generateTexts } from './logic/textGenerator'

function App() {
  const {
    templateTokens,
    calculatedVars,
    filteredData,
    data,
    generatedTexts,
    setGeneratedTexts,
    getStateForSave,
    loadStateFromSave,
    setExcelData,
    stringToTokens,
    reset
  } = useAppStore()
  
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showFormulaModal, setShowFormulaModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  
  // Estado de los splitters
  const [verticalSplit, setVerticalSplit] = useState(50)
  const [horizontalSplit, setHorizontalSplit] = useState(70)
  
  const canGenerate = data.length > 0 && templateTokens.length > 0
  const hasGeneratedTexts = generatedTexts.length > 0
  
  // Generar textos
  const handleGenerate = () => {
    if (!canGenerate) return
    
    try {
      const result = generateTexts(templateTokens, calculatedVars, filteredData)
      setGeneratedTexts(result.texts)
      
      // Mostrar errores si los hay
      if (result.errors && result.errors.length > 0) {
        const errorSummary = result.errors.map(e => 
          `Fila ${e.row}: ${e.error}`
        ).join('\n')
        
        alert(`✅ Textos generados con ${result.errors.length} errores:\n\n${errorSummary}`)
      }
    } catch (error) {
      console.error('Error generando textos:', error)
      alert(`Error al generar textos: ${error.message}`)
    }
  }
  
  // Guardar plantilla
  const handleSaveTemplate = () => {
    try {
      const state = getStateForSave()
      const json = JSON.stringify(state, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plantilla_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error guardando plantilla:', error)
      alert(`Error al guardar plantilla: ${error.message}`)
    }
  }
  
  // Cargar plantilla
  const handleLoadTemplate = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e) => {
      try {
        const file = e.target.files?.[0]
        if (!file) return
        
        const text = await file.text()
        const data = JSON.parse(text)
        
        // Cargar estado
        const excelPath = loadStateFromSave(data)
        
        // Si hay una ruta de Excel, avisar al usuario
        if (excelPath && !useAppStore.getState().data.length) {
          alert('La plantilla incluye un archivo Excel. Por favor, cárgalo manualmente.')
        }
      } catch (error) {
        console.error('Error cargando plantilla:', error)
        alert(`Error al cargar plantilla: ${error.message}`)
      }
    }
    
    input.click()
  }
  
  return (
    <div className="h-screen w-screen flex flex-col bg-dark-bg text-white overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        onLoadTemplate={handleLoadTemplate}
        onSaveTemplate={handleSaveTemplate}
        onGenerate={handleGenerate}
        onOpenWhatsApp={() => setShowWhatsAppModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        canGenerate={canGenerate}
        hasGeneratedTexts={hasGeneratedTexts}
      />
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel (Template + Excel) */}
        <div 
          className="flex flex-col overflow-hidden"
          style={{ width: `${horizontalSplit}%` }}
        >
          {/* Template editor */}
          <div 
            className="flex flex-col overflow-hidden p-3"
            style={{ height: `${verticalSplit}%` }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Editar Plantilla</h3>
            </div>
            
            {/* Formula Bar */}
            <FormulaBar />
            
            {/* Template Editor */}
            <div className="flex-1 overflow-hidden mt-2">
              <TemplateEditor />
            </div>
          </div>
          
          {/* Resizer vertical */}
          <div
            className="h-2 bg-dark-panel hover:bg-primary/50 cursor-ns-resize transition-colors flex items-center justify-center"
            onMouseDown={(e) => {
              const startY = e.clientY
              const startHeight = verticalSplit
              
              const handleMouseMove = (e) => {
                const deltaY = e.clientY - startY
                const containerHeight = e.target.parentElement?.parentElement?.clientHeight || 1
                const deltaPercent = (deltaY / containerHeight) * 100
                const newHeight = Math.max(20, Math.min(80, startHeight + deltaPercent))
                setVerticalSplit(newHeight)
              }
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }
              
              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
          >
            <div className="w-12 h-1 bg-gray-600 rounded" />
          </div>
          
          {/* Excel viewer */}
          <div 
            className="flex-1 overflow-hidden p-3 pt-0"
          >
            <ExcelViewer />
          </div>
        </div>
        
        {/* Resizer horizontal */}
        <div
          className="w-2 bg-dark-panel hover:bg-primary/50 cursor-ew-resize transition-colors flex items-center justify-center"
          onMouseDown={(e) => {
            const startX = e.clientX
            const startWidth = horizontalSplit
            
            const handleMouseMove = (e) => {
              const deltaX = e.clientX - startX
              const containerWidth = e.target.parentElement?.clientWidth || 1
              const deltaPercent = (deltaX / containerWidth) * 100
              const newWidth = Math.max(30, Math.min(85, startWidth + deltaPercent))
              setHorizontalSplit(newWidth)
            }
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        >
          <div className="h-12 w-1 bg-gray-600 rounded" />
        </div>
        
        {/* Right panel (Generated texts) */}
        <div 
          className="flex-1 overflow-hidden p-3"
        >
          <GeneratedTextsViewer 
            onOpenWhatsApp={() => setShowWhatsAppModal(true)}
          />
        </div>
      </div>
      
      {/* Modals */}
      {showWhatsAppModal && (
        <WhatsAppModal onClose={() => setShowWhatsAppModal(false)} />
      )}
      
      {showFormulaModal && (
        <FormulaModal onClose={() => setShowFormulaModal(false)} />
      )}
      
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  )
}

export default App

