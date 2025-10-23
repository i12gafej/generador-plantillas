import { FILTER_CONDITION } from '../types'

/**
 * Aplica filtros a los datos
 */
export const applyFilters = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return data
  }
  
  return data.filter(row => {
    // Aplicar todos los filtros (AND lógico)
    for (const [column, filter] of Object.entries(filters)) {
      const cellValue = row[column]
      const { condicion, valores } = filter
      
      // Si no hay valores, saltear este filtro
      if (!valores || valores.length === 0) {
        continue
      }
      
      // Aplicar la condición
      const matches = checkFilterCondition(cellValue, condicion, valores)
      
      if (!matches) {
        return false // Si no cumple algún filtro, excluir la fila
      }
    }
    
    return true // Cumple todos los filtros
  })
}

/**
 * Verifica si un valor cumple con una condición de filtro
 */
const checkFilterCondition = (cellValue, condition, values) => {
  const cellStr = String(cellValue).toLowerCase()
  
  switch (condition) {
    case FILTER_CONDITION.EQUAL:
      return values.some(v => String(v).toLowerCase() === cellStr)
    
    case FILTER_CONDITION.NOT_EQUAL:
      return !values.some(v => String(v).toLowerCase() === cellStr)
    
    case FILTER_CONDITION.CONTAINS:
      return values.some(v => cellStr.includes(String(v).toLowerCase()))
    
    case FILTER_CONDITION.NOT_CONTAINS:
      return !values.some(v => cellStr.includes(String(v).toLowerCase()))
    
    case FILTER_CONDITION.STARTS_WITH:
      return values.some(v => cellStr.startsWith(String(v).toLowerCase()))
    
    case FILTER_CONDITION.ENDS_WITH:
      return values.some(v => cellStr.endsWith(String(v).toLowerCase()))
    
    case FILTER_CONDITION.GREATER:
      return values.some(v => {
        const num1 = parseFloat(cellValue)
        const num2 = parseFloat(v)
        return !isNaN(num1) && !isNaN(num2) && num1 > num2
      })
    
    case FILTER_CONDITION.LESS:
      return values.some(v => {
        const num1 = parseFloat(cellValue)
        const num2 = parseFloat(v)
        return !isNaN(num1) && !isNaN(num2) && num1 < num2
      })
    
    case FILTER_CONDITION.GREATER_EQUAL:
      return values.some(v => {
        const num1 = parseFloat(cellValue)
        const num2 = parseFloat(v)
        return !isNaN(num1) && !isNaN(num2) && num1 >= num2
      })
    
    case FILTER_CONDITION.LESS_EQUAL:
      return values.some(v => {
        const num1 = parseFloat(cellValue)
        const num2 = parseFloat(v)
        return !isNaN(num1) && !isNaN(num2) && num1 <= num2
      })
    
    default:
      return true
  }
}

/**
 * Obtiene los valores únicos de una columna
 */
export const getUniqueValues = (data, columnName) => {
  const values = new Set()
  
  data.forEach(row => {
    const value = row[columnName]
    if (value !== null && value !== undefined && value !== '') {
      values.add(value)
    }
  })
  
  return Array.from(values).sort()
}

