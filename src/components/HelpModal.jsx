import React, { useState } from 'react'
import { MdClose, MdDragHandle, MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'
import { 
  FaFileImport, 
  FaCalculator, 
  FaPlay,
  FaFilter,
  FaExclamationTriangle,
  FaInfoCircle,
  FaDesktop,
  FaSave,
  FaEdit
} from 'react-icons/fa'
import { IoLogoWhatsapp } from 'react-icons/io5'

const HelpModal = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    intro: true,
    step1: false,
    step2: false,
    variables: false,
    formulas: false,
    filters: false,
    generate: false,
    whatsapp: false,
    save: false,
    tips: false,
    requirements: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const Section = ({ id, title, icon, color, children }) => {
    const isExpanded = expandedSections[id]
    return (
      <div className="border border-dark-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center gap-3 p-4 bg-dark-card hover:bg-dark-hover transition-colors text-left"
        >
          {isExpanded ? <MdKeyboardArrowDown size={20} /> : <MdKeyboardArrowRight size={20} />}
          {icon}
          <h4 className={`text-lg font-semibold flex-1 ${color}`}>{title}</h4>
        </button>
        {isExpanded && (
          <div className="p-4 space-y-3 bg-dark-panel/50">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-panel rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div>
            <h3 className="font-semibold text-xl">📚 Manual de Usuario - Generador de Plantillas Excel</h3>
            <p className="text-sm text-gray-400 mt-1">Guía completa de uso y funcionalidades</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-hover rounded transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
          {/* Advertencia de optimización */}
          <div className="bg-orange-600/10 border border-orange-600/30 rounded-lg p-4 flex items-start gap-3">
            <FaDesktop size={24} className="text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-orange-300 mb-1">⚠️ Aplicación Optimizada para Escritorio</h4>
              <p className="text-sm text-gray-300">
                Esta aplicación está diseñada y optimizada para su uso en <strong>ordenadores de escritorio o portátiles</strong>. 
                La experiencia en dispositivos móviles puede ser limitada debido a las funcionalidades avanzadas de edición, 
                arrastrar y soltar, y la visualización de múltiples paneles simultáneos.
              </p>
            </div>
          </div>

          {/* Introducción */}
          <Section
            id="intro"
            title="¿Qué es esta aplicación?"
            icon={<FaInfoCircle size={20} className="text-blue-400" />}
            color="text-blue-400"
          >
            <p className="text-gray-300 leading-relaxed">
              El <strong>Generador de Plantillas Excel</strong> es una herramienta web potente y versátil que te permite 
              automatizar la creación de textos personalizados masivos a partir de datos estructurados en Excel o CSV.
            </p>
            
            <div className="bg-dark-card p-4 rounded-lg">
              <h5 className="font-semibold mb-2 text-green-400">✅ Casos de uso:</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📧 <strong>Emails personalizados</strong> para campañas de marketing</li>
                <li>📱 <strong>Mensajes de WhatsApp</strong> masivos con datos únicos</li>
                <li>🏷️ <strong>Etiquetas y facturas</strong> con información de clientes</li>
                <li>📋 <strong>Certificados personalizados</strong> con nombres y datos</li>
                <li>💼 <strong>Propuestas comerciales</strong> con cálculos automáticos</li>
                <li>📊 <strong>Informes personalizados</strong> con métricas calculadas</li>
              </ul>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                <strong>💡 Concepto clave:</strong> En lugar de escribir 100 mensajes manualmente, 
                defines una plantilla una vez y la aplicación genera automáticamente todos los textos 
                reemplazando las variables con los datos correspondientes de cada fila de tu Excel.
              </p>
            </div>
          </Section>
          
          {/* Paso 1: Cargar Excel */}
          <Section
            id="step1"
            title="Paso 1: Cargar archivo Excel o CSV"
            icon={<FaFileImport size={20} className="text-blue-400" />}
            color="text-blue-400"
          >
            <p className="text-gray-300">
              El primer paso es cargar tus datos desde un archivo Excel (.xlsx, .xls) o CSV (.csv).
            </p>

            <div className="bg-dark-card p-4 rounded-lg space-y-3">
              <div>
                <h5 className="font-semibold text-blue-300 mb-2">🔹 Formatos soportados:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• <strong>.xlsx</strong> - Excel moderno (2007+)</li>
                  <li>• <strong>.xls</strong> - Excel clásico</li>
                  <li>• <strong>.csv</strong> - Valores separados por comas</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-blue-300 mb-2">📊 Ejemplo de estructura de datos:</h5>
                <pre className="bg-dark-bg p-3 rounded text-xs font-mono text-gray-400 overflow-x-auto">
{`Nombre    | Apellido  | Ciudad      | Producto  | Precio | Cantidad
----------|-----------|-------------|-----------|--------|----------
Juan      | García    | Madrid      | Laptop    | 899    | 2
María     | López     | Barcelona   | Mouse     | 25     | 5
Pedro     | Martínez  | Valencia    | Teclado   | 45     | 3
Ana       | Rodríguez | Sevilla     | Monitor   | 299    | 1`}
                </pre>
              </div>

              <div>
                <h5 className="font-semibold text-blue-300 mb-2">✅ Requisitos del archivo:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• La <strong>primera fila</strong> debe contener los nombres de las columnas (encabezados)</li>
                  <li>• Los encabezados serán los nombres de las variables disponibles</li>
                  <li>• Cada fila representa un registro/persona/producto/etc.</li>
                  <li>• Se generará un texto por cada fila de datos</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
              <p className="text-sm text-yellow-200">
                <strong>⚠️ Importante:</strong> Asegúrate de que los nombres de columnas no contengan caracteres especiales 
                problemáticos. Nombres simples como "Nombre", "Precio", "Email" funcionan perfectamente.
              </p>
            </div>

            <div className="bg-dark-card p-3 rounded-lg">
              <h5 className="font-semibold text-green-400 mb-2">🎯 Cómo cargar el archivo:</h5>
              <ol className="space-y-1 text-sm text-gray-300 list-decimal list-inside">
                <li>Haz clic en el botón <strong>"Cargar archivo Excel o CSV"</strong> en la barra superior</li>
                <li>Selecciona tu archivo desde el explorador de archivos</li>
                <li>La aplicación leerá automáticamente los datos y mostrará:
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>- La tabla con todos tus datos en el panel izquierdo</li>
                    <li>- Los encabezados de columna disponibles para usar como variables</li>
                    <li>- El contador de filas totales</li>
                  </ul>
                </li>
              </ol>
            </div>
          </Section>
          
          {/* Paso 2: Crear Plantilla */}
          <Section
            id="step2"
            title="Paso 2: Crear tu plantilla de texto"
            icon={<MdDragHandle size={20} className="text-green-400" />}
            color="text-green-400"
          >
            <p className="text-gray-300">
              La plantilla es el texto base donde defines la estructura y las posiciones de las variables que se reemplazarán con datos.
            </p>

            <div className="bg-dark-card p-4 rounded-lg space-y-3">
              <div>
                <h5 className="font-semibold text-green-300 mb-2">✍️ Formas de insertar variables:</h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <strong>1. Arrastrando desde la tabla:</strong>
                    <p className="ml-4 text-gray-400">Haz clic en un encabezado de columna y arrástralo al editor de plantillas</p>
                  </li>
                  <li>
                    <strong>2. Haciendo clic en el encabezado:</strong>
                    <p className="ml-4 text-gray-400">Haz clic en cualquier encabezado de columna para insertar la variable donde está el cursor</p>
                  </li>
                  <li>
                    <strong>3. Escribiendo manualmente:</strong>
                    <p className="ml-4 text-gray-400">Escribe <code className="bg-dark-bg px-1 rounded font-mono">{`{{NombreColumna}}`}</code> directamente en el editor</p>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-green-300 mb-2">📝 Ejemplo completo:</h5>
                <div className="bg-dark-bg p-3 rounded space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">PLANTILLA:</p>
                    <p className="font-mono text-sm text-gray-300">
                      Hola <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 rounded text-xs mx-1">{`{{Nombre}}`}</span>, 
                      tu pedido de <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 rounded text-xs mx-1">{`{{Producto}}`}</span> por 
                      <span className="inline-flex items-center px-2 py-0.5 bg-green-600 rounded text-xs mx-1">{`{{=Precio*Cantidad}}`}</span>€ será enviado 
                      a <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 rounded text-xs mx-1">{`{{Ciudad}}`}</span>.
                    </p>
                  </div>

                  <div className="border-t border-dark-border pt-3">
                    <p className="text-xs text-gray-500 mb-2">TEXTOS GENERADOS:</p>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li>• Hola Juan, tu pedido de Laptop por 1798€ será enviado a Madrid.</li>
                      <li>• Hola María, tu pedido de Mouse por 125€ será enviado a Barcelona.</li>
                      <li>• Hola Pedro, tu pedido de Teclado por 135€ será enviado a Valencia.</li>
                      <li>• Hola Ana, tu pedido de Monitor por 299€ será enviado a Sevilla.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-green-300 mb-2">🎨 Edición del editor:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Escribe texto normal como en cualquier editor</li>
                  <li>• Las variables aparecen resaltadas en <span className="text-blue-400">azul</span>, <span className="text-green-400">verde</span> o <span className="text-yellow-400">amarillo</span></li>
                  <li>• Puedes escribir saltos de línea presionando Enter</li>
                  <li>• Usa Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X normalmente</li>
                  <li>• Haz clic en una variable para editarla en la barra de fórmulas</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                <strong>💡 Tip:</strong> Las variables se colorean automáticamente: 
                <span className="text-blue-400 mx-1">azul</span> para variables simples, 
                <span className="text-green-400 mx-1">verde</span> para calculadas, y 
                <span className="text-yellow-400 mx-1">amarillo</span> para concatenadas.
              </p>
            </div>
          </Section>

          {/* Variables */}
          <Section
            id="variables"
            title="Tipos de Variables"
            icon={<FaEdit size={20} className="text-purple-400" />}
            color="text-purple-400"
          >
            <p className="text-gray-300">
              Existen tres tipos de variables que puedes usar en tus plantillas:
            </p>

            <div className="space-y-4">
              {/* Variables simples */}
              <div className="bg-dark-card p-4 rounded-lg">
                <h5 className="font-semibold text-blue-400 mb-2">1. Variables Simples (Azul)</h5>
                <p className="text-sm text-gray-300 mb-2">
                  Son las columnas directas de tu archivo Excel. Se insertan tal cual están en los datos.
                </p>
                <div className="bg-dark-bg p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">SINTAXIS:</p>
                  <code className="text-blue-400 font-mono text-sm">{`{{NombreColumna}}`}</code>
                  
                  <p className="text-xs text-gray-500 mt-3 mb-1">EJEMPLOS:</p>
                  <ul className="space-y-1 text-sm font-mono text-gray-400">
                    <li><span className="text-blue-400">{`{{Nombre}}`}</span> → Juan</li>
                    <li><span className="text-blue-400">{`{{Email}}`}</span> → juan@example.com</li>
                    <li><span className="text-blue-400">{`{{Precio}}`}</span> → 899</li>
                  </ul>
                </div>
              </div>

              {/* Variables calculadas */}
              <div className="bg-dark-card p-4 rounded-lg">
                <h5 className="font-semibold text-green-400 mb-2">2. Variables Calculadas (Verde)</h5>
                <p className="text-sm text-gray-300 mb-2">
                  Realizan operaciones matemáticas con los datos de las columnas. Útiles para cálculos automáticos.
                </p>
                <div className="bg-dark-bg p-3 rounded space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">SINTAXIS:</p>
                    <code className="text-green-400 font-mono text-sm">{`{{=Columna1 operador Columna2}}`}</code>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">OPERADORES DISPONIBLES:</p>
                    <ul className="space-y-1 text-sm font-mono text-gray-400">
                      <li><span className="text-green-400">+</span> Suma</li>
                      <li><span className="text-green-400">-</span> Resta</li>
                      <li><span className="text-green-400">*</span> Multiplicación</li>
                      <li><span className="text-green-400">/</span> División</li>
                      <li><span className="text-green-400">( )</span> Paréntesis para prioridad</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">EJEMPLOS:</p>
                    <ul className="space-y-1 text-sm font-mono text-gray-400">
                      <li><span className="text-green-400">{`{{=Precio * Cantidad}}`}</span> → 1798 (si Precio=899, Cantidad=2)</li>
                      <li><span className="text-green-400">{`{{=Subtotal + IVA}}`}</span> → 121 (si Subtotal=100, IVA=21)</li>
                      <li><span className="text-green-400">{`{{=Total - Descuento}}`}</span> → 900 (si Total=1000, Descuento=100)</li>
                      <li><span className="text-green-400">{`{{=(Precio * Cantidad) * 1.21}}`}</span> → Calcula total con IVA</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-2 mt-2">
                  <p className="text-xs text-yellow-200">
                    ⚠️ Las columnas usadas en fórmulas deben contener valores numéricos. La validación se hace al generar los textos.
                  </p>
                </div>
              </div>

              {/* Variables concatenadas */}
              <div className="bg-dark-card p-4 rounded-lg">
                <h5 className="font-semibold text-yellow-400 mb-2">3. Variables Concatenadas (Amarillo)</h5>
                <p className="text-sm text-gray-300 mb-2">
                  Unen textos y columnas para crear cadenas personalizadas.
                </p>
                <div className="bg-dark-bg p-3 rounded space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">SINTAXIS:</p>
                    <code className="text-yellow-400 font-mono text-sm">{`{{=Columna1 + " texto " + Columna2}}`}</code>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">EJEMPLOS:</p>
                    <ul className="space-y-1 text-sm font-mono text-gray-400">
                      <li><span className="text-yellow-400">{`{{=Nombre + " " + Apellido}}`}</span> → Juan García</li>
                      <li><span className="text-yellow-400">{`{{=Producto + " - " + Color}}`}</span> → Laptop - Negro</li>
                      <li><span className="text-yellow-400">{`{{="Ref: " + Codigo}}`}</span> → Ref: ABC123</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-2 mt-2">
                  <p className="text-xs text-blue-200">
                    💡 Usa comillas dobles <code className="font-mono">"..."</code> para textos literales que quieres agregar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-card p-3 rounded-lg">
              <h5 className="font-semibold text-purple-300 mb-2">📝 Cómo crear variables desde la Barra de Fórmulas:</h5>
              <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                <li>Haz clic en el campo de la barra de fórmulas (arriba del editor)</li>
                <li>Escribe el nombre o la fórmula:
                  <ul className="ml-6 mt-1 space-y-1 text-xs">
                    <li>- Para simple: <code className="bg-dark-bg px-1 rounded font-mono">Nombre</code></li>
                    <li>- Para calculada: <code className="bg-dark-bg px-1 rounded font-mono">=Precio * Cantidad</code></li>
                    <li>- Para concatenada: <code className="bg-dark-bg px-1 rounded font-mono">=Nombre + " " + Apellido</code></li>
                  </ul>
                </li>
                <li>Presiona <strong>Enter</strong> o clic en el botón verde ✓</li>
                <li>La variable se insertará automáticamente en el editor</li>
              </ol>
            </div>
          </Section>

          {/* Filtros */}
          <Section
            id="filters"
            title="Paso 3: Filtrar datos (Opcional)"
            icon={<FaFilter size={20} className="text-orange-400" />}
            color="text-orange-400"
          >
            <p className="text-gray-300">
              Los filtros te permiten generar textos solo para un subconjunto de tus datos, según condiciones específicas.
            </p>

            <div className="bg-dark-card p-4 rounded-lg space-y-3">
              <div>
                <h5 className="font-semibold text-orange-300 mb-2">🎯 Cómo aplicar filtros:</h5>
                <ol className="space-y-1 text-sm text-gray-300 list-decimal list-inside">
                  <li>Haz clic en el icono de filtro <FaFilter className="inline text-orange-400" size={12} /> en cualquier encabezado de columna</li>
                  <li>Selecciona la condición de filtrado</li>
                  <li>Introduce el valor a comparar</li>
                  <li>Los datos se filtrarán automáticamente</li>
                </ol>
              </div>

              <div>
                <h5 className="font-semibold text-orange-300 mb-2">🔍 Condiciones disponibles:</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-dark-bg p-2 rounded">
                    <strong className="text-blue-400">Texto:</strong>
                    <ul className="mt-1 space-y-0.5 text-xs text-gray-400">
                      <li>• Igual a</li>
                      <li>• Diferente a</li>
                      <li>• Contiene</li>
                      <li>• No contiene</li>
                      <li>• Empieza con</li>
                      <li>• Termina con</li>
                    </ul>
                  </div>
                  <div className="bg-dark-bg p-2 rounded">
                    <strong className="text-green-400">Números:</strong>
                    <ul className="mt-1 space-y-0.5 text-xs text-gray-400">
                      <li>• Igual a</li>
                      <li>• Diferente a</li>
                      <li>• Mayor que</li>
                      <li>• Menor que</li>
                      <li>• Mayor o igual</li>
                      <li>• Menor o igual</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-orange-300 mb-2">📌 Ejemplos de uso:</h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <strong>Filtrar por ciudad:</strong>
                    <p className="ml-4 text-xs text-gray-400">Ciudad <span className="text-orange-400">Igual a</span> "Madrid" → Solo personas de Madrid</p>
                  </li>
                  <li>
                    <strong>Filtrar por precio:</strong>
                    <p className="ml-4 text-xs text-gray-400">Precio <span className="text-orange-400">Mayor que</span> 100 → Solo productos caros</p>
                  </li>
                  <li>
                    <strong>Filtrar por email:</strong>
                    <p className="ml-4 text-xs text-gray-400">Email <span className="text-orange-400">Contiene</span> "@gmail.com" → Solo Gmail</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                <strong>💡 Tip:</strong> Puedes aplicar múltiples filtros a la vez. Se aplicarán con lógica AND 
                (todas las condiciones deben cumplirse). Para quitar un filtro, haz clic en el icono de filtro y selecciona "Quitar filtro".
              </p>
            </div>
          </Section>

          {/* Generar */}
          <Section
            id="generate"
            title="Paso 4: Generar textos"
            icon={<FaPlay size={20} className="text-red-400" />}
            color="text-red-400"
          >
            <p className="text-gray-300">
              Una vez que tengas tu plantilla lista y los datos cargados, es momento de generar los textos personalizados.
            </p>

            <div className="bg-dark-card p-4 rounded-lg space-y-3">
              <div>
                <h5 className="font-semibold text-red-300 mb-2">⚡ Proceso de generación:</h5>
                <ol className="space-y-1 text-sm text-gray-300 list-decimal list-inside">
                  <li>Haz clic en el botón <strong>"Generar textos"</strong> en la barra superior</li>
                  <li>La aplicación procesará cada fila de datos filtrados</li>
                  <li>Reemplazará las variables con los valores correspondientes</li>
                  <li>Evaluará las fórmulas calculadas y concatenadas</li>
                  <li>Los textos generados aparecerán en el panel derecho</li>
                </ol>
              </div>

              <div>
                <h5 className="font-semibold text-red-300 mb-2">✅ Validación automática:</h5>
                <p className="text-sm text-gray-300 mb-2">
                  Durante la generación, se validan automáticamente:
                </p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Que las columnas referenciadas existan</li>
                  <li>• Que los valores numéricos sean válidos para cálculos</li>
                  <li>• Que las fórmulas estén bien formadas</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-red-300 mb-2">⚠️ Manejo de errores:</h5>
                <p className="text-sm text-gray-300 mb-2">
                  Si hay errores durante la generación:
                </p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Se mostrará un mensaje con el detalle del error</li>
                  <li>• Se indicará en qué fila ocurrió el problema</li>
                  <li>• Los textos con errores se marcarán como <code className="bg-dark-bg px-1 rounded text-red-400">[Error]</code></li>
                  <li>• Puedes corregir la plantilla o los datos y volver a generar</li>
                </ul>
              </div>
            </div>

            <div className="bg-dark-card p-3 rounded-lg">
              <h5 className="font-semibold text-green-400 mb-2">💼 Qué hacer con los textos generados:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div>
                  <strong>📋 Copiar:</strong>
                  <p className="text-xs text-gray-400 ml-4">Copia textos individuales o todos a la vez</p>
                </div>
                <div>
                  <strong>💾 Descargar:</strong>
                  <p className="text-xs text-gray-400 ml-4">Descarga en archivo .txt</p>
                </div>
                <div>
                  <strong>📱 WhatsApp:</strong>
                  <p className="text-xs text-gray-400 ml-4">Envía directamente a WhatsApp</p>
                </div>
                <div>
                  <strong>🔄 Regenerar:</strong>
                  <p className="text-xs text-gray-400 ml-4">Genera de nuevo después de cambios</p>
                </div>
              </div>
            </div>
          </Section>

          {/* WhatsApp */}
          <Section
            id="whatsapp"
            title="Paso 5: Enviar a WhatsApp (Opcional)"
            icon={<IoLogoWhatsapp size={20} className="text-green-400" />}
            color="text-green-400"
          >
            <p className="text-gray-300">
              La funcionalidad de WhatsApp te permite enviar los textos generados de forma secuencial y controlada.
            </p>

            <div className="bg-dark-card p-4 rounded-lg space-y-3">
              <div>
                <h5 className="font-semibold text-green-300 mb-2">📱 Configuración de números:</h5>
                <p className="text-sm text-gray-300 mb-2">Tienes dos opciones:</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <strong>1. Mismo archivo:</strong>
                    <p className="ml-4 text-xs text-gray-400">Los números están en una columna del Excel cargado</p>
                  </li>
                  <li>
                    <strong>2. Archivo externo:</strong>
                    <p className="ml-4 text-xs text-gray-400">Carga un segundo Excel/CSV con números y haz merge por una clave común (ej: ID, Email)</p>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-green-300 mb-2">📞 Validación de números españoles:</h5>
                <p className="text-sm text-gray-300 mb-2">
                  La aplicación normaliza automáticamente números de teléfono españoles:
                </p>
                <ul className="space-y-1 text-xs font-mono text-gray-400 bg-dark-bg p-2 rounded">
                  <li><span className="text-green-400">✓</span> 123456789 → +34123456789</li>
                  <li><span className="text-green-400">✓</span> 34123456789 → +34123456789</li>
                  <li><span className="text-green-400">✓</span> +34123456789 → +34123456789 (ya válido)</li>
                  <li><span className="text-red-400">✗</span> 12345 → Inválido (menos de 9 dígitos)</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-green-300 mb-2">🚀 Sistema de envío paso a paso:</h5>
                <ol className="space-y-1 text-sm text-gray-300 list-decimal list-inside">
                  <li>Haz clic en el botón <strong>"WhatsApp"</strong></li>
                  <li>Configura la fuente de números (mismo archivo o merge)</li>
                  <li>Clic en <strong>"Validar y Continuar"</strong></li>
                  <li>Aparecerá la lista de mensajes con estado:
                    <ul className="ml-6 mt-1 space-y-0.5 text-xs">
                      <li>⏳ Pendiente - No enviado aún</li>
                      <li>▶️ Actual - Mensaje seleccionado</li>
                      <li>✅ Enviado - Completado</li>
                      <li>⏭️ Saltado - Omitido temporalmente</li>
                      <li>❌ Inválido - Número no válido</li>
                    </ul>
                  </li>
                  <li>Para cada mensaje:
                    <ul className="ml-6 mt-1 space-y-0.5 text-xs">
                      <li>- Clic en <strong>"Abrir WhatsApp"</strong> (abre WhatsApp Web)</li>
                      <li>- Envía el mensaje manualmente en WhatsApp</li>
                      <li>- Vuelve a la app y clic en <strong>"✓ Siguiente"</strong></li>
                      <li>- O clic en <strong>"Saltar"</strong> para omitir temporalmente</li>
                    </ul>
                  </li>
                  <li>Si hay mensajes saltados, se hará una segunda vuelta automáticamente</li>
                </ol>
              </div>

              <div>
                <h5 className="font-semibold text-green-300 mb-2">📊 Vista del modal:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Lista completa de mensajes con preview</li>
                  <li>• Número normalizado para cada destinatario</li>
                  <li>• Datos clave de cada fila (para verificar)</li>
                  <li>• Estado visual con colores e iconos</li>
                  <li>• Scroll automático al mensaje actual</li>
                  <li>• Contador de enviados vs totales</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
              <p className="text-sm text-yellow-200">
                <strong>⚠️ Importante:</strong> La aplicación NO envía mensajes automáticamente por seguridad y para cumplir 
                con las políticas de WhatsApp. Solo abre WhatsApp Web con el mensaje pre-cargado. Tú debes confirmar el envío 
                manualmente en cada caso.
              </p>
            </div>
          </Section>

          {/* Guardar */}
          <Section
            id="save"
            title="Paso 6: Guardar y cargar plantillas"
            icon={<FaSave size={20} className="text-yellow-400" />}
            color="text-yellow-400"
          >
            <p className="text-gray-300">
              Puedes guardar tus plantillas para reutilizarlas en el futuro sin tener que recrearlas.
            </p>

            <div className="bg-dark-card p-4 rounded-lg space-y-3">
              <div>
                <h5 className="font-semibold text-yellow-300 mb-2">💾 Guardar plantilla:</h5>
                <ol className="space-y-1 text-sm text-gray-300 list-decimal list-inside">
                  <li>Haz clic en <strong>"Guardar plantilla"</strong> en la barra superior</li>
                  <li>Se descargará un archivo JSON con:
                    <ul className="ml-6 mt-1 space-y-0.5 text-xs">
                      <li>- El contenido de la plantilla</li>
                      <li>- Todas las variables y fórmulas definidas</li>
                      <li>- Los filtros aplicados</li>
                    </ul>
                  </li>
                  <li>Guarda el archivo con un nombre descriptivo (ej: <code className="bg-dark-bg px-1 rounded">plantilla_facturas.json</code>)</li>
                </ol>
              </div>

              <div>
                <h5 className="font-semibold text-yellow-300 mb-2">📂 Cargar plantilla:</h5>
                <ol className="space-y-1 text-sm text-gray-300 list-decimal list-inside">
                  <li>Haz clic en <strong>"Cargar plantilla"</strong> en la barra superior</li>
                  <li>Selecciona el archivo JSON guardado anteriormente</li>
                  <li>La plantilla se restaurará automáticamente con:
                    <ul className="ml-6 mt-1 space-y-0.5 text-xs">
                      <li>- Texto de la plantilla</li>
                      <li>- Variables calculadas y concatenadas</li>
                      <li>- Filtros configurados</li>
                    </ul>
                  </li>
                  <li>Solo necesitarás cargar los datos Excel y generar</li>
                </ol>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                <strong>💡 Tip:</strong> Crea una biblioteca de plantillas guardadas para diferentes propósitos 
                (emails, WhatsApp, facturas, etc.) y reutilízalas cuando necesites con diferentes archivos de datos.
              </p>
            </div>
          </Section>

          {/* Tips */}
          <Section
            id="tips"
            title="💡 Tips y buenas prácticas"
            icon={<FaExclamationTriangle size={20} className="text-blue-400" />}
            color="text-blue-400"
          >
            <div className="space-y-3">
              <div className="bg-dark-card p-3 rounded-lg">
                <h5 className="font-semibold text-green-400 mb-2">✅ Recomendaciones:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• <strong>Prueba con pocos datos primero:</strong> Usa 3-5 filas para verificar que todo funciona antes de generar cientos de textos</li>
                  <li>• <strong>Nombra bien tus columnas:</strong> Usa nombres descriptivos y sin espacios (ej: "NombreCliente" en lugar de "Nombre del Cliente")</li>
                  <li>• <strong>Revisa los filtros:</strong> Verifica que el contador de filas coincida con lo esperado antes de generar</li>
                  <li>• <strong>Guarda plantillas frecuentemente:</strong> No pierdas tu trabajo, guarda después de crear fórmulas complejas</li>
                  <li>• <strong>Valida números de teléfono:</strong> Si vas a usar WhatsApp, asegúrate de que los números sean correctos antes</li>
                  <li>• <strong>Usa fórmulas simples:</strong> Fórmulas muy complejas son difíciles de depurar si hay errores</li>
                </ul>
              </div>

              <div className="bg-dark-card p-3 rounded-lg">
                <h5 className="font-semibold text-yellow-400 mb-2">⚠️ Cosas a evitar:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• No uses caracteres especiales en nombres de columnas (evita: ñ, á, #, @, etc.)</li>
                  <li>• No mezcles números y texto en columnas que usarás para cálculos</li>
                  <li>• No dejes celdas vacías en columnas críticas (nombre, email, teléfono)</li>
                  <li>• No uses fórmulas de Excel en el archivo (la app no las evalúa, solo lee valores)</li>
                  <li>• No intentes usar en móvil para trabajos extensos (es mejor en escritorio)</li>
                </ul>
              </div>

              <div className="bg-dark-card p-3 rounded-lg">
                <h5 className="font-semibold text-purple-400 mb-2">🎯 Atajos de teclado útiles:</h5>
                <ul className="space-y-1 text-xs font-mono text-gray-300 grid grid-cols-2 gap-2">
                  <li><kbd className="bg-dark-bg px-2 py-1 rounded">Ctrl + A</kbd> Seleccionar todo</li>
                  <li><kbd className="bg-dark-bg px-2 py-1 rounded">Ctrl + C</kbd> Copiar</li>
                  <li><kbd className="bg-dark-bg px-2 py-1 rounded">Ctrl + V</kbd> Pegar</li>
                  <li><kbd className="bg-dark-bg px-2 py-1 rounded">Ctrl + X</kbd> Cortar</li>
                  <li><kbd className="bg-dark-bg px-2 py-1 rounded">Ctrl + Z</kbd> Deshacer</li>
                  <li><kbd className="bg-dark-bg px-2 py-1 rounded">Ctrl + Y</kbd> Rehacer</li>
                  <li><kbd className="bg-dark-bg px-2 py-1 rounded">Home</kbd> Inicio de línea</li>
                  <li><kbd className="bg-dark-bg px-2 py-1 rounded">End</kbd> Fin de línea</li>
                </ul>
              </div>

              <div className="bg-dark-card p-3 rounded-lg">
                <h5 className="font-semibold text-orange-400 mb-2">🔧 Solución de problemas comunes:</h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <strong>Error: "Columna no encontrada"</strong>
                    <p className="ml-4 text-xs text-gray-400">→ Verifica que el nombre de la variable coincida exactamente con el encabezado de columna (mayúsculas/minúsculas)</p>
                  </li>
                  <li>
                    <strong>Error: "Valor no numérico"</strong>
                    <p className="ml-4 text-xs text-gray-400">→ Una columna usada en cálculo contiene texto. Revisa tus datos Excel</p>
                  </li>
                  <li>
                    <strong>No se generan textos</strong>
                    <p className="ml-4 text-xs text-gray-400">→ Verifica que hayas cargado datos Excel y que tengas al menos una variable en la plantilla</p>
                  </li>
                  <li>
                    <strong>Los filtros no funcionan</strong>
                    <p className="ml-4 text-xs text-gray-400">→ Asegúrate de haber presionado "Aplicar filtro". El contador de filas debe cambiar</p>
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Requisitos */}
          <Section
            id="requirements"
            title="⚙️ Requisitos técnicos"
            icon={<FaDesktop size={20} className="text-gray-400" />}
            color="text-gray-400"
          >
            <div className="space-y-3">
              <div className="bg-dark-card p-3 rounded-lg">
                <h5 className="font-semibold text-blue-300 mb-2">💻 Navegadores compatibles:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>✅ Google Chrome (recomendado)</li>
                  <li>✅ Microsoft Edge</li>
                  <li>✅ Firefox</li>
                  <li>✅ Safari (macOS)</li>
                  <li>⚠️ Opera (funciona, pero no probado extensivamente)</li>
                </ul>
              </div>

              <div className="bg-dark-card p-3 rounded-lg">
                <h5 className="font-semibold text-green-300 mb-2">📱 Dispositivos:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>✅ <strong>Escritorio/Laptop:</strong> Totalmente funcional (recomendado)</li>
                  <li>⚠️ <strong>Tablet:</strong> Funciona pero con limitaciones de arrastrar y soltar</li>
                  <li>❌ <strong>Móvil:</strong> No recomendado, experiencia limitada</li>
                </ul>
              </div>

              <div className="bg-dark-card p-3 rounded-lg">
                <h5 className="font-semibold text-yellow-300 mb-2">🔒 Privacidad y seguridad:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• <strong>Todo funciona en tu navegador:</strong> Los datos nunca se envían a un servidor</li>
                  <li>• <strong>Sin registro ni login:</strong> No se requiere cuenta, todo es local</li>
                  <li>• <strong>Archivos temporales:</strong> Los datos se borran al cerrar la pestaña</li>
                  <li>• <strong>Sin cookies de tracking:</strong> Solo cookies técnicas necesarias</li>
                </ul>
              </div>

              <div className="bg-dark-card p-3 rounded-lg">
                <h5 className="font-semibold text-purple-300 mb-2">⚡ Rendimiento:</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Archivos hasta <strong>10,000 filas</strong>: Excelente rendimiento</li>
                  <li>• Archivos hasta <strong>50,000 filas</strong>: Bueno, puede tardar unos segundos</li>
                  <li>• Archivos más de <strong>100,000 filas</strong>: Posible lentitud, considera dividir el archivo</li>
                </ul>
              </div>
            </div>
          </Section>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-dark-border flex justify-between items-center bg-dark-card">
          <div className="text-sm text-gray-400">
            <p>Versión 2.0 | Optimizado para escritorio</p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors font-medium"
          >
            Cerrar ayuda
          </button>
        </div>
      </div>
    </div>
  )
}

export default HelpModal
