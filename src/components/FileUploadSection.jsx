export default function FileUploadSection({ 
  uploadMode, 
  setUploadMode, 
  file, 
  setFile, 
  textFileName, 
  setTextFileName, 
  textContent, 
  setTextContent, 
  upload, 
  isLoading 
}) {
  return (
    <div className="bg-gray-800/60 backdrop-blur-lg shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Upload a New File</h2>
      
      {/* Upload Mode Toggle */}
      <div className="flex mb-4 space-x-4">
        <button
          onClick={() => setUploadMode('file')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            uploadMode === 'file' 
              ? 'bg-gray-600 text-white' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setUploadMode('text')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            uploadMode === 'text' 
              ? 'bg-gray-600 text-white' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Create Text File
        </button>
      </div>

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div className="flex items-center space-x-4">
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
          />
          <button
            onClick={upload}
            disabled={isLoading}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 transition-colors"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {/* Text Upload Mode */}
      {uploadMode === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              File Name (with extension, e.g., myfile.txt)
            </label>
            <input
              type="text"
              value={textFileName}
              onChange={(e) => setTextFileName(e.target.value)}
              placeholder="Enter filename (e.g., notes.txt, config.json)"
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Text Content
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste or type your text content here..."
              rows={8}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-vertical"
            />
            <div className="text-xs text-gray-400 mt-1">
              Characters: {textContent.length}
            </div>
          </div>
          <button
            onClick={upload}
            disabled={isLoading || !textContent.trim() || !textFileName.trim()}
            className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 transition-colors"
          >
            {isLoading ? 'Creating File...' : 'Create & Upload File'}
          </button>
        </div>
      )}
    </div>
  );
}
