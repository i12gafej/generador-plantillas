/**
 * Errores del parser de fórmulas
 */
export class FormulaParserError extends Error {
  constructor(message) {
    super(message)
    this.name = 'FormulaParserError'
  }
}

/**
 * Redondea valores muy cercanos a enteros
 */
const snapNearInteger = (value, tol = 1e-5) => {
  if (typeof value === 'number' && isFinite(value)) {
    const nearest = Math.round(value)
    if (Math.abs(value - nearest) <= tol) {
      return nearest
    }
  }
  return value
}

/**
 * Detecta si una fórmula es de concatenación (contiene comillas)
 */
const isConcatenationFormula = (formula) => {
  return formula.includes('"') || formula.includes("'")
}

/**
 * Evalúa una fórmula de concatenación
 * @param {string} formula - La fórmula de concatenación
 * @param {object} row - Objeto con los datos de la fila
 * @returns {string} El resultado de la concatenación
 * @throws {FormulaParserError} Si la fórmula es inválida
 */
export const evaluateConcatenationFormula = (formula, row) => {
  if (!formula || typeof formula !== 'string') {
    throw new FormulaParserError('La fórmula debe ser una cadena de texto')
  }

  let expr = formula.trim()
  
  // Remover el = inicial si existe
  if (expr.startsWith('=')) {
    expr = expr.substring(1).trim()
  }

  // Reemplazar nombres de columnas por sus valores (como strings)
  const columnNames = Object.keys(row).sort((a, b) => b.length - a.length)
  
  for (const colName of columnNames) {
    // Verificar si la columna está en la fórmula
    const regex = new RegExp(`\\b${colName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
    if (!regex.test(expr)) {
      continue // Saltar columnas que no están en la fórmula
    }
    
    let value = row[colName]
    
    // Convertir a string si es necesario
    if (value === null || value === undefined) {
      value = ''
    } else {
      value = String(value)
    }
    
    // Escapar el valor para usar en la expresión
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    
    // Reemplazar usando regex con word boundaries
    const regexGlobal = new RegExp(`\\b${colName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
    expr = expr.replace(regexGlobal, `"${escapedValue}"`)
  }

  // Evaluar la expresión de concatenación
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`'use strict'; return (${expr})`)()
    
    return String(result)
  } catch (error) {
    throw new FormulaParserError(`Error al evaluar la concatenación: ${error.message}`)
  }
}

/**
 * Evalúa una fórmula tipo Excel con los datos de una fila (solo cálculos numéricos)
 * 
 * @param {string} formula - La fórmula sin {{{ }}} (ej: "Precio * Cantidad")
 * @param {object} row - Objeto con los datos de la fila (ej: { Precio: 100, Cantidad: 5 })
 * @param {number} snapTol - Tolerancia para redondear a enteros
 * @returns {number} El resultado de la fórmula
 * @throws {FormulaParserError} Si la fórmula es inválida
 */
export const evaluateExcelFormula = (formula, row, snapTol = 1e-5) => {
  if (!formula || typeof formula !== 'string') {
    throw new FormulaParserError('La fórmula debe ser una cadena de texto')
  }

  let expr = formula.trim()
  
  // Remover el = inicial si existe
  if (expr.startsWith('=')) {
    expr = expr.substring(1).trim()
  }

  // Reemplazar nombres de columnas por sus valores
  // Ordenar por longitud descendente para evitar reemplazos parciales
  const columnNames = Object.keys(row).sort((a, b) => b.length - a.length)
  
  for (const colName of columnNames) {
    // Verificar si la columna está en la fórmula
    const regex = new RegExp(`\\b${colName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
    if (!regex.test(expr)) {
      continue // Saltar columnas que no están en la fórmula
    }
    
    const value = row[colName]
    
    // Validar que el valor sea numérico SOLO si está en la fórmula
    if (value === null || value === undefined || value === '') {
      throw new FormulaParserError(`La columna '${colName}' no tiene valor`)
    }
    
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      throw new FormulaParserError(`La columna '${colName}' no es numérica: '${value}'`)
    }
    
    // Reemplazar usando regex con word boundaries
    const regexGlobal = new RegExp(`\\b${colName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
    expr = expr.replace(regexGlobal, numValue.toString())
  }

  // Validación léxica: solo permitir números, operadores y paréntesis
  if (!/^[\d\.\+\-\*/\(\)\s]+$/.test(expr)) {
    throw new FormulaParserError(`La expresión contiene caracteres no válidos: '${expr}'`)
  }

  // Evaluar la expresión
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`'use strict'; return (${expr})`)()
    
    if (!isFinite(result)) {
      throw new FormulaParserError('El resultado no es un número finito')
    }
    
    return snapNearInteger(result, snapTol)
  } catch (error) {
    throw new FormulaParserError(`Error al evaluar la expresión: ${error.message}`)
  }
}

/**
 * Evalúa una fórmula (calculada o concatenada) automáticamente
 * @param {string} formula - La fórmula a evaluar
 * @param {object} row - Objeto con los datos de la fila
 * @returns {string|number} El resultado de la fórmula
 * @throws {FormulaParserError} Si la fórmula es inválida
 */
export const evaluateFormula = (formula, row) => {
  if (isConcatenationFormula(formula)) {
    return evaluateConcatenationFormula(formula, row)
  } else {
    return evaluateExcelFormula(formula, row)
  }
}

/**
 * Valida una fórmula con una fila de ejemplo
 * 
 * @param {string} formula - La fórmula a validar
 * @param {object} sampleRow - Una fila de ejemplo para validar
 * @returns {{ valid: boolean, error?: string, result?: (number|string), type?: string }}
 */
export const validateFormula = (formula, sampleRow) => {
  try {
    const isConcatenation = isConcatenationFormula(formula)
    const result = evaluateFormula(formula, sampleRow)
    return { 
      valid: true, 
      result,
      type: isConcatenation ? 'concatenated' : 'calculated'
    }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof FormulaParserError ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Extrae los nombres de columnas usados en una fórmula
 * 
 * @param {string} formula - La fórmula
 * @param {string[]} availableColumns - Columnas disponibles
 * @returns {string[]} Lista de columnas usadas
 */
export const extractUsedColumns = (formula, availableColumns) => {
  if (!formula || typeof formula !== 'string') {
    return []
  }

  let expr = formula.trim()
  if (expr.startsWith('=')) {
    expr = expr.substring(1).trim()
  }

  const usedColumns = []
  
  // Ordenar por longitud descendente para evitar matches parciales
  const sortedColumns = [...availableColumns].sort((a, b) => b.length - a.length)
  
  for (const colName of sortedColumns) {
    const regex = new RegExp(`\\b${colName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
    if (regex.test(expr)) {
      usedColumns.push(colName)
    }
  }

  return usedColumns
}

