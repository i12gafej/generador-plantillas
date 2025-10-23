import React, { useState, useEffect, useRef } from 'react'
import { MdClose, MdSend, MdFileUpload, MdSkipNext, MdCheck } from 'react-icons/md'
import { IoLogoWhatsapp } from 'react-icons/io5'
import { useAppStore } from '../context/AppState'
import { loadExcelFile, loadCSVFile } from '../logic/excelLoader'

const WhatsAppModal = ({ onClose }) => {
  const { generatedTexts, filteredData, columnNames } = useAppStore()
  
  // Modo de operación: 'same' (mismo archivo) o 'merge' (archivo externo)
  const [mode, setMode] = useState('same')
  
  // Datos del archivo externo de teléfonos
  const [phoneFileData, setPhoneFileData] = useState([])
  const [phoneFileColumns, setPhoneFileColumns] = useState([])
  
  // Configuración de merge
  const [keyColumnMain, setKeyColumnMain] = useState('') // Clave en archivo principal
  const [keyColumnPhone, setKeyColumnPhone] = useState('') // Clave en archivo de teléfonos
  const [phoneColumn, setPhoneColumn] = useState('') // Columna con números
  
  // Configuración existente
  const [selectedPhoneColumn, setSelectedPhoneColumn] = useState('')
  
  // Sistema de envío step-by-step
  const [messages, setMessages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [round, setRound] = useState(1)
  const [isConfigured, setIsConfigured] = useState(false) // Si ya validó y configuró
  const [isValidating, setIsValidating] = useState(false) // Si está validando números
  
  // Refs para scroll automático
  const messageRefs = useRef([])
  const listContainerRef = useRef(null)
  
  const phoneColumns = (columnNames || []).filter(col => 
    col.toLowerCase().includes('tel') || 
    col.toLowerCase().includes('phone') ||
    col.toLowerCase().includes('celular') ||
    col.toLowerCase().includes('movil')
  )
  
  // Cargar archivo externo de teléfonos
  const handleLoadPhoneFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls,.csv'
    
    input.onchange = async (e) => {
      try {
        const file = e.target.files?.[0]
        if (!file) return
        
        let result
        if (file.name.endsWith('.csv')) {
          result = await loadCSVFile(file)
        } else {
          result = await loadExcelFile(file)
        }
        
        setPhoneFileData(result.data || [])
        setPhoneFileColumns(result.columnNames || [])
        
        // Auto-seleccionar columnas comunes
        const commonColumns = (columnNames || []).filter(col => (result.columnNames || []).includes(col))
        if (commonColumns.length > 0) {
          setKeyColumnMain(commonColumns[0])
          setKeyColumnPhone(commonColumns[0])
        }
        
        // Auto-seleccionar columna de teléfono
        const phoneCol = (result.columnNames || []).find(col => 
          col.toLowerCase().includes('tel') || 
          col.toLowerCase().includes('phone') ||
          col.toLowerCase().includes('celular')
        )
        if (phoneCol) {
          setPhoneColumn(phoneCol)
        }
        
      } catch (error) {
        console.error('Error cargando archivo de teléfonos:', error)
        alert(`Error al cargar archivo: ${error.message}`)
      }
    }
    
    input.click()
  }
  
  const cleanPhoneNumber = (phone) => {
    // Remover espacios, guiones, paréntesis
    return phone.toString().replace(/[\s\-\(\)]/g, '')
  }

  /**
   * Valida y normaliza números de teléfono españoles
   * Reglas:
   * 1. 34XXXXXXXXX (11 dígitos: 34 + 9) → Válido, se añade + al inicio
   * 2. XXXXXXXXX (9 dígitos) → Válido, se añade +34
   * 3. +34XXXXXXXXX → Válido tal cual
   * 4. Otros formatos → Inválido
   * 
   * @returns { valid: boolean, normalized: string, warning: string }
   */
  const validateAndNormalizePhone = (rawPhone) => {
    if (!rawPhone) {
      return { valid: false, normalized: '', warning: 'Número vacío' }
    }

    // Limpiar el número (remover espacios, guiones, paréntesis)
    const cleaned = cleanPhoneNumber(rawPhone)
    
    // Extraer solo números y el símbolo +
    const digitsAndPlus = cleaned.replace(/[^\d+]/g, '')
    
    console.log('📞 Validando teléfono:', {
      original: rawPhone,
      cleaned: cleaned,
      digitsAndPlus: digitsAndPlus
    })
    
    // CASO 1: +34XXXXXXXXX (formato perfecto: + seguido de 34 y 9 dígitos)
    if (/^\+34\d{9}$/.test(digitsAndPlus)) {
      return { 
        valid: true, 
        normalized: digitsAndPlus, 
        warning: null 
      }
    }
    
    // CASO 2: 34XXXXXXXXX (11 dígitos: 34 + 9 dígitos, falta el +)
    if (/^34\d{9}$/.test(digitsAndPlus)) {
      return { 
        valid: true, 
        normalized: `+${digitsAndPlus}`, 
        warning: null 
      }
    }
    
    // CASO 3: XXXXXXXXX (exactamente 9 dígitos, falta +34)
    if (/^\d{9}$/.test(digitsAndPlus)) {
      return { 
        valid: true, 
        normalized: `+34${digitsAndPlus}`, 
        warning: null 
      }
    }
    
    // CASO 4: Empieza con 34 pero NO tiene 9 dígitos después
    if (/^34\d/.test(digitsAndPlus) && !/^34\d{9}$/.test(digitsAndPlus)) {
      return { 
        valid: false, 
        normalized: digitsAndPlus, 
        warning: `❌ Número inválido: Empieza con 34 pero no tiene exactamente 9 dígitos después (${digitsAndPlus})` 
      }
    }
    
    // CASO 5: Cualquier otro formato es inválido
    return { 
      valid: false, 
      normalized: digitsAndPlus, 
      warning: `❌ Formato de teléfono inválido: ${digitsAndPlus} (debe ser 9 dígitos, 34+9 dígitos, o +34+9 dígitos)` 
    }
  }
  
  // Obtener el teléfono para una fila
  const getPhoneForRow = (row) => {
    if (mode === 'same') {
      return row[selectedPhoneColumn]
    } else {
      // Buscar en el archivo externo por la clave común
      const keyValue = row[keyColumnMain]
      const phoneRow = phoneFileData.find(pRow => pRow[keyColumnPhone] === keyValue)
      return phoneRow ? phoneRow[phoneColumn] : null
    }
  }
  
  const validatePhoneNumber = (phone, index) => {
    const validation = validateAndNormalizePhone(phone)
    
    if (!validation.valid) {
      console.error(`Fila ${index + 1}: ${validation.warning}`)
      return { success: false, warning: validation.warning, normalized: validation.normalized }
    }
    
    console.log(`✅ Fila ${index + 1}: Teléfono normalizado: ${validation.normalized}`)
    
    return { success: true, warning: validation.warning, normalized: validation.normalized }
  }
  
  const openWhatsApp = (phone, text) => {
    const encodedText = encodeURIComponent(text)
    const url = `https://wa.me/${phone}?text=${encodedText}`
    
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  
  const handleValidateAndConfigure = () => {
    // Validar configuración según el modo
    if (mode === 'same') {
      if (!selectedPhoneColumn) {
        alert('Por favor selecciona una columna de teléfonos')
        return
      }
    } else {
      if (!keyColumnMain || !keyColumnPhone || !phoneColumn) {
        alert('Por favor completa toda la configuración de merge')
        return
      }
      if (phoneFileData.length === 0) {
        alert('Por favor carga el archivo de teléfonos')
        return
      }
    }
    
    setIsValidating(true)
    
    // Preparar todos los mensajes con validación
    const preparedMessages = generatedTexts.map((text, i) => {
      const row = filteredData[i]
      const phone = getPhoneForRow(row)
      const validation = phone ? validatePhoneNumber(phone, i) : { 
        success: false, 
        warning: 'No se encontró teléfono',
        normalized: ''
      }
      
      return {
        index: i,
        phone: validation.normalized,
        text: text,
        rowData: row,
        status: validation.success ? 'pending' : 'invalid',
        valid: validation.success,
        warning: validation.warning
      }
    })
    
    setMessages(preparedMessages)
    setCurrentIndex(preparedMessages.findIndex(m => m.valid))
    setRound(1)
    setIsValidating(false)
    setIsConfigured(true)
  }

  // Marcar mensaje actual como enviado y pasar al siguiente
  const handleNext = () => {
    // Marcar actual como enviado
    const newMessages = [...messages]
    if (currentIndex >= 0 && currentIndex < newMessages.length) {
      newMessages[currentIndex].status = 'sent'
      setMessages(newMessages)
    }
    
    // Buscar siguiente mensaje pendiente o saltado (en segunda vuelta)
    let nextIndex = -1
    for (let i = currentIndex + 1; i < newMessages.length; i++) {
      if (newMessages[i].status === 'pending' || 
          (round === 2 && newMessages[i].status === 'skipped')) {
        nextIndex = i
        break
      }
    }
    
    // Si no hay más adelante, verificar si hay saltados para segunda vuelta
    if (nextIndex === -1 && round === 1) {
      const hasSkipped = newMessages.some(m => m.status === 'skipped')
      if (hasSkipped) {
        // Iniciar segunda vuelta
        setRound(2)
        nextIndex = newMessages.findIndex(m => m.status === 'skipped')
      }
    }
    
    if (nextIndex === -1) {
      // Terminar
      const sentCount = newMessages.filter(m => m.status === 'sent').length
      const skippedCount = newMessages.filter(m => m.status === 'skipped').length
      alert(`✅ Proceso completado!\n\n📤 ${sentCount} mensajes enviados\n⏭️ ${skippedCount} mensajes saltados`)
      onClose()
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  // Saltar mensaje actual
  const handleSkip = () => {
    const newMessages = [...messages]
    if (currentIndex >= 0 && currentIndex < newMessages.length) {
      newMessages[currentIndex].status = 'skipped'
      setMessages(newMessages)
    }
    
    // Buscar siguiente mensaje pendiente o saltado (en segunda vuelta)
    let nextIndex = -1
    for (let i = currentIndex + 1; i < newMessages.length; i++) {
      if (newMessages[i].status === 'pending' || 
          (round === 2 && newMessages[i].status === 'skipped')) {
        nextIndex = i
        break
      }
    }
    
    // Si no hay más adelante, verificar si hay saltados para segunda vuelta
    if (nextIndex === -1 && round === 1) {
      const hasSkipped = newMessages.some(m => m.status === 'skipped')
      if (hasSkipped) {
        // Iniciar segunda vuelta
        setRound(2)
        nextIndex = newMessages.findIndex(m => m.status === 'skipped')
      }
    }
    
    if (nextIndex === -1) {
      // Terminar
      const sentCount = newMessages.filter(m => m.status === 'sent').length
      const skippedCount = newMessages.filter(m => m.status === 'skipped').length
      alert(`✅ Proceso completado!\n\n📤 ${sentCount} mensajes enviados\n⏭️ ${skippedCount} mensajes saltados`)
      onClose()
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  // Enviar mensaje actual
  const handleSendCurrent = () => {
    const msg = messages[currentIndex]
    
    if (!msg || !msg.valid) {
      alert(`Error: ${msg?.warning || 'Mensaje inválido'}`)
      return
    }
    
    // Abrir WhatsApp
    openWhatsApp(msg.phone, msg.text)
  }

  // Seleccionar un mensaje específico
  const handleSelectMessage = (index) => {
    // Permitir seleccionar cualquier mensaje válido (incluidos los enviados)
    if (!messages[index].valid) {
      return // Solo bloquear los inválidos
    }
    setCurrentIndex(index)
  }

  // Scroll automático al mensaje actual
  useEffect(() => {
    if (isConfigured && currentIndex >= 0 && messageRefs.current[currentIndex]) {
      messageRefs.current[currentIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
    }
  }, [currentIndex, isConfigured])
  
  // Calcular estadísticas
  const sentCount = messages.filter(m => m.status === 'sent').length
  const skippedCount = messages.filter(m => m.status === 'skipped').length
  const totalValid = messages.filter(m => m.valid).length

  // Componente para cada fila de mensaje
  const MessageRow = ({ message, isCurrent, onClick }) => {
    const statusConfig = {
      pending: { icon: '⏳', color: 'bg-gray-700', border: 'border-gray-600', text: 'Pendiente' },
      current: { icon: '▶️', color: 'bg-blue-600', border: 'border-blue-400', text: 'Actual' },
      sent: { icon: '✅', color: 'bg-green-600', border: 'border-green-400', text: 'Enviado' },
      skipped: { icon: '⏭️', color: 'bg-orange-600', border: 'border-orange-400', text: 'Saltado' },
      invalid: { icon: '❌', color: 'bg-red-700', border: 'border-red-500', text: 'Inválido' }
    }
    
    const config = statusConfig[message.status] || statusConfig.pending
    const isClickable = message.valid // Permitir click en válidos (incluidos enviados)
    
    return (
      <div
        ref={(el) => (messageRefs.current[message.index] = el)}
        onClick={() => isClickable && onClick(message.index)}
        className={`
          p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${isCurrent ? `${config.color} ${config.border} shadow-lg scale-[1.02]` : 'bg-dark-card border-dark-border hover:border-gray-600'}
          ${!isClickable && 'opacity-60 cursor-not-allowed'}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icono de estado */}
          <div className="text-2xl flex-shrink-0">{config.icon}</div>
          
          {/* Información */}
          <div className="flex-1 min-w-0">
            {/* Teléfono */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono font-semibold">📱 {message.phone || 'Sin teléfono'}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${config.color}`}>
                {config.text}
              </span>
            </div>
            
            {/* Datos del destinatario */}
            <div className="text-xs text-gray-400 mb-2">
              {Object.entries(message.rowData).slice(0, 3).map(([key, val]) => (
                <span key={key} className="mr-3">
                  <strong>{key}:</strong> {val}
                </span>
              ))}
            </div>
            
            {/* Preview del mensaje */}
            <div className="text-sm text-gray-300 bg-dark-bg rounded p-2 line-clamp-2">
              💬 {message.text.substring(0, 100)}{message.text.length > 100 ? '...' : ''}
            </div>
            
            {/* Warning si existe */}
            {message.warning && (
              <div className="text-xs text-yellow-400 mt-2">
                {message.warning}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-panel rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <IoLogoWhatsapp size={24} className="text-green-500" />
            <div>
              <h3 className="font-semibold text-lg">
                {isConfigured ? 'Enviar a WhatsApp' : 'Configurar WhatsApp'}
              </h3>
              {isConfigured && (
                <p className="text-xs text-gray-400">
                  {sentCount}/{totalValid} enviados | Vuelta {round}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-hover rounded transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>
        
        {/* Contenido */}
        {!isConfigured ? (
          <div className="p-4 space-y-4 overflow-y-auto">
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 text-sm text-blue-300">
            ℹ️ Se validarán {generatedTexts.length} números de teléfono según las reglas españolas (+34 con 9 dígitos).
          </div>
          
          {/* Selector de modo */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Origen de números de teléfono
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('same')}
                disabled={isValidating}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                  mode === 'same' 
                    ? 'bg-primary text-white' 
                    : 'bg-dark-card text-gray-400 hover:bg-dark-hover'
                }`}
              >
                Mismo archivo
              </button>
              <button
                onClick={() => setMode('merge')}
                disabled={isValidating}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                  mode === 'merge' 
                    ? 'bg-primary text-white' 
                    : 'bg-dark-card text-gray-400 hover:bg-dark-hover'
                }`}
              >
                Archivo externo
              </button>
            </div>
          </div>
          
          {/* Modo: Mismo archivo */}
          {mode === 'same' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Columna de teléfonos *
              </label>
              <select
                value={selectedPhoneColumn}
                onChange={(e) => setSelectedPhoneColumn(e.target.value)}
                className="w-full bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border focus:outline-none focus:border-primary"
                disabled={isValidating}
              >
                <option value="">Selecciona una columna...</option>
                {phoneColumns.length > 0 ? (
                  phoneColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))
                ) : (
                  (columnNames || []).map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))
                )}
              </select>
            </div>
          )}
          
          {/* Modo: Archivo externo (Merge) */}
          {mode === 'merge' && (
            <div className="space-y-3">
              {/* Cargar archivo */}
              <div>
                <button
                  onClick={handleLoadPhoneFile}
                  disabled={isValidating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-card hover:bg-dark-hover border border-dashed border-gray-600 rounded-lg transition-colors"
                >
                  <MdFileUpload size={20} />
                  <span>
                    {phoneFileData.length > 0 
                      ? `✅ Archivo cargado (${phoneFileData.length} filas)` 
                      : 'Cargar archivo de teléfonos'}
                  </span>
                </button>
              </div>
              
              {phoneFileData.length > 0 && (
                <>
                  {/* Clave común en archivo principal */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Clave común (Archivo principal) *
                    </label>
                    <select
                      value={keyColumnMain}
                      onChange={(e) => setKeyColumnMain(e.target.value)}
                      className="w-full bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border focus:outline-none focus:border-primary"
                      disabled={isValidating}
                    >
                      <option value="">Selecciona una columna...</option>
                      {(columnNames || []).map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Clave común en archivo de teléfonos */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Clave común (Archivo de teléfonos) *
                    </label>
                    <select
                      value={keyColumnPhone}
                      onChange={(e) => setKeyColumnPhone(e.target.value)}
                      className="w-full bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border focus:outline-none focus:border-primary"
                      disabled={isValidating}
                    >
                      <option value="">Selecciona una columna...</option>
                      {phoneFileColumns && phoneFileColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Columna de teléfonos en archivo externo */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Columna de teléfonos *
                    </label>
                    <select
                      value={phoneColumn}
                      onChange={(e) => setPhoneColumn(e.target.value)}
                      className="w-full bg-dark-card text-white px-3 py-2 rounded-lg border border-dark-border focus:outline-none focus:border-primary"
                      disabled={isValidating}
                    >
                      <option value="">Selecciona una columna...</option>
                      {phoneFileColumns && phoneFileColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Preview del merge */}
                  {keyColumnMain && keyColumnPhone && phoneColumn && (
                    <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3 text-sm text-green-300">
                      ✅ Merge configurado: {keyColumnMain} (principal) ↔ {keyColumnPhone} (teléfonos) → {phoneColumn}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {/* Info de validación */}
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3 text-sm text-yellow-300">
            ℹ️ Validación automática de números españoles:
            <ul className="mt-2 ml-4 list-disc text-xs">
              <li>9 dígitos → Se añade +34</li>
              <li>34 + 9 dígitos → Se añade +</li>
              <li>+34 + 9 dígitos → Formato correcto</li>
              <li>Otros formatos → Advertencia de número extranjero</li>
            </ul>
          </div>
          
          {/* Botón de validar y configurar */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleValidateAndConfigure}
              disabled={
                (mode === 'same' && !selectedPhoneColumn) ||
                (mode === 'merge' && (!keyColumnMain || !keyColumnPhone || !phoneColumn || phoneFileData.length === 0))
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              <MdCheck size={18} />
              <span>Validar y Continuar</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-hover hover:bg-dark-border rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
        ) : (
          /* Vista de envío step-by-step */
          <>
            {/* Lista de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, i) => (
                <MessageRow
                  key={i}
                  message={msg}
                  isCurrent={currentIndex === i}
                  onClick={handleSelectMessage}
                />
              ))}
            </div>
            
            {/* Acciones de envío */}
            <div className="flex-shrink-0 p-4 border-t border-dark-border space-y-3">
              {/* Info del mensaje actual */}
              {messages[currentIndex] && (
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300">
                      📤 Mensaje {currentIndex + 1} de {messages.length}
                    </span>
                    <span className="text-gray-400">
                      📱 {messages[currentIndex].phone}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={handleSendCurrent}
                  disabled={!messages[currentIndex]?.valid}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
                >
                  <IoLogoWhatsapp size={20} />
                  <span>Abrir WhatsApp</span>
                </button>
                
                <button
                  onClick={handleSkip}
                  disabled={!messages[currentIndex]?.valid}
                  className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-900 disabled:cursor-not-allowed rounded-lg transition-colors"
                  title="Saltar este mensaje"
                >
                  <MdSkipNext size={20} />
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!messages[currentIndex]}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
                  title="Marcar como enviado y siguiente"
                >
                  <MdCheck size={20} />
                </button>
              </div>
              
              <div className="text-xs text-gray-400 text-center">
                💡 Tip: Abre WhatsApp → Envía el mensaje → Vuelve aquí → Clic en ✓ para continuar
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WhatsAppModal

