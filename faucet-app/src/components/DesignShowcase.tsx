// Este componente es solo para visualizar el sistema de diseño
// NO es parte de la aplicación principal

export function DesignShowcase() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Design System</h1>
          <p className="text-gray-600">Minimalista, sobrio y amigable</p>
        </div>

        {/* Paleta de colores */}
        <section className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Color Palette</h2>
          
          <div className="space-y-6">
            {/* Neutrales */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Neutrals</h3>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-20 bg-white border border-gray-300 rounded-lg"></div>
                  <p className="text-xs font-mono">#ffffff</p>
                  <p className="text-xs text-gray-600">White</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-[#f8f9fb] border border-gray-300 rounded-lg"></div>
                  <p className="text-xs font-mono">#f8f9fb</p>
                  <p className="text-xs text-gray-600">Background</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-gray-100 rounded-lg"></div>
                  <p className="text-xs font-mono">#f3f4f6</p>
                  <p className="text-xs text-gray-600">Gray 100</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-gray-600 rounded-lg"></div>
                  <p className="text-xs font-mono">#6b7280</p>
                  <p className="text-xs text-white">Gray 600</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-gray-900 rounded-lg"></div>
                  <p className="text-xs font-mono">#1a1f36</p>
                  <p className="text-xs text-white">Gray 900</p>
                </div>
              </div>
            </div>

            {/* Colores de acción */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Action Colors</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-20 bg-blue-600 rounded-lg"></div>
                  <p className="text-xs font-mono">#3b82f6</p>
                  <p className="text-xs text-gray-600">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-green-500 rounded-lg"></div>
                  <p className="text-xs font-mono">#10b981</p>
                  <p className="text-xs text-gray-600">Success</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-red-500 rounded-lg"></div>
                  <p className="text-xs font-mono">#ef4444</p>
                  <p className="text-xs text-gray-600">Error</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-yellow-400 rounded-lg"></div>
                  <p className="text-xs font-mono">#fbbf24</p>
                  <p className="text-xs text-gray-600">Warning</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tipografía */}
        <section className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Typography</h2>
          
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h1 className="text-5xl font-bold text-gray-900 mb-2">Heading 1</h1>
              <p className="text-sm text-gray-600 font-mono">text-5xl font-bold</p>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">Heading 2</h2>
              <p className="text-sm text-gray-600 font-mono">text-3xl font-semibold</p>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Heading 3</h3>
              <p className="text-sm text-gray-600 font-mono">text-xl font-semibold</p>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <p className="text-base text-gray-900 mb-2">Body text - Regular paragraph with normal weight</p>
              <p className="text-sm text-gray-600 font-mono">text-base text-gray-900</p>
            </div>
            <div className="pb-4">
              <p className="text-sm text-gray-600 mb-2">Small text - Secondary information</p>
              <p className="text-sm text-gray-600 font-mono">text-sm text-gray-600</p>
            </div>
          </div>
        </section>

        {/* Botones */}
        <section className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Buttons</h2>
          
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Secondary Button
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                Tertiary Button
              </button>
              <button className="px-4 py-2 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed">
                Disabled Button
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-sm rounded-lg transition-colors">
                Small Button
              </button>
              <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium text-lg rounded-lg transition-colors">
                Large Button
              </button>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Card Title</h3>
              <p className="text-sm text-gray-600">Card with subtle border and padding</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Highlighted Card</h3>
              <p className="text-sm text-gray-600">Card with gray background</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Info Card</h3>
              <p className="text-sm text-blue-800">Card for information messages</p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Success Card</h3>
              <p className="text-sm text-green-800">Card for success messages</p>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Form Elements</h2>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Input
              </label>
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success State
              </label>
              <input
                type="text"
                value="Valid input"
                readOnly
                className="w-full px-4 py-3 border border-green-300 bg-green-50 rounded-lg text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error State
              </label>
              <input
                type="text"
                value="Invalid input"
                readOnly
                className="w-full px-4 py-3 border border-red-300 bg-red-50 rounded-lg text-sm"
              />
              <p className="mt-1 text-xs text-red-600">This field has an error</p>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Badges & Pills</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              Default
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              Primary
            </span>
            <span className="px-3 py-1 bg-green-100 border border-green-200 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Success
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
              Error
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
              Warning
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
