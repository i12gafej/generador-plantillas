import React, { useState } from 'react'
import { MdClose, MdCheckCircle, MdError } from 'react-icons/md'
import { useAppStore } from '../context/AppState'
import { createCalculatedToken } from '../types'
import { validateFormula } from '../logic/formulaParser'

const FormulaModal = ({ onClose }) => {
  const { 
    columnNames, 
    data,
    calculatedVars,
    addToken,
    setCalculatedVar 
  } = useAppStore()
  
  const [varName, setVarName] = useState('')
  const [formula, setFormula] = useState('')
  const [validation, setValidation] = useState(null)
  const [error, setError] = useState(null)
  
  const handleFormulaChange = (value) => {
    setFormula(value)
    setError(null)
    
    // Validar en tiempo real si hay datos
    if (data.length > 0) {
      let formulaToValidate = value.trim()
      if (formulaToValidate.startsWith('=')) {
        formulaToValidate = formulaToValidate.substring(1)
      }
      
      if (formulaToValidate) {
        const result = validateFormula(formulaToValidate, data[0])
        setValidation(result)
      } else {
        setValidation(null)
      }
    }
  }
  
  const handleInsertColumn = (columnName) => {
    const cursorPos = document.getElementById('formula-input')?.selectionStart || formula.length
    const newFormula = 
      formula.slice(0, cursorPos) + 
      columnName + 
      formula.slice(cursorPos)
    
    handleFormulaChange(newFormula)
  }
  
  const handleSave = () => {
    if (!varName.trim()) {
      setError('El nombre de la variable no puede estar vacío')
      return
    }
    
    if (!formula.trim()) {
      setError('La fórmula no puede estar vacía')
      return
    }
    
    // Verificar que no exista ya
    if (calculatedVars[varName]) {
      setError('Ya existe una variable con ese nombre')
      return
    }
    
    let finalFormula = formula.trim()
    if (finalFormula.startsWith('=')) {
      finalFormula = finalFormula.substring(1)
    }
    
    // Validar la fórmula
    if (data.length > 0) {
      const result = validateFormula(finalFormula, data[0])
      if (!result.valid) {
        setError(result.error)
        return
      }
    }
    
    // Guardar la fórmula
    setCalculatedVar(varName, finalFormula)
    
    // Crear el token e insertarlo
    const token = createCalculatedToken(varName)
    addToken(token)
    
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-panel rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h3 className="font-semibold text-lg">Insertar Variable Calculada</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-hover rounded transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 text-sm text-blue-300">
            ℹ️ Crea una variable que se calcule a partir de otras columnas usando operadores matemáticos (+, -, *, /, paréntesis)
          </div>
          
          {/* Nombre de variable */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de la variable *
            </label>
            <input
              type="text"
              value={varName}
              onChange={(e) => {
                setVarName(e.target.value)
                setError(null)
              }}
              placeholder="Ej: Total, Descuento, PrecioFinal"
              className="w-full bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border focus:outline-none focus:border-primary font-mono"
            />
          </div>
          
          {/* Fórmula */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fórmula *
            </label>
            <textarea
              id="formula-input"
              value={formula}
              onChange={(e) => handleFormulaChange(e.target.value)}
              placeholder="Ej: Precio * Cantidad&#10;    Precio * (1 - 0.16)&#10;    (Subtotal + IVA) * Cantidad"
              rows={3}
              className="w-full bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border focus:outline-none focus:border-primary font-mono text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Usa nombres de columnas y operadores: +, -, *, /, ( )
            </p>
          </div>
          
          {/* Validación */}
          {validation && (
            <div className={`flex items-start gap-2 p-3 rounded-lg ${
              validation.valid 
                ? 'bg-green-600/10 border border-green-600/30 text-green-300' 
                : 'bg-red-600/10 border border-red-600/30 text-red-300'
            }`}>
              {validation.valid ? (
                <>
                  <MdCheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">✓ Fórmula válida</div>
                    <div className="mt-1">
                      Resultado de prueba: <span className="font-mono font-bold">{validation.result}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <MdError size={20} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">✗ Error en la fórmula</div>
                    <div className="mt-1">{validation.error}</div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-600/10 border border-red-600/30 text-red-300">
              <MdError size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{error}</div>
            </div>
          )}
          
          {/* Columnas disponibles */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Columnas disponibles (haz clic para insertar)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-dark-card rounded-lg max-h-40 overflow-y-auto scrollbar-thin">
              {columnNames.map(col => (
                <button
                  key={col}
                  onClick={() => handleInsertColumn(col)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded text-sm font-mono transition-colors"
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
          
          {/* Ejemplos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ejemplos de fórmulas
            </label>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 p-2 bg-dark-card rounded">
                <span className="text-gray-400 min-w-[120px]">Total simple:</span>
                <code className="font-mono text-blue-300">Precio * Cantidad</code>
              </div>
              <div className="flex items-start gap-2 p-2 bg-dark-card rounded">
                <span className="text-gray-400 min-w-[120px]">Con descuento:</span>
                <code className="font-mono text-blue-300">Precio * (1 - Descuento / 100)</code>
              </div>
              <div className="flex items-start gap-2 p-2 bg-dark-card rounded">
                <span className="text-gray-400 min-w-[120px]">Con IVA:</span>
                <code className="font-mono text-blue-300">Subtotal * 1.16</code>
              </div>
              <div className="flex items-start gap-2 p-2 bg-dark-card rounded">
                <span className="text-gray-400 min-w-[120px]">Complejo:</span>
                <code className="font-mono text-blue-300">(Precio * Cantidad + Envio) * (1 + IVA / 100)</code>
              </div>
            </div>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex gap-2 p-4 border-t border-dark-border">
          <button
            onClick={handleSave}
            disabled={!varName.trim() || !formula.trim() || (validation && !validation.valid)}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary-disabled disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            Insertar variable
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default FormulaModal

