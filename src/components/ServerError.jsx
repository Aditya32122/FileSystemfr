export default function ServerError() {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-900">
      <div className="text-center p-8">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-500/30 rounded-full flex items-center justify-center border-2 border-red-500">
            <span className="text-red-400 text-2xl">!</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Server Unavailable</h2>
        <p className="text-gray-300 mb-4">
          Unable to connect to the file server. Please try again later.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
