import React, { useState, useEffect } from 'react'
import { FaFileImport, FaFilter } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'
import { useAppStore } from '../context/AppState'
import { loadExcelFile, loadCSVFile } from '../logic/excelLoader'
import { applyFilters, getUniqueValues } from '../logic/filterManager'
import { createVariableToken } from '../types'
import { FILTER_CONDITION } from '../types'

const ExcelViewer = () => {
  const {
    data,
    filteredData,
    columnNames,
    excelFilePath,
    activeFilters,
    setExcelData,
    setFilteredData,
    setFilter,
    removeFilter,
    addToken
  } = useAppStore()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filterColumn, setFilterColumn] = useState(null)
  
  // Aplicar filtros cuando cambien
  useEffect(() => {
    if (data.length > 0) {
      const filtered = applyFilters(data, activeFilters)
      setFilteredData(filtered)
    }
  }, [data, activeFilters, setFilteredData])
  
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setLoading(true)
    setError(null)
    
    try {
      let result
      if (file.name.endsWith('.csv')) {
        result = await loadCSVFile(file)
      } else {
        result = await loadExcelFile(file)
      }
      
      setExcelData(result.data, result.columnNames, file.name)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleColumnDragStart = (e, columnName) => {
    e.dataTransfer.setData('columnName', columnName)
    e.dataTransfer.effectAllowed = 'copy'
  }
  
  const handleColumnClick = (columnName) => {
    // Insertar token de variable usando la función global
    if (window.insertVariableInTemplate) {
      window.insertVariableInTemplate(columnName)
    } else {
      // Fallback: insertar directamente
      const token = createVariableToken(columnName)
      addToken(token)
    }
  }
  
  const handleFilterClick = (columnName) => {
    setFilterColumn(columnName)
    setShowFilterModal(true)
  }
  
  const handleRemoveFilter = (columnName) => {
    removeFilter(columnName)
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-dark-panel rounded-lg">
        <label className="cursor-pointer flex flex-col items-center gap-4 p-8 border-2 border-dashed border-dark-border rounded-lg hover:border-primary transition-colors">
          <FaFileImport size={48} className="text-gray-400" />
          <span className="text-lg font-medium">
            {loading ? 'Cargando...' : 'Cargar archivo Excel o CSV'}
          </span>
          <span className="text-sm text-gray-400">
            Formatos: .xlsx, .xls, .csv
          </span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
        </label>
        {error && (
          <div className="mt-4 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col bg-dark-panel rounded-lg overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-center justify-between p-3 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Datos de Excel</h3>
          <span className="text-sm text-gray-400">
            ({filteredData.length} de {data.length} filas)
          </span>
        </div>
        
        <label className="px-3 py-1.5 bg-primary hover:bg-primary-hover rounded-lg cursor-pointer transition-colors text-sm">
          Cambiar archivo
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      
      {/* Filtros activos */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="px-3 py-2 bg-dark-card border-b border-dark-border">
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([col, filter]) => (
              <div 
                key={col} 
                className="flex items-center gap-2 px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs"
              >
                <FaFilter size={10} />
                <span className="font-medium">{col}</span>
                <span>·</span>
                <span>{filter.condicion}</span>
                <button
                  onClick={() => handleRemoveFilter(col)}
                  className="ml-1 hover:bg-blue-600/30 rounded p-0.5"
                >
                  <MdClose size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tabla */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-dark-panel z-10">
            <tr>
              {columnNames.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left border-b border-dark-border group cursor-pointer"
                  draggable="true"
                  onDragStart={(e) => handleColumnDragStart(e, col)}
                  onClick={() => handleColumnClick(col)}
                  title="Arrastra para insertar o haz clic"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{col}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFilterClick(col)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-hover rounded transition-opacity"
                      title="Filtrar"
                    >
                      <FaFilter size={12} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, 100).map((row, idx) => (
              <tr 
                key={idx}
                className="hover:bg-dark-hover transition-colors"
              >
                {columnNames.map((col) => (
                  <td 
                    key={col}
                    className="px-3 py-2 border-b border-dark-border/50"
                  >
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length > 100 && (
          <div className="p-3 text-center text-sm text-gray-400">
            Mostrando las primeras 100 filas de {filteredData.length}
          </div>
        )}
      </div>
      
      {/* Modal de filtro */}
      {showFilterModal && (
        <FilterModal
          column={filterColumn}
          data={data}
          currentFilter={activeFilters[filterColumn]}
          onApply={(condition, values) => {
            setFilter(filterColumn, condition, values)
            setShowFilterModal(false)
          }}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  )
}

// Modal de filtro
const FilterModal = ({ column, data, currentFilter, onApply, onClose }) => {
  const [condition, setCondition] = useState(currentFilter?.condicion || FILTER_CONDITION.EQUAL)
  const [selectedValues, setSelectedValues] = useState(currentFilter?.valores || [])
  const [manualValue, setManualValue] = useState('')
  
  const uniqueValues = getUniqueValues(data, column)
  
  const handleToggleValue = (value) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value))
    } else {
      setSelectedValues([...selectedValues, value])
    }
  }
  
  const handleAddManualValue = () => {
    if (manualValue && !selectedValues.includes(manualValue)) {
      setSelectedValues([...selectedValues, manualValue])
      setManualValue('')
    }
  }
  
  const handleApply = () => {
    if (selectedValues.length > 0) {
      onApply(condition, selectedValues)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-panel rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h3 className="font-semibold">Filtrar: {column}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-hover rounded transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Condición */}
          <div>
            <label className="block text-sm font-medium mb-2">Condición</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border focus:outline-none focus:border-primary"
            >
              {Object.values(FILTER_CONDITION).map((cond) => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </div>
          
          {/* Valor manual */}
          <div>
            <label className="block text-sm font-medium mb-2">Valor</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManualValue()}
                placeholder="Escribe un valor..."
                className="flex-1 bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleAddManualValue}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
          
          {/* Valores seleccionados */}
          {selectedValues.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Valores seleccionados</label>
              <div className="flex flex-wrap gap-2">
                {selectedValues.map((val) => (
                  <span
                    key={val}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-sm"
                  >
                    {val}
                    <button
                      onClick={() => handleToggleValue(val)}
                      className="hover:bg-blue-600/30 rounded p-0.5"
                    >
                      <MdClose size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Valores únicos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Valores disponibles ({uniqueValues.length})
            </label>
            <div className="max-h-48 overflow-y-auto scrollbar-thin bg-dark-card rounded-lg p-2 space-y-1">
              {uniqueValues.slice(0, 100).map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-dark-hover rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(val)}
                    onChange={() => handleToggleValue(val)}
                    className="rounded"
                  />
                  <span className="text-sm">{val}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 p-4 border-t border-dark-border">
          <button
            onClick={handleApply}
            disabled={selectedValues.length === 0}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary-disabled rounded-lg transition-colors"
          >
            Aplicar filtro
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

export default ExcelViewer

