import { create } from 'zustand'
import { TOKEN_TYPE, createTextToken, createVariableToken, createCalculatedToken } from '../types'

/**
 * Store global de la aplicación usando Zustand
 */
export const useAppStore = create((set, get) => ({
  // Datos del Excel
  data: [],
  filteredData: [],
  columnNames: [],
  excelFilePath: null,
  
  // Plantilla como array de tokens
  templateTokens: [createTextToken('')],
  
  // Variables calculadas: { nombreVariable: 'formula' }
  calculatedVars: {},
  
  // Token activo para edición
  activeTokenId: null,
  
  // Filtros activos: { columna: { condicion: 'Igual a', valores: [...] } }
  activeFilters: {},
  
  // Textos generados
  generatedTexts: [],
  
  // ======================
  // ACCIONES DE EXCEL
  // ======================
  
  setExcelData: (data, columnNames, filePath) => {
    set({ 
      data, 
      filteredData: data,
      columnNames, 
      excelFilePath: filePath 
    })
  },
  
  setFilteredData: (filteredData) => {
    set({ filteredData })
  },
  
  // ======================
  // ACCIONES DE TOKENS
  // ======================
  
  setTemplateTokens: (tokens) => {
    set({ templateTokens: tokens })
  },
  
  addToken: (token, position = null) => {
    const { templateTokens } = get()
    if (position === null) {
      set({ templateTokens: [...templateTokens, token] })
    } else {
      const newTokens = [...templateTokens]
      newTokens.splice(position, 0, token)
      set({ templateTokens: newTokens })
    }
  },
  
  updateToken: (tokenId, updates) => {
    const { templateTokens } = get()
    const newTokens = templateTokens.map(token => 
      token.id === tokenId ? { ...token, ...updates } : token
    )
    set({ templateTokens: newTokens })
  },
  
  deleteToken: (tokenId) => {
    const { templateTokens } = get()
    const newTokens = templateTokens.filter(token => token.id !== tokenId)
    set({ templateTokens: newTokens })
  },
  
  insertTokenAtPosition: (position, token) => {
    const { templateTokens } = get()
    const newTokens = [...templateTokens]
    newTokens.splice(position, 0, token)
    set({ templateTokens: newTokens })
  },
  
  setActiveTokenId: (tokenId) => {
    set({ activeTokenId: tokenId })
  },
  
  // ======================
  // ACCIONES DE VARIABLES CALCULADAS
  // ======================
  
  setCalculatedVar: (name, formula) => {
    const { calculatedVars } = get()
    set({ 
      calculatedVars: { ...calculatedVars, [name]: formula }
    })
  },
  
  deleteCalculatedVar: (name) => {
    const { calculatedVars } = get()
    const newVars = { ...calculatedVars }
    delete newVars[name]
    set({ calculatedVars: newVars })
  },
  
  getCalculatedVar: (name) => {
    const { calculatedVars } = get()
    return calculatedVars[name]
  },
  
  // ======================
  // ACCIONES DE FILTROS
  // ======================
  
  setFilter: (column, condition, values) => {
    const { activeFilters } = get()
    set({ 
      activeFilters: { 
        ...activeFilters, 
        [column]: { condicion: condition, valores: values }
      }
    })
  },
  
  removeFilter: (column) => {
    const { activeFilters } = get()
    const newFilters = { ...activeFilters }
    delete newFilters[column]
    set({ activeFilters: newFilters })
  },
  
  clearFilters: () => {
    set({ activeFilters: {} })
  },
  
  // ======================
  // ACCIONES DE TEXTOS GENERADOS
  // ======================
  
  setGeneratedTexts: (texts) => {
    set({ generatedTexts: texts })
  },
  
  // ======================
  // UTILIDADES
  // ======================
  
  /**
   * Resetea el estado completo
   */
  reset: () => {
    set({
      data: [],
      filteredData: [],
      columnNames: [],
      excelFilePath: null,
      templateTokens: [createTextToken('')],
      calculatedVars: {},
      activeTokenId: null,
      activeFilters: {},
      generatedTexts: []
    })
  },
  
  /**
   * Convierte los tokens a string (para guardar plantilla)
   */
  tokensToString: () => {
    const { templateTokens, calculatedVars } = get()
    let result = ''
    
    for (const token of templateTokens) {
      if (token.type === TOKEN_TYPE.TEXT) {
        result += token.content
      } else if (token.type === TOKEN_TYPE.VARIABLE) {
        result += `{{${token.name}}}`
      } else if (token.type === TOKEN_TYPE.CALCULATED) {
        const formula = calculatedVars[token.name]
        result += `{{{${formula}}}}`
      }
    }
    
    return result
  },
  
  /**
   * Convierte string a tokens (para cargar plantilla)
   */
  stringToTokens: (templateString) => {
    const tokens = []
    let currentText = ''
    let i = 0
    
    while (i < templateString.length) {
      // Buscar variables calculadas {{{...}}}
      if (templateString.substr(i, 3) === '{{{') {
        // Guardar texto anterior
        if (currentText) {
          tokens.push(createTextToken(currentText))
          currentText = ''
        }
        
        const endIndex = templateString.indexOf('}}}', i)
        if (endIndex === -1) {
          currentText += templateString.substr(i, 3)
          i += 3
          continue
        }
        
        const formula = templateString.substring(i + 3, endIndex)
        // Generar nombre de variable (ej: Calc_1, Calc_2)
        const varName = `Calc_${tokens.filter(t => t.type === TOKEN_TYPE.CALCULATED).length + 1}`
        tokens.push(createCalculatedToken(varName))
        
        // Guardar fórmula en calculatedVars
        const { setCalculatedVar } = get()
        setCalculatedVar(varName, formula)
        
        i = endIndex + 3
      }
      // Buscar variables simples {{...}}
      else if (templateString.substr(i, 2) === '{{') {
        // Guardar texto anterior
        if (currentText) {
          tokens.push(createTextToken(currentText))
          currentText = ''
        }
        
        const endIndex = templateString.indexOf('}}', i)
        if (endIndex === -1) {
          currentText += templateString.substr(i, 2)
          i += 2
          continue
        }
        
        const varName = templateString.substring(i + 2, endIndex).trim()
        tokens.push(createVariableToken(varName))
        
        i = endIndex + 2
      }
      else {
        currentText += templateString[i]
        i++
      }
    }
    
    // Guardar texto final
    if (currentText) {
      tokens.push(createTextToken(currentText))
    }
    
    // Si no hay tokens, agregar uno vacío
    if (tokens.length === 0) {
      tokens.push(createTextToken(''))
    }
    
    set({ templateTokens: tokens })
  },
  
  /**
   * Obtiene el estado completo para guardar
   */
  getStateForSave: () => {
    const { 
      templateTokens, 
      calculatedVars, 
      activeFilters, 
      excelFilePath, 
      generatedTexts,
      tokensToString
    } = get()
    
    return {
      template: tokensToString(),
      filters: activeFilters,
      excel_file_name: excelFilePath ? excelFilePath.split('/').pop().split('\\').pop() : '',
      excel_file_path: excelFilePath || '',
      generated_texts: generatedTexts.length > 0 ? generatedTexts : null
    }
  },
  
  /**
   * Carga el estado desde un archivo guardado
   */
  loadStateFromSave: (data) => {
    const { 
      setExcelData, 
      setFilter, 
      setGeneratedTexts, 
      stringToTokens 
    } = get()
    
    // Cargar plantilla
    if (data.template) {
      stringToTokens(data.template)
    }
    
    // Cargar filtros
    if (data.filters) {
      set({ activeFilters: {} })
      for (const [col, filtro] of Object.entries(data.filters)) {
        setFilter(col, filtro.condicion, filtro.valores)
      }
    }
    
    // Cargar textos generados
    if (data.generated_texts) {
      setGeneratedTexts(data.generated_texts)
    }
    
    return data.excel_file_path
  }
}))

