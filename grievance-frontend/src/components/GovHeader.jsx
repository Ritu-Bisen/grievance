
export default function GovHeader({ children }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LEFT: TITLE */}
        <div>
          <h1 className="text-xl font-semibold">
            Chhattisgarh Medical Services Corporation Ltd.
          </h1>
          <p className="text-sm">
            Government of Chhattisgarh Undertaking
          </p>
        </div>

        {/* RIGHT: ACTION BUTTON */}
        <div className=" ">
          {children}
        </div>

      </div>

      {/* SUB HEADER */}
      <div className="bg-blue-900 px-6 py-2">
        <h2 className="text-lg font-medium">
          facility users
        </h2>
      </div>
    </div>
  );
}
