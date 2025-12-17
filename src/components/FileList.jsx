import FileListItem from "./FileListItem";

export default function FileList({ 
  files, 
  download, 
  handleDelete, 
  isLoading, 
  isVerifyingAll, 
  isAllVerified, 
  handleVerifyAll 
}) {
  return (
    <div className="bg-gray-800/60 backdrop-blur-lg shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Stored Files ({files.length})</h2>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleVerifyAll}>
          {isVerifyingAll ? (
            <span className="text-xs text-yellow-400 animate-pulse">Verifying All...</span>
          ) : isAllVerified ? (
            <span className="text-xs text-green-400 flex items-center">✔ All Verified</span>
          ) : (
            <label htmlFor="verify-all" className="text-xs text-gray-300 flex items-center cursor-pointer">
              <input id="verify-all" type="checkbox" className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500" />
              <span className="ml-2">Verify All</span>
            </label>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {files.length > 0 ? files.map(f => (
          <FileListItem 
            key={f.id} 
            file={f} 
            download={download} 
            handleDelete={handleDelete} 
            isLoading={isLoading} 
            isVerified={isAllVerified} 
          />
        )) : (
          <p className="text-gray-400 text-center py-8">No files have been uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
