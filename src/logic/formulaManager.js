import { validateFormula } from './formulaParser'

/**
 * Define o actualiza una variable calculada
 */
export const defineCalculatedVariable = (varName, formulaText, sampleRow, store) => {
  if (!varName || !varName.trim()) {
    return {
      success: false,
      error: 'El nombre de la variable no puede estar vacío'
    }
  }
  
  if (!formulaText || !formulaText.trim()) {
    return {
      success: false,
      error: 'La fórmula no puede estar vacía'
    }
  }
  
  // Remover el = inicial si existe
  let formula = formulaText.trim()
  if (formula.startsWith('=')) {
    formula = formula.substring(1).trim()
  }
  
  // Validar la fórmula con una fila de ejemplo
  const validation = validateFormula(formula, sampleRow)
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    }
  }
  
  // Guardar la fórmula en el store
  store.setCalculatedVar(varName, formula)
  
  return {
    success: true,
    result: validation.result
  }
}

/**
 * Elimina una variable calculada
 */
export const deleteCalculatedVariable = (varName, store) => {
  store.deleteCalculatedVar(varName)
  
  // También eliminar todos los tokens que usen esta variable
  const { templateTokens, deleteToken } = store
  const tokensToDelete = templateTokens.filter(
    token => token.type === 'calculated' && token.name === varName
  )
  
  tokensToDelete.forEach(token => {
    deleteToken(token.id)
  })
}

/**
 * Renombra una variable calculada
 */
export const renameCalculatedVariable = (oldName, newName, store) => {
  if (!newName || !newName.trim()) {
    return {
      success: false,
      error: 'El nuevo nombre no puede estar vacío'
    }
  }
  
  const { calculatedVars, setCalculatedVar, deleteCalculatedVar, templateTokens, updateToken } = store
  
  // Verificar que la variable existe
  const formula = calculatedVars[oldName]
  if (!formula) {
    return {
      success: false,
      error: 'La variable no existe'
    }
  }
  
  // Verificar que el nuevo nombre no existe
  if (calculatedVars[newName] && oldName !== newName) {
    return {
      success: false,
      error: 'Ya existe una variable con ese nombre'
    }
  }
  
  // Actualizar el nombre en el store
  if (oldName !== newName) {
    setCalculatedVar(newName, formula)
    deleteCalculatedVar(oldName)
    
    // Actualizar todos los tokens que usen esta variable
    templateTokens.forEach(token => {
      if (token.type === 'calculated' && token.name === oldName) {
        updateToken(token.id, { name: newName })
      }
    })
  }
  
  return { success: true }
}

/**
 * Obtiene información sobre una variable calculada
 */
export const getCalculatedVariableInfo = (varName, store, sampleRow) => {
  const { calculatedVars } = store
  const formula = calculatedVars[varName]
  
  if (!formula) {
    return null
  }
  
  const validation = validateFormula(formula, sampleRow)
  
  return {
    name: varName,
    formula,
    valid: validation.valid,
    error: validation.error,
    sampleResult: validation.result
  }
}

