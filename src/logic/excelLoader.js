import * as XLSX from 'xlsx'

/**
 * Carga un archivo Excel y devuelve los datos como array de objetos
 */
export const loadExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Obtener la primera hoja
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          raw: false // Convertir todo a string
        })
        
        if (jsonData.length === 0) {
          reject(new Error('El archivo Excel está vacío'))
          return
        }
        
        // Obtener nombres de columnas
        const columnNames = Object.keys(jsonData[0])
        
        resolve({
          data: jsonData,
          columnNames,
          fileName: file.name
        })
      } catch (error) {
        reject(new Error(`Error al leer el archivo Excel: ${error.message}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Exporta datos a un archivo Excel
 */
export const exportToExcel = (data, fileName = 'export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  
  XLSX.writeFile(workbook, fileName)
}

/**
 * Carga un archivo CSV
 */
export const loadCSVFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const workbook = XLSX.read(text, { type: 'string' })
        
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          raw: false
        })
        
        if (jsonData.length === 0) {
          reject(new Error('El archivo CSV está vacío'))
          return
        }
        
        const columnNames = Object.keys(jsonData[0])
        
        resolve({
          data: jsonData,
          columnNames,
          fileName: file.name
        })
      } catch (error) {
        reject(new Error(`Error al leer el archivo CSV: ${error.message}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }
    
    reader.readAsText(file)
  })
}

