/**
 * Tipos de tokens para la plantilla
 */
export const TOKEN_TYPE = {
  TEXT: 'text',
  VARIABLE: 'variable',
  CALCULATED: 'calculated'
}

/**
 * Condiciones de filtro
 */
export const FILTER_CONDITION = {
  EQUAL: 'Igual a',
  NOT_EQUAL: 'Diferente a',
  CONTAINS: 'Contiene',
  NOT_CONTAINS: 'No contiene',
  STARTS_WITH: 'Empieza con',
  ENDS_WITH: 'Termina con',
  GREATER: 'Mayor que',
  LESS: 'Menor que',
  GREATER_EQUAL: 'Mayor o igual',
  LESS_EQUAL: 'Menor o igual'
}

/**
 * Genera un ID único para tokens
 */
export const generateTokenId = () => {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Crea un token de texto
 */
export const createTextToken = (content) => ({
  id: generateTokenId(),
  type: TOKEN_TYPE.TEXT,
  content
})

/**
 * Crea un token de variable
 */
export const createVariableToken = (name) => ({
  id: generateTokenId(),
  type: TOKEN_TYPE.VARIABLE,
  name
})

/**
 * Crea un token de variable calculada
 */
export const createCalculatedToken = (name) => ({
  id: generateTokenId(),
  type: TOKEN_TYPE.CALCULATED,
  name
})

