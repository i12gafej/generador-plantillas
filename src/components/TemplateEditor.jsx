import React, { useRef, useState, useEffect, Fragment } from 'react'
import { useAppStore } from '../context/AppState'
import { TOKEN_TYPE, createTextToken, createVariableToken } from '../types'
import VariableChip from './VariableChip'

/**
 * Editor híbrido con overlay visual
 * Textarea invisible + overlay con chips visuales
 */
const TemplateEditor = () => {
  const {
    templateTokens,
    activeTokenId,
    setActiveTokenId,
    updateToken,
    deleteToken,
    setTemplateTokens,
    addToken
  } = useAppStore()
  
  const editorRef = useRef(null)
  const textareaRef = useRef(null)
  const overlayRef = useRef(null)
  const [content, setContent] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragVariable, setDragVariable] = useState(null)
  const [dragOverPosition, setDragOverPosition] = useState(null)
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null)
  
  // Inicializar contenido desde el primer token de texto
  useEffect(() => {
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      setContent(templateTokens[0].content)
    } else {
      // Si no hay contenido, inicializar cursor en posición 0
      setContent('')
      setCursorPosition(0)
      setSelectionRange({ start: 0, end: 0 })
    }
  }, [templateTokens])
  
  // Asegurar que el cursor esté en posición 0 cuando el contenido está vacío
  useEffect(() => {
    if (!content || content.length === 0) {
      setCursorPosition(0)
      setSelectionRange({ start: 0, end: 0 })
    }
  }, [content])
  
  const handleEditorClick = (e) => {
    setActiveTokenId(null)
  }

  // Manejar clic en el overlay para sincronizar cursor
  const handleOverlayClick = (e) => {
    e.stopPropagation()
    
    const textarea = textareaRef.current
    if (!textarea) return

    // Hacer foco en el textarea
    textarea.focus()

    // Intentar obtener la posición exacta del clic usando CaretPositionFromPoint
    let clickPosition = 0
    
    try {
      if (document.caretPositionFromPoint) {
        const caretPos = document.caretPositionFromPoint(e.clientX, e.clientY)
        console.log('🖱️ Click detected:', {
          clientX: e.clientX,
          clientY: e.clientY,
          caretPos: caretPos
        })
        
        if (caretPos && caretPos.offsetNode) {
          const node = caretPos.offsetNode
          const offset = caretPos.offset
          
          console.log('📝 Click node info:', {
            nodeType: node.nodeType,
            textContent: node.textContent,
            offset: offset
          })
          
          // Si es un nodo de texto
          if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent
            const beforeText = textContent.substring(0, offset)
            
            // Encontrar posición en el contenido completo
            const fullText = content
            const textIndex = fullText.indexOf(textContent)
            if (textIndex !== -1) {
              clickPosition = textIndex + beforeText.length
              console.log('✅ Click position calculated:', clickPosition)
            }
          }
          // Si es un elemento (como un chip)
          else if (node.nodeType === Node.ELEMENT_NODE) {
            // Buscar si hay texto antes del elemento
            const parsed = parseContent(content)
            let charCount = 0
            
            for (const part of parsed) {
              if (part.type === 'variable') {
                const variablePlaceholder = `{{${part.name}}}`
                // Si el offset apunta antes del chip, usar charCount
                if (offset === 0) {
                  clickPosition = charCount
                  break
                }
                // Si el offset apunta después del chip, usar charCount + length
                else if (offset > 0) {
                  clickPosition = charCount + variablePlaceholder.length
                  break
                }
                charCount += variablePlaceholder.length
              } else {
                charCount += part.content.length
              }
            }
            console.log('✅ Click position (element):', clickPosition)
          }
        }
      }
      // Fallback para Firefox
      else if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(e.clientX, e.clientY)
        
        if (range && range.startContainer) {
          const node = range.startContainer
          const offset = range.startOffset
          
          if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent
            const beforeText = textContent.substring(0, offset)
            
            const fullText = content
            const textIndex = fullText.indexOf(textContent)
            if (textIndex !== -1) {
              clickPosition = textIndex + beforeText.length
              console.log('✅ Click position (Firefox):', clickPosition)
            }
          }
        }
      }
    } catch (error) {
      console.warn('❌ Click position detection failed:', error)
      clickPosition = 0
    }

    // Sincronizar el cursor del textarea con la posición calculada
    if (clickPosition >= 0 && clickPosition <= content.length) {
      textarea.setSelectionRange(clickPosition, clickPosition)
      setCursorPosition(clickPosition)
      setSelectionRange({ start: clickPosition, end: clickPosition })
      
      console.log('🎯 Cursor synchronized:', {
        clickPosition: clickPosition,
        contentLength: content.length
      })
    }

    // Deseleccionar variables activas
    setActiveTokenId(null)
  }
  
  const handleTextChange = (e) => {
    const newContent = e.target.value
    const newCursorPos = e.target.selectionStart
    const newSelectionStart = e.target.selectionStart
    const newSelectionEnd = e.target.selectionEnd

    // Actualizar estados
    setCursorPosition(newCursorPos)
    setSelectionRange({ start: newSelectionStart, end: newSelectionEnd })
    setContent(newContent)

    // Actualizar el primer token de texto
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      updateToken(templateTokens[0].id, { content: newContent })
    } else {
      const newToken = createTextToken(newContent)
      setTemplateTokens([newToken])
    }

    // Deseleccionar variables activas si se modificó el contenido
    if (activeTokenId) {
      setActiveTokenId(null)
    }
  }
  
  const handleTextFocus = (e) => {
    setCursorPosition(e.target.selectionStart)
    setSelectionRange({ start: e.target.selectionStart, end: e.target.selectionEnd })
  }
  
  const handleTextSelection = (e) => {
    setCursorPosition(e.target.selectionStart)
    setSelectionRange({ start: e.target.selectionStart, end: e.target.selectionEnd })
  }
  
  const handleTextKeyDown = (e) => {
    // Dejar que el textarea maneje todo nativamente
    // No interferir con ninguna tecla
  }

  // Manejar navegación con flechas
  const handleArrowNavigation = (e) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const currentPos = textarea.selectionStart
    const parsed = parseContent(content)
    
    // Debug: mostrar información
    console.log('Arrow navigation:', {
      key: e.key,
      currentPos,
      content: content.substring(Math.max(0, currentPos - 5), currentPos + 5),
      activeTokenId
    })
    
    // Si ya tenemos una variable activa, manejar salida
    if (activeTokenId && activeTokenId.startsWith('var_')) {
      e.preventDefault()
      
      // Buscar la variable activa
      const varName = activeTokenId.replace('var_', '')
      const variablePlaceholder = `{{${varName}}}`
      const start = content.indexOf(variablePlaceholder)
      const end = start + variablePlaceholder.length
      
      console.log('Exiting variable:', { varName, start, end, currentPos })
      
      if (e.key === 'ArrowLeft') {
        // Salir por la izquierda (antes de la variable)
        textarea.setSelectionRange(start, start)
        setCursorPosition(start)
        setSelectionRange({ start: start, end: start })
        setActiveTokenId(null)
      } else if (e.key === 'ArrowRight') {
        // Salir por la derecha (después de la variable)
        textarea.setSelectionRange(end, end)
        setCursorPosition(end)
        setSelectionRange({ start: end, end: end })
    setActiveTokenId(null)
      }
      return
    }
    
    // Si no hay variable activa, verificar si podemos entrar a una
    let charCount = 0
    let targetVariable = null
    
    for (const part of parsed) {
      if (part.type === 'variable') {
        const variablePlaceholder = `{{${part.name}}}`
        const start = charCount
        const end = charCount + variablePlaceholder.length
        
        console.log('Checking variable:', { 
          name: part.name, 
          start, 
          end, 
          currentPos, 
          key: e.key 
        })
        
        if (e.key === 'ArrowRight' && currentPos === start) {
          // Cursor justo antes de una variable, flecha derecha
          targetVariable = part.name
          console.log('Found target variable (right):', targetVariable)
          break
        } else if (e.key === 'ArrowLeft' && currentPos === end) {
          // Cursor justo después de una variable, flecha izquierda
          targetVariable = part.name
          console.log('Found target variable (left):', targetVariable)
          break
        }
        
        charCount += variablePlaceholder.length
      } else {
        charCount += part.content.length
      }
    }
    
    if (targetVariable) {
      // Entrar a la variable
      e.preventDefault()
      console.log('Selecting variable:', targetVariable)
      selectVariable(targetVariable)
    }
    // Si no hay variable objetivo, permitir navegación normal
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    const columnName = e.dataTransfer.getData('columnName')
    const variableMove = e.dataTransfer.getData('variableMove')
    
    if (columnName) {
      // Drop desde Excel
      insertVariableAtCursor(columnName)
    } else if (variableMove && dragPreviewPosition !== null) {
      // Drop de variable movida
      moveVariableToPosition(variableMove, dragPreviewPosition)
    }
    
    // Limpiar estados de drag
    setIsDragging(false)
    setDragVariable(null)
    setDragOverPosition(null)
    setDragPreviewPosition(null)
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    
    if (isDragging && dragVariable) {
      const textarea = textareaRef.current
      if (!textarea) return
      
      let cursorPos = 0
      let methodUsed = 'none'
      
      // DIAGNÓSTICO: Log de información del sistema
      console.log('🔍 DIAGNÓSTICO DEL SISTEMA:', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        caretPositionFromPoint: !!document.caretPositionFromPoint,
        caretRangeFromPoint: !!document.caretRangeFromPoint,
        elementFromPoint: !!document.elementFromPoint,
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        screenX: e.screenX,
        screenY: e.screenY
      })
      
      // ESTRATEGIA 1: CaretPositionFromPoint (Chrome/Edge/Brave)
      if (document.caretPositionFromPoint) {
        try {
          const caretPos = document.caretPositionFromPoint(e.clientX, e.clientY)
          console.log('📍 CaretPositionFromPoint result:', caretPos)
          
          if (caretPos && caretPos.offsetNode) {
            const textNode = caretPos.offsetNode
            const offset = caretPos.offset
            
            console.log('📝 Text node info:', {
              nodeType: textNode.nodeType,
              textContent: textNode.textContent,
              offset: offset
            })
            
            if (textNode.nodeType === Node.TEXT_NODE) {
              const textContent = textNode.textContent
              const beforeText = textContent.substring(0, offset)
              
              // Encontrar posición en el contenido completo
              const fullText = content
              const textIndex = fullText.indexOf(textContent)
              if (textIndex !== -1) {
                cursorPos = textIndex + beforeText.length
                methodUsed = 'CaretPositionFromPoint'
                console.log('✅ CaretPositionFromPoint success:', cursorPos)
              }
            }
          }
        } catch (error) {
          console.warn('❌ CaretPositionFromPoint failed:', error)
        }
      }
      
      // ESTRATEGIA 2: CaretRangeFromPoint (Firefox)
      if (cursorPos === 0 && document.caretRangeFromPoint) {
        try {
          const range = document.caretRangeFromPoint(e.clientX, e.clientY)
          console.log('📍 CaretRangeFromPoint result:', range)
          
          if (range && range.startContainer) {
            const textNode = range.startContainer
            const offset = range.startOffset
            
            console.log('📝 Range node info:', {
              nodeType: textNode.nodeType,
              textContent: textNode.textContent,
              offset: offset
            })
            
            if (textNode.nodeType === Node.TEXT_NODE) {
              const textContent = textNode.textContent
              const beforeText = textContent.substring(0, offset)
              
              // Encontrar posición en el contenido completo
              const fullText = content
              const textIndex = fullText.indexOf(textContent)
              if (textIndex !== -1) {
                cursorPos = textIndex + beforeText.length
                methodUsed = 'CaretRangeFromPoint'
                console.log('✅ CaretRangeFromPoint success:', cursorPos)
              }
            }
          }
        } catch (error) {
          console.warn('❌ CaretRangeFromPoint failed:', error)
        }
      }
      
      // ESTRATEGIA 3: Usar overlay transparente para captura de coordenadas
      if (cursorPos === 0) {
        try {
          console.log('🔄 Using overlay method...')
          
          // Obtener el overlay visual (Capa 1)
          const overlay = overlayRef.current
          if (!overlay) {
            console.warn('⚠️ Overlay not found')
            cursorPos = 0
          } else {
            // Intentar CaretPositionFromPoint en el overlay
            const overlayCaretPos = document.caretPositionFromPoint(e.clientX, e.clientY)
            console.log('📍 Overlay CaretPositionFromPoint:', overlayCaretPos)
            
            if (overlayCaretPos && overlayCaretPos.offsetNode && overlayCaretPos.offsetNode.nodeType === Node.TEXT_NODE) {
              const textNode = overlayCaretPos.offsetNode
              const offset = overlayCaretPos.offset
              const textContent = textNode.textContent
              const beforeText = textContent.substring(0, offset)
              
              // Encontrar posición en el contenido completo
              const fullText = content
              const textIndex = fullText.indexOf(textContent)
              if (textIndex !== -1) {
                cursorPos = textIndex + beforeText.length
                methodUsed = 'Overlay CaretPositionFromPoint'
                console.log('✅ Overlay method success:', cursorPos)
              }
            }
          }
        } catch (error) {
          console.warn('❌ Overlay method failed:', error)
          cursorPos = 0
        }
      }
      
      // ESTRATEGIA 4: Cálculo manual de posición (Último recurso)
      if (cursorPos === 0) {
        try {
          console.log('🔄 Using manual calculation...')
          
          // Obtener posición relativa del mouse dentro del textarea
          const rect = textarea.getBoundingClientRect()
          const relativeX = e.clientX - rect.left
          const relativeY = e.clientY - rect.top
          
          console.log('📐 Manual calculation:', {
            rect: rect,
            relativeX: relativeX,
            relativeY: relativeY
          })
          
          // Calcular posición aproximada basada en caracteres
          const charWidth = 8 // Aproximación del ancho de carácter
          const lineHeight = 20 // Aproximación de la altura de línea
          const charsPerLine = Math.floor(rect.width / charWidth)
          const lineNumber = Math.floor(relativeY / lineHeight)
          const charInLine = Math.floor(relativeX / charWidth)
          
          cursorPos = Math.min(
            lineNumber * charsPerLine + charInLine,
            content.length
          )
          
          methodUsed = 'Manual Calculation'
          console.log('✅ Manual calculation success:', cursorPos)
          
        } catch (error) {
          console.warn('❌ Manual calculation failed:', error)
          cursorPos = 0
        }
      }
      
      // Actualizar estados con la posición calculada
      if (cursorPos >= 0 && cursorPos <= content.length) {
        setDragPreviewPosition(cursorPos)
        setCursorPosition(cursorPos)
        setSelectionRange({ start: cursorPos, end: cursorPos })
        
        // Actualizar el textarea real
        textarea.setSelectionRange(cursorPos, cursorPos)
        
        console.log('🎯 Final result:', {
          cursorPos: cursorPos,
          methodUsed: methodUsed,
          contentLength: content.length
        })
      } else {
        console.warn('⚠️ Invalid cursor position:', cursorPos)
      }
    }
  }
  
  const handleDragLeave = (e) => {
    // Solo limpiar si realmente salimos del área del editor
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragPreviewPosition(null)
    }
  }
  
  
  // Mover variable a posición específica
  const moveVariableToPosition = (varName, newPosition) => {
    const variablePlaceholder = `{{${varName}}}`
    const withoutVar = content.replace(variablePlaceholder, '')
    const before = withoutVar.substring(0, newPosition)
    const after = withoutVar.substring(newPosition)
    const newContent = before + variablePlaceholder + after
    
    setContent(newContent)
    
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      updateToken(templateTokens[0].id, { content: newContent })
    }
    
    // Posicionar cursor después de la variable
    setTimeout(() => {
      const textarea = textareaRef.current
      if (textarea) {
        const finalPosition = before.length + variablePlaceholder.length
        textarea.focus()
        textarea.setSelectionRange(finalPosition, finalPosition)
        setCursorPosition(finalPosition)
        setSelectionRange({ start: finalPosition, end: finalPosition })
      }
    }, 0)
  }
  
  const insertVariableAtCursor = (columnName) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const cursorPos = textarea.selectionStart
    const currentContent = textarea.value
    const beforeCursor = currentContent.substring(0, cursorPos)
    const afterCursor = currentContent.substring(cursorPos)
    
    // Crear nuevo contenido con la variable insertada
    const variablePlaceholder = `{{${columnName}}}`
    const newContent = beforeCursor + variablePlaceholder + afterCursor
    
    // Actualizar el contenido
    setContent(newContent)
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      updateToken(templateTokens[0].id, { content: newContent })
    } else {
      const newToken = createTextToken(newContent)
      setTemplateTokens([newToken])
    }
    
    // Restaurar posición del cursor después de la variable
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = cursorPos + variablePlaceholder.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      setCursorPosition(newCursorPos)
      setSelectionRange({ start: newCursorPos, end: newCursorPos })
    }, 0)
  }
  
  // Exponer función para insertar variables desde ExcelViewer
  useEffect(() => {
    window.insertVariableInTemplate = insertVariableAtCursor
  }, [templateTokens])

  // Capturar clics en variables (enlaces)
  useEffect(() => {
    const handleVariableClick = (e) => {
      if (e.target.classList.contains('variable-link')) {
        e.preventDefault()
        const varName = e.target.getAttribute('data-var-name')
        if (varName) {
          selectVariable(varName)
        }
      }
    }

    const editor = textareaRef.current
    if (editor) {
      editor.addEventListener('click', handleVariableClick)
      return () => editor.removeEventListener('click', handleVariableClick)
    }
  }, [])
  
  // Obtener el contenido actual del primer token de texto
  const getCurrentContent = () => {
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      return templateTokens[0].content
    }
    return ''
  }
  
  // Detectar si una variable es concatenada
  const isConcatenatedVariable = (varName) => {
    // Si el nombre empieza con = y contiene comillas, es concatenada
    if (varName.startsWith('=')) {
      return varName.includes('"') || varName.includes("'")
    }
    return false
  }

  // Parser que convierte {{variable}} en elementos visuales
  const parseContent = (text) => {
    if (!text) return []
    
    const parts = text.split(/(\{\{[^}]+\}\})/)
    return parts.map((part, index) => {
      if (part.match(/\{\{[^}]+\}\}/)) {
        const varName = part.replace(/\{\{|\}\}/g, '')
        return {
          type: 'variable',
          name: varName,
          isConcatenated: isConcatenatedVariable(varName),
          key: `var_${index}_${varName}`,
          start: text.indexOf(part),
          end: text.indexOf(part) + part.length
        }
      }
      return {
        type: 'text',
        content: part,
        key: `text_${index}`
      }
    }).filter(part => part.content !== '' || part.type === 'variable')
  }
  
  // Seleccionar variable en el textarea
  const selectVariable = (varName) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = content.indexOf(`{{${varName}}}`)
    const end = start + `{{${varName}}}`.length
    
    if (start !== -1) {
      // NO seleccionar el texto, solo posicionar el cursor después de la variable
      textarea.setSelectionRange(end, end)
      textarea.focus()
      
      // Buscar el token real que corresponde a esta variable
      // Como trabajamos con un solo token de texto, necesitamos crear un ID virtual
      // pero consistente basado en el nombre de la variable
      const tokenId = `var_${varName}`
      
      // Crear un token virtual para el FormulaBar
      const isCalculated = varName.startsWith('=')
      const virtualToken = {
        id: tokenId,
        type: isCalculated ? TOKEN_TYPE.CALCULATED : TOKEN_TYPE.VARIABLE,
        name: varName
      }
      
      // Agregar temporalmente al store si no existe
      const existingToken = templateTokens.find(t => t.id === tokenId)
      if (!existingToken) {
        // No agregamos el token, solo configuramos el activeTokenId
        // El FormulaBar creará un token virtual
      }
      
      setActiveTokenId(tokenId)
      setCursorPosition(end)
      setSelectionRange({ start: end, end: end })
    }
  }
  
  // Eliminar variable del contenido
  const deleteVariable = (varName) => {
    const newContent = content.replace(`{{${varName}}}`, '')
    setContent(newContent)
    
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      updateToken(templateTokens[0].id, { content: newContent })
    }
  }
  
  // Mover variable a nueva posición
  const moveVariable = (varName, newPosition) => {
    const withoutVar = content.replace(`{{${varName}}}`, '')
    const before = withoutVar.substring(0, newPosition)
    const after = withoutVar.substring(newPosition)
    const newContent = before + `{{${varName}}}` + after
    
    setContent(newContent)
    
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      updateToken(templateTokens[0].id, { content: newContent })
    }
  }
  
  // Manejar clic en chip para mover variable
  const handleChipDragStart = (e, varName) => {
    setIsDragging(true)
    setDragVariable(varName)
    e.dataTransfer.setData('variableMove', varName)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleChipDragEnd = () => {
    // La lógica de drop se maneja en handleDrop
    // Solo limpiar estados aquí
    setIsDragging(false)
    setDragVariable(null)
    setDragOverPosition(null)
    setDragPreviewPosition(null)
  }

  // Renderizar contenido con variables como enlaces HTML
  const renderContentWithLinks = () => {
    if (!content) return ''

    const parsed = parseContent(content)
    
    return parsed.map((part) => {
      if (part.type === 'variable') {
        const variablePlaceholder = `{{${part.name}}}`
        
        // Detectar tipo de variable para color
        const isCalculated = part.name.startsWith('=')
        const isConcatenated = part.isConcatenated
        
        const varColor = isConcatenated 
          ? '#facc15' // yellow-400
          : isCalculated 
            ? '#4ade80' // green-400
            : '#60a5fa' // blue-400

        // Escapar HTML
        const escaped = variablePlaceholder
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')

        return `<span 
          style="color: ${varColor}; font-weight: 600; cursor: pointer; text-decoration: none;" 
          class="variable-link"
          data-var-name="${part.name.replace(/"/g, '&quot;')}"
          onmouseover="this.style.textDecoration='underline'"
          onmouseout="this.style.textDecoration='none'"
        >${escaped}</span>`
      }
      
      // Renderizar texto normal
      return part.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }).join('')
  }

  // Manejar cambios en contentEditable
  const handleContentEditableChange = (e) => {
    const newContent = e.target.innerText || ''
    setContent(newContent)

    // Actualizar el primer token de texto
    if (templateTokens.length > 0 && templateTokens[0].type === TOKEN_TYPE.TEXT) {
      updateToken(templateTokens[0].id, { content: newContent })
    } else {
      const newToken = createTextToken(newContent)
      setTemplateTokens([newToken])
    }
  }

  // Renderizar overlay solo para resaltar variables (sin interferir con el textarea)
  const renderVariableHighlights = () => {
    if (!content) return null

    const parsed = parseContent(content)
    
    return parsed.map((part, index) => {
      if (part.type === 'variable') {
        const variablePlaceholder = `{{${part.name}}}`
        
        // Detectar tipo de variable para color
        const isCalculated = part.name.startsWith('=')
        const isConcatenated = part.isConcatenated
        
        const varColor = isConcatenated 
          ? 'text-yellow-400' 
          : isCalculated 
            ? 'text-green-400' 
            : 'text-blue-400'

        return (
          <span key={part.key} className={`${varColor} font-semibold pointer-events-auto cursor-pointer hover:underline`}
            onClick={(e) => {
              e.stopPropagation()
              selectVariable(part.name)
              // Hacer foco en textarea
              if (textareaRef.current) {
                textareaRef.current.focus()
              }
            }}
            title="Clic para editar variable"
          >
            {variablePlaceholder}
          </span>
        )
      }
      
      // Renderizar texto normal en blanco
      return (
        <span key={part.key} className="text-white">
          {part.content}
        </span>
      )
    })
  }

  // Renderizar el overlay visual con variables como texto clickeable
  const renderVisualOverlay = () => {
    // Si no hay contenido, mostrar cursor en posición 0
    if (!content || content.length === 0) {
      return (
        <span className="inline-block w-0.5 h-5 bg-blue-400 animate-pulse align-text-bottom"></span>
      )
    }

    const parsed = parseContent(content)
    let charCount = 0

    return parsed.map((part, index) => {
      if (part.type === 'variable') {
        const variablePlaceholder = `{{${part.name}}}`
        const variableStart = charCount
        const variableEnd = charCount + variablePlaceholder.length
        const showCursorBefore = cursorPosition === variableStart && selectionRange.start === selectionRange.end

        charCount += variablePlaceholder.length

        // Detectar tipo de variable para color
        const isCalculated = part.name.startsWith('=')
        const isConcatenated = part.isConcatenated
        
        const varColor = isConcatenated 
          ? 'text-yellow-400' 
          : isCalculated 
            ? 'text-green-400' 
            : 'text-blue-400'

        return (
          <React.Fragment key={part.key}>
            {showCursorBefore && (
              <span className="inline-block w-0.5 h-5 bg-blue-400 animate-pulse mx-0"></span>
            )}
            <span 
              className={`${varColor} font-semibold cursor-pointer hover:underline pointer-events-auto`}
              onClick={(e) => {
                e.stopPropagation()
                selectVariable(part.name)
              }}
              title="Clic para editar variable"
            >
              {variablePlaceholder}
            </span>
          </React.Fragment>
        )
      }
      
      // Renderizar texto con cursor o selección
      const textContent = part.content
      const textStart = charCount
      const textEnd = charCount + textContent.length
      charCount += textContent.length

      // Si hay selección de texto (rango seleccionado)
      if (selectionRange.start !== selectionRange.end && 
          ((selectionRange.start >= textStart && selectionRange.start < textEnd) ||
           (selectionRange.end > textStart && selectionRange.end <= textEnd) ||
           (selectionRange.start < textStart && selectionRange.end > textEnd))) {
        
        const selStart = Math.max(0, selectionRange.start - textStart)
        const selEnd = Math.min(textContent.length, selectionRange.end - textStart)
        
        const beforeSelection = textContent.substring(0, selStart)
        const selectedText = textContent.substring(selStart, selEnd)
        const afterSelection = textContent.substring(selEnd)

        return (
          <span key={part.key} className="inline">
            {beforeSelection}
            <span className="bg-blue-500/40">{selectedText}</span>
            {afterSelection}
          </span>
        )
      }

      // Si el cursor está en este fragmento de texto (sin selección)
      if (cursorPosition >= textStart && cursorPosition <= textEnd && selectionRange.start === selectionRange.end) {
        const posInText = cursorPosition - textStart
        const beforeCursor = textContent.substring(0, posInText)
        const afterCursor = textContent.substring(posInText)

        return (
          <span key={part.key} className="inline">
            {beforeCursor}
            <span className="inline-block w-0.5 h-5 bg-blue-400 animate-pulse align-text-bottom"></span>
            {afterCursor}
          </span>
        )
      }

      return (
        <span key={part.key} className="inline">
          {textContent}
        </span>
      )
    })
  }

  
  // Capturar eventos de teclado en el contenedor
  const handleContainerKeyDown = (e) => {
    // Hacer foco en el textarea para capturar el input
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleContainerClick = (e) => {
    // Hacer foco en el textarea al hacer clic
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
    handleEditorClick(e)
  }

  return (
    <div
      ref={editorRef}
      className="w-full h-full bg-dark-card rounded-lg border border-dark-border
                 cursor-text overflow-hidden flex flex-col relative"
      onClick={handleContainerClick}
      onKeyDown={handleContainerKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      tabIndex={0}
    >
      {/* Área de contenido con scroll vertical */}
      <div 
        className="flex-1 overflow-y-auto scrollbar-thin p-4 relative" 
        style={{ maxHeight: '400px' }}
      >
        <div className="relative">
          {/* Overlay de colores (debajo, solo visual) */}
          <div
            ref={overlayRef}
            className="w-full bg-transparent outline-none border-none
                       font-mono text-base leading-relaxed
                       min-h-[200px] absolute top-0 left-0 pointer-events-none"
            style={{
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              padding: '0',
              margin: '0'
            }}
          >
            {renderVariableHighlights()}
          </div>
          
          {/* Textarea transparente encima (captura todo) */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            onFocus={handleTextFocus}
            onSelect={handleTextSelection}
            onMouseUp={handleTextSelection}
            onClick={handleTextSelection}
            className="w-full bg-transparent outline-none border-none
                       font-mono text-base leading-relaxed resize-none
                       min-h-[200px] relative caret-blue-400"
            style={{
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              padding: '0',
              margin: '0'
            }}
            placeholder="Escribe tu plantilla aquí... Usa {{Variable}} para insertar variables"
          />
        </div>
      </div>
      
      {/* Barra de estado */}
      <div className="px-4 py-2 text-xs text-gray-400 border-t border-dark-border bg-dark-panel flex justify-between">
        <span>Caracteres: {content.length}</span>
        <span>Posición cursor: {cursorPosition}</span>
        <span>Variables: {parseContent(content).filter(p => p.type === 'variable').length}</span>
        <span>Modo: Híbrido</span>
      </div>
    </div>
  )
}

export default TemplateEditor
