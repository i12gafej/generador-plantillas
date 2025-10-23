import React from 'react'
import { MdClose, MdDragHandle } from 'react-icons/md'
import { TOKEN_TYPE } from '../types'

/**
 * Componente visual que representa una variable o fórmula como un chip
 */
const VariableChip = ({ 
  token, 
  isActive,
  isConcatenated = false,
  onClick, 
  onDelete,
  className = ''
}) => {
  const isCalculated = token.type === TOKEN_TYPE.CALCULATED
  
  // Colores según el tipo
  const bgColor = isActive 
    ? 'bg-purple-600 hover:bg-purple-700 ring-2 ring-purple-400 ring-opacity-50' 
    : isConcatenated
      ? 'bg-yellow-600 hover:bg-yellow-700'
      : isCalculated 
        ? 'bg-green-600 hover:bg-green-700' 
        : 'bg-blue-600 hover:bg-blue-700'
  
  const handleClick = (e) => {
    e.preventDefault()  // Previene selección de texto
    e.stopPropagation()
    if (onClick) onClick(token.id)
  }
  
  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) onDelete(token.id)
  }
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1 px-1 py-1.5 mx-1
        ${bgColor}
        text-white text-sm font-medium rounded-md
        cursor-pointer transition-colors
        select-none
        align-middle
        ${className}
      `}
      onClick={handleClick}
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('tokenId', token.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
    >
      <MdDragHandle className="text-white/60 cursor-move" size={12} />
      
      <span className="font-mono text-xs">
        {token.name}
      </span>
      
      <button
        onClick={handleDelete}
        className="ml-1 p-0.5 hover:bg-white/20 rounded transition-colors"
        title="Eliminar variable"
      >
        <MdClose size={12} />
      </button>
    </span>
  )
}

export default VariableChip

