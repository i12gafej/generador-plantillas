import React, { useState, useEffect } from 'react'
import { MdCheck, MdClose, MdInfo } from 'react-icons/md'
import { useAppStore } from '../context/AppState'
import { TOKEN_TYPE } from '../types'

/**
 * Barra de fórmulas tipo Excel
 * Permite crear y editar:
 * - Variables simples: NombreColumna
 * - Variables calculadas: =Precio * Cantidad
 * - Variables concatenadas: =Nombre + " - " + Apellido
 */
const FormulaBar = () => {
  const { 
    activeTokenId, 
    templateTokens, 
    calculatedVars,
    columnNames,
    updateToken,
    setCalculatedVar,
    deleteCalculatedVar
  } = useAppStore()
  
  const [inputValue, setInputValue] = useState('')
  const [variableType, setVariableType] = useState(null) // 'simple', 'calculated', 'concatenated'
  const [isEditing, setIsEditing] = useState(false)
  
  // Obtener el token activo
  // Primero intentar encontrar en templateTokens
  let activeToken = templateTokens.find(t => t.id === activeTokenId)
  
  // Si no se encuentra, crear un token virtual basándose en el activeTokenId
  if (!activeToken && activeTokenId && activeTokenId.startsWith('var_')) {
    const varName = activeTokenId.replace('var_', '')
    const isCalculated = varName.startsWith('=')
    
    activeToken = {
      id: activeTokenId,
      type: isCalculated ? TOKEN_TYPE.CALCULATED : TOKEN_TYPE.VARIABLE,
      name: varName
    }
  }
  
  // Actualizar el input cuando cambia el token activo (solo cuando cambia el ID)
  useEffect(() => {
    if (!activeToken) {
      setInputValue('')
      setIsEditing(false)
      return
    }
    
    // Cargar el nombre de la variable directamente
    // Si es calculada/concatenada, el nombre ya incluye el =
    setInputValue(activeToken.name)
    setIsEditing(false)
  }, [activeTokenId]) // Solo cuando cambia el ID, no cuando cambia el token o calculatedVars
  
  // Detectar el tipo de variable según el contenido
  const detectVariableType = (value) => {
    const trimmedValue = value.trim()
    
    if (!trimmedValue.startsWith('=')) {
      return 'simple'
    }
    
    const formula = trimmedValue.substring(1).trim()
    
    // Si contiene comillas, es concatenación
    if (formula.includes('"') || formula.includes("'")) {
      return 'concatenated'
    }
    
    // Si contiene operadores matemáticos, es calculada
    if (/[+\-*/()^]/.test(formula)) {
      return 'calculated'
    }
    
    // Por defecto, asumir concatenación si empieza con =
    return 'concatenated'
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsEditing(true)
    setVariableType(detectVariableType(newValue))
  }
  
  const handleSave = () => {
    const value = inputValue.trim()
    
    if (!value) {
      return
    }
    
    const detectedType = detectVariableType(value)
    
    // Si NO hay token activo, crear uno nuevo insertado en el cursor
    if (!activeToken) {
      // Insertar la variable en el editor
      if (window.insertVariableInTemplate) {
        // Para variables simples, usar el nombre tal cual
        // Para calculadas/concatenadas, usar =FORMULA
        const varName = detectedType === 'simple' ? value : value
        
        // Insertar en el template
        window.insertVariableInTemplate(varName)
        
        // Si es calculada o concatenada, guardar la fórmula en el store
        if (detectedType !== 'simple') {
          const formula = value.substring(1).trim()
          // Usar la fórmula completa (con =) como nombre
          setCalculatedVar(value, formula)
        }
        
        // Limpiar el input
        setInputValue('')
        setIsEditing(false)
      }
      return
    }
    
    // Si hay token activo, actualizarlo
    const detectedTypeForToken = detectVariableType(value)
    const oldVarName = activeToken.name
    
    // Actualizar el contenido del template con el nuevo nombre
    const templateContent = templateTokens.find(t => t.type === TOKEN_TYPE.TEXT)?.content || ''
    const oldPlaceholder = `{{${oldVarName}}}`
    const newPlaceholder = `{{${value}}}`
    const newContent = templateContent.replace(oldPlaceholder, newPlaceholder)
    
    // Actualizar el token de texto
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      updateToken(templateTokens[0].id, { content: newContent })
    }
    
    // Variable simple (sin =)
    if (detectedTypeForToken === 'simple') {
      // Eliminar la fórmula anterior si existía
      if (activeToken.name.startsWith('=')) {
        deleteCalculatedVar(activeToken.name)
      }
      
      updateToken(activeTokenId, { 
        type: TOKEN_TYPE.VARIABLE,
        name: value 
      })
      
      setIsEditing(false)
      return
    }
    
    // Variable calculada o concatenada (con =)
    const formula = value.substring(1).trim()
    
    if (!formula) {
      return
    }
    
    // Eliminar la fórmula anterior si el nombre cambió
    if (oldVarName !== value && oldVarName.startsWith('=')) {
      deleteCalculatedVar(oldVarName)
    }
    
    // Guardar la fórmula con el nuevo nombre
    setCalculatedVar(value, formula)
    
    // Actualizar el token
    updateToken(activeTokenId, { 
      type: TOKEN_TYPE.CALCULATED,
      name: value
    })
    
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    // Restaurar el valor original
    if (!activeToken) {
      setInputValue('')
      return
    }
    
    // Restaurar el nombre original de la variable
    setInputValue(activeToken.name)
    setIsEditing(false)
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  // Determinar el tipo actual para mostrar
  const currentType = isEditing ? variableType : 
    (activeToken && activeToken.type === TOKEN_TYPE.CALCULATED ? 'calculated' : 'simple')
  
  // Etiquetas de tipo
  const typeLabels = {
    simple: 'Variable Simple',
    calculated: 'Variable Calculada',
    concatenated: 'Variable Concatenada'
  }

  // Colores de tipo
  const typeColors = {
    simple: 'text-blue-400',
    calculated: 'text-green-400',
    concatenated: 'text-purple-400'
  }
  
  // Mensaje cuando no hay variable seleccionada
  const placeholderText = activeToken 
    ? "NombreVariable o =Fórmula" 
    : "Escribe una variable y presiona Enter para insertarla"
  
  const isDisabled = false // Siempre habilitado

  return (
    <div className="flex flex-col gap-2 p-3 bg-dark-panel border-b border-dark-border">
      <div className="flex items-center gap-2">
        <div className="flex flex-col min-w-[120px]">
          <label className="text-sm font-medium text-gray-300">
            {activeToken ? 'Variable:' : 'Editar Variable:'}
          </label>
          {isEditing && currentType && activeToken && (
            <span className={`text-xs ${typeColors[currentType]}`}>
              {typeLabels[currentType]}
            </span>
          )}
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className="flex-1 bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border
                     focus:outline-none focus:border-primary font-mono text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholderText}
        />
        
        {isEditing && !isDisabled && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Guardar (Enter)"
            >
              <MdCheck size={20} />
            </button>
            
            <button
              onClick={handleCancel}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Cancelar (Esc)"
            >
              <MdClose size={20} />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-start gap-2 text-xs text-gray-400 ml-[120px]">
        <MdInfo size={14} className="mt-0.5 flex-shrink-0" />
        <div>
          <div><strong>Variable Simple:</strong> NombreColumna</div>
          <div><strong>Variable Calculada:</strong> =Precio * Cantidad</div>
          <div><strong>Variable Concatenada:</strong> =Nombre + " - " + Apellido</div>
        </div>
      </div>
    </div>
  )
}

export default FormulaBar


