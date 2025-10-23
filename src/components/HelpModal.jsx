import React from 'react'
import { MdClose, MdDragHandle } from 'react-icons/md'
import { 
  FaFileImport, 
  FaCalculator, 
  FaPlay,
  FaFilter 
} from 'react-icons/fa'

const HelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-panel rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h3 className="font-semibold text-lg">Ayuda - Generador de Plantillas</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-hover rounded transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {/* Introducción */}
          <div>
            <h4 className="text-lg font-semibold mb-2 text-primary">
              ¿Qué es esta aplicación?
            </h4>
            <p className="text-gray-300">
              Esta aplicación te permite generar textos personalizados a partir de datos de Excel. 
              Crea una plantilla con variables y la aplicación generará un texto para cada fila de tus datos.
            </p>
          </div>
          
          {/* Paso 1 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaFileImport size={20} className="text-blue-400" />
              <h4 className="text-lg font-semibold text-blue-400">1. Cargar archivo Excel</h4>
            </div>
            <p className="text-gray-300 mb-2">
              Haz clic en "Cargar archivo Excel o CSV" y selecciona tu archivo (.xlsx, .xls, .csv).
            </p>
            <div className="bg-dark-card p-3 rounded-lg text-sm">
              <strong>Ejemplo de datos:</strong>
              <pre className="mt-2 text-gray-400 font-mono">
{`Nombre    | Ciudad      | Producto
----------|-------------|----------
Juan      | Madrid      | Laptop
María     | Barcelona   | Mouse
Pedro     | Valencia    | Teclado`}
              </pre>
            </div>
          </div>
          
          {/* Paso 2 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MdDragHandle size={20} className="text-green-400" />
              <h4 className="text-lg font-semibold text-green-400">2. Crear plantilla</h4>
            </div>
            <p className="text-gray-300 mb-2">
              Escribe tu texto y arrastra o haz clic en los encabezados de columna para insertar variables.
            </p>
            <div className="bg-dark-card p-3 rounded-lg text-sm">
              <strong>Ejemplo de plantilla:</strong>
              <div className="mt-2 text-gray-300">
                <p className="font-mono">
                  Hola <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 rounded text-xs">Nombre</span>, 
                  tu pedido de <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 rounded text-xs">Producto</span> será 
                  enviado a <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 rounded text-xs">Ciudad</span>.
                </p>
              </div>
              <div className="mt-3">
                <strong>Resultado:</strong>
                <ul className="mt-2 space-y-1 text-gray-400">
                  <li>• Hola Juan, tu pedido de Laptop será enviado a Madrid.</li>
                  <li>• Hola María, tu pedido de Mouse será enviado a Barcelona.</li>
                  <li>• Hola Pedro, tu pedido de Teclado será enviado a Valencia.</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Paso 3 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaCalculator size={20} className="text-purple-400" />
              <h4 className="text-lg font-semibold text-purple-400">3. Variables calculadas</h4>
            </div>
            <p className="text-gray-300 mb-2">
              Crea variables que calculen valores automáticamente usando fórmulas matemáticas.
            </p>
            <div className="bg-dark-card p-3 rounded-lg text-sm space-y-3">
              <div>
                <strong>Ejemplo:</strong>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[80px]">Datos:</span>
                    <code className="font-mono text-blue-300">Precio: 100, Cantidad: 5</code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[80px]">Fórmula:</span>
                    <code className="font-mono text-green-300">Total = Precio * Cantidad</code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[80px]">Resultado:</span>
                    <code className="font-mono text-yellow-300">Total = 500</code>
                  </div>
                </div>
              </div>
              
              <div>
                <strong>Operadores disponibles:</strong>
                <ul className="mt-2 space-y-1 text-gray-400">
                  <li>• <code className="font-mono text-blue-300">+</code> Suma</li>
                  <li>• <code className="font-mono text-blue-300">-</code> Resta</li>
                  <li>• <code className="font-mono text-blue-300">*</code> Multiplicación</li>
                  <li>• <code className="font-mono text-blue-300">/</code> División</li>
                  <li>• <code className="font-mono text-blue-300">( )</code> Paréntesis para prioridad</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Paso 4 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaFilter size={20} className="text-orange-400" />
              <h4 className="text-lg font-semibold text-orange-400">4. Filtrar datos</h4>
            </div>
            <p className="text-gray-300 mb-2">
              Haz clic en el icono de filtro en cualquier columna para filtrar los datos.
            </p>
            <div className="bg-dark-card p-3 rounded-lg text-sm">
              <strong>Condiciones disponibles:</strong>
              <ul className="mt-2 space-y-1 text-gray-400 grid grid-cols-2 gap-2">
                <li>• Igual a</li>
                <li>• Diferente a</li>
                <li>• Contiene</li>
                <li>• No contiene</li>
                <li>• Empieza con</li>
                <li>• Termina con</li>
                <li>• Mayor que</li>
                <li>• Menor que</li>
              </ul>
            </div>
          </div>
          
          {/* Paso 5 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaPlay size={20} className="text-red-400" />
              <h4 className="text-lg font-semibold text-red-400">5. Generar y exportar</h4>
            </div>
            <p className="text-gray-300 mb-2">
              Haz clic en "Generar textos" para crear los textos. Luego puedes:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>Copiar:</strong> Copia textos individuales o todos a la vez</li>
              <li>• <strong>Descargar:</strong> Guarda todos los textos en un archivo .txt</li>
              <li>• <strong>WhatsApp:</strong> Envía los textos directamente a WhatsApp</li>
              <li>• <strong>Guardar plantilla:</strong> Guarda tu plantilla y filtros para usar después</li>
            </ul>
          </div>
          
          {/* Tips */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-blue-300">💡 Tips y consejos</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Puedes editar variables haciendo clic en ellas</li>
              <li>• Las variables calculadas se identifican con el símbolo =</li>
              <li>• Usa la barra de fórmulas (arriba del editor) para editar variables</li>
              <li>• Puedes arrastrar variables para reordenarlas</li>
              <li>• Los filtros se aplican con AND (todas las condiciones deben cumplirse)</li>
              <li>• Guarda tus plantillas frecuentemente para no perder tu trabajo</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-dark-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

export default HelpModal

