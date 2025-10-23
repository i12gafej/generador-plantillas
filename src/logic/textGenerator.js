import { TOKEN_TYPE } from '../types'
import { evaluateFormula } from './formulaParser'

/**
 * Genera textos a partir de la plantilla y los datos
 * Retorna un objeto con los textos generados y los errores encontrados
 */
export const generateTexts = (templateTokens, calculatedVars, data) => {
  const texts = []
  const errors = []
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    try {
      const text = generateTextForRow(templateTokens, calculatedVars, row)
      texts.push(text)
    } catch (error) {
      console.error(`Error generando texto para fila ${i + 1}:`, row, error)
      const errorMsg = `[Fila ${i + 1} - Error: ${error.message}]`
      texts.push(errorMsg)
      errors.push({
        row: i + 1,
        data: row,
        error: error.message
      })
    }
  }
  
  return { texts, errors }
}

/**
 * Parsea el contenido de la plantilla para detectar variables
 * Formato: "Hola {{Nombre}} y {{=Precio*2}}"
 */
const parseTemplateContent = (content) => {
  if (!content || typeof content !== 'string') {
    return []
  }

  const parts = content.split(/(\{\{[^}]+\}\})/)
  const tokens = []

  for (const part of parts) {
    if (part.match(/\{\{[^}]+\}\}/)) {
      const varName = part.replace(/\{\{|\}\}/g, '')
      
      // Si empieza con =, es calculada/concatenada
      if (varName.startsWith('=')) {
        tokens.push({
          type: TOKEN_TYPE.CALCULATED,
          name: varName,
          formula: varName.substring(1).trim()
        })
      } else {
        tokens.push({
          type: TOKEN_TYPE.VARIABLE,
          name: varName
        })
      }
    } else if (part) {
      tokens.push({
        type: TOKEN_TYPE.TEXT,
        content: part
      })
    }
  }

  return tokens
}

/**
 * Genera un texto para una fila específica
 */
export const generateTextForRow = (templateTokens, calculatedVars, row) => {
  let result = ''
  
  for (const token of templateTokens) {
    if (token.type === TOKEN_TYPE.TEXT) {
      // Si el content contiene variables, parsearlas
      if (token.content && token.content.includes('{{')) {
        const parsedTokens = parseTemplateContent(token.content)
        for (const parsedToken of parsedTokens) {
          result += processToken(parsedToken, calculatedVars, row)
        }
      } else {
        result += token.content
      }
    } else {
      result += processToken(token, calculatedVars, row)
    }
  }
  
  return result
}

/**
 * Procesa un token individual
 */
const processToken = (token, calculatedVars, row) => {
  if (token.type === TOKEN_TYPE.TEXT) {
    return token.content
  }
  
  if (token.type === TOKEN_TYPE.VARIABLE) {
    const value = row[token.name]
    if (value === undefined || value === null) {
      return `[${token.name}?]`
    }
    return value
  }
  
  if (token.type === TOKEN_TYPE.CALCULATED) {
    // Si el nombre empieza con =, usar ese como fórmula
    let formula = token.formula || calculatedVars[token.name]
    
    // Si el nombre de la variable es la fórmula (formato {{=...}})
    if (!formula && token.name.startsWith('=')) {
      formula = token.name.substring(1).trim()
    }
    
    if (!formula) {
      return `[${token.name}?]`
    }
    
    try {
      // evaluateFormula detecta automáticamente si es calculada o concatenada
      const calculatedValue = evaluateFormula(formula, row)
      return calculatedValue
    } catch (error) {
      // Lanzar error para ser capturado en generateTexts
      throw new Error(`Variable '${token.name}': ${error.message}`)
    }
  }
  
  return ''
}

/**
 * Previsualiza el texto con la primera fila de datos
 */
export const previewText = (templateTokens, calculatedVars, data) => {
  if (data.length === 0) {
    return '[Sin datos para previsualizar]'
  }
  
  return generateTextForRow(templateTokens, calculatedVars, data[0])
}

