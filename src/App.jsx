import { useState, useEffect } from "react";

const API_URL = "https://filesystembk-1.onrender.com";

function Notification({ message, type, onClear }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';

  return (
    <div className={`fixed top-5 right-5 border px-4 py-3 rounded shadow-lg ${bgColor}`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
}

function ServerLoader() {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-br">
      <div className="text-center">
        <div className="mb-6">
          {/* Spinning loader */}
          <div className="w-16 h-16 mx-auto border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Starting Server</h2>
        <p className="text-gray-300 max-w-md">
          Please wait while we connect to the server. This might take up to 50 seconds for the first time.
        </p>
        <div className="mt-4">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [serverHealthy, setServerHealthy] = useState(false);
  const [healthCheckComplete, setHealthCheckComplete] = useState(false);
  
  // New states for text upload
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [textContent, setTextContent] = useState('');
  const [textFileName, setTextFileName] = useState('');

  // Health check effect
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (res.ok) {
          setServerHealthy(true);
          showNotification('Server connected successfully!');
        } else {
          throw new Error('Server not healthy');
        }
      } catch (error) {
        setServerHealthy(false);
        showNotification('Failed to connect to server. Please try refreshing.', 'error');
      } finally {
        setHealthCheckComplete(true);
      }
    };

    checkServerHealth();
  }, []);

  // Fetch files only after server is healthy
  useEffect(() => {
    if (serverHealthy && healthCheckComplete) {
      fetchList();
    }
  }, [serverHealthy, healthCheckComplete]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_URL}/list`);
      const data = await res.json();
      setFiles(data);
    } catch (e) {
      showNotification('Could not connect to the server.', 'error');
    }
  };

  const upload = async () => {
    if (uploadMode === 'file' && !file) {
      return showNotification("Please choose a file first.", 'error');
    }
    
    if (uploadMode === 'text' && (!textContent.trim() || !textFileName.trim())) {
      return showNotification("Please provide both filename and text content.", 'error');
    }

    setIsLoading(true);
    const form = new FormData();
    
    if (uploadMode === 'file') {
      form.append("file", file);
    } else {
      // Create a file from text content
      const blob = new Blob([textContent], { type: 'text/plain' });
      const textFile = new File([blob], textFileName, { type: 'text/plain' });
      form.append("file", textFile);
    }

    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
      if (res.ok) {
        showNotification("File uploaded successfully!");
        fetchList();
        
        // Clear form
        if (uploadMode === 'file') {
          setFile(null);
          document.querySelector('input[type="file"]').value = '';
        } else {
          setTextContent('');
          setTextFileName('');
        }
      } else {
        const err = await res.json();
        showNotification(`Upload failed: ${err.error}`, 'error');
      }
    } catch (e) {
      showNotification('Upload failed due to a network error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const download = async (id, filename) => {
    showNotification(`Downloading "${filename}"...`);
    try {
      const res = await fetch(`${API_URL}/files/${id}`);
      if (!res.ok) throw new Error('Download failed - File Corrupted');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      showNotification('Download failed - File Corrupted', 'error');
    }
  };

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/files/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('File deleted successfully!');
        fetchList();
      } else {
        const err = await res.json();
        showNotification(`Deletion failed: ${err.error}`, 'error');
      }
    } catch (e) {
      showNotification('Deletion failed due to a network error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loader while health check is in progress
  if (!healthCheckComplete) {
    return <ServerLoader />;
  }

  // Show error state if server is not healthy
  if (healthCheckComplete && !serverHealthy) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-br">
        <div className="text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">✕</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Server Unavailable</h2>
          <p className="text-gray-300 mb-4">
            Unable to connect to the file server. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Main application UI (only shown when server is healthy)
  return (
    <>
      <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-br">
        <Notification message={notification.message} type={notification.type} onClear={() => setNotification({ message: '', type: '' })} />

        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Secure File System</h1>
            <p className="text-gray-300">Try uploading, downloading, and managing checksum-verified files.</p>
          </header>

          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Server Connected</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Upload a New File</h2>
            
            {/* Upload Mode Toggle */}
            <div className="flex mb-4 space-x-4">
              <button
                onClick={() => setUploadMode('file')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  uploadMode === 'file' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                 Upload File
              </button>
              <button
                onClick={() => setUploadMode('text')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  uploadMode === 'text' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
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
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={upload}
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
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
                    className="w-full px-3 py-2 bg-white/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 bg-white/20 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Characters: {textContent.length}
                  </div>
                </div>
                <button
                  onClick={upload}
                  disabled={isLoading || !textContent.trim() || !textFileName.trim()}
                  className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                >
                  {isLoading ? 'Creating File...' : 'Create & Upload File'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Stored Files</h2>
            </div>
            <ul className="space-y-3">
              {files.length > 0 ? files.map(f => (
                <li key={f.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <span className="font-medium text-white mb-2 sm:mb-0">{f.filename}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => download(f.id, f.filename)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs">Download</button>
                    <button onClick={() => handleDelete(f.id, f.filename)} disabled={isLoading} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-red-300 text-xs">Delete</button>
                  </div>
                </li>
              )) : (
                <p className="text-gray-400 text-center py-4">No files have been uploaded yet.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}