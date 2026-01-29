export default function LoginHeader({ title, subtitle, children }) {
  return (
    <header className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 shadow-lg mb-6">
    

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/cg-govt.png" 
              alt="Government of Chhattisgarh" 
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
            />
          </div>

          {/* Center Content */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2">
              {title || 'Chhattisgarh Medical Services Corporation Ltd.'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-blue-100 mb-1">
              {subtitle || 'Government of Chhattisgarh Undertaking'}
            </p>
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
              CIN No: U85110CT2010SGC022089 &nbsp;&nbsp; GST No: 22AAECC4504E1ZD
            </p>
          </div>

          {/* Right Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/cgmsc-logo.png" 
              alt="CGMSC Ltd - Promise for quality healthcare" 
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
            />
          </div>
        </div>

        {/* Children Section (e.g., buttons) */}
        {children && (
          <div className="mt-4 flex justify-center">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
