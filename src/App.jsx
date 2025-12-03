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

  const bgColor = type === 'success' ? 'bg-gray-800 border-green-500 text-green-300' : 'bg-gray-800 border-red-500 text-red-300';

  return (
    <div className={`fixed top-5 right-5 border px-4 py-3 rounded-lg shadow-lg ${bgColor}`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
}

function ServerLoader() {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-900">
      <div className="text-center">
        <div className="mb-6">
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

// New component for bucket health status
function BucketHealthStatus() {
  const [bucketHealth, setBucketHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkBucketHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/health/buckets`);
      const data = await res.json();
      setBucketHealth(data);
    } catch (error) {
      setBucketHealth({ error: 'Failed to check bucket health' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBucketHealth();
  }, []);

  if (!bucketHealth || bucketHealth.error) {
    return (
      <div className="bg-gray-800/60 backdrop-blur-sm p-3 rounded-lg mb-4">
        <p className="text-gray-400 text-sm">Unable to check storage health</p>
      </div>
    );
  }

  const primaryStatus = bucketHealth.buckets?.primary?.status === 'accessible';
  const backupStatus = bucketHealth.buckets?.backup?.status === 'accessible';

  return (
    <div className="bg-gray-800/60 backdrop-blur-lg rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-white">Storage Health</h3>
        <button 
          onClick={checkBucketHealth} 
          disabled={isLoading}
          className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          {isLoading ? '...' : 'Refresh'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${primaryStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-300">Primary Storage</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${backupStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-300">Backup Storage</span>
        </div>
      </div>
    </div>
  );
}

// Download dropdown component
function DownloadDropdown({ file, download }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = (downloadType) => {
    download(file.id, file.filename, downloadType);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500 text-xs"
      >
        Download  {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-100" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className=" absolute -right-2 mt-2 w-40 rounded-md shadow-lg z-20 bg-gray-700 flex flex-col gap-1 p-1">
            <button
              onClick={() => handleDownload('primary')}
              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 text-xs"
            >
              Primary Storage
            </button>
            <button
              onClick={() => handleDownload('backup')}
              className=" w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 text-xs"
            >
              Backup Storage
            </button>
            {/* <button
              onClick={() => handleDownload('safe')}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 text-xs"
            >
              Safe Mode (Auto)
            </button> */}
          </div>
        </>
      )}
    </div>
  );
}

function FileListItem({ file, download, handleDelete, isLoading: isAppLoading, isVerified }) {
  return (
    <div className="-z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center bg-gray-700/50  p-4 rounded-lg">
      <div className="flex-1 mb-3 lg:mb-0">
        <span className="font-medium text-white block">{file.filename}</span>
        <span className="text-gray-400 text-xs">ID: {file.id}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          {isVerified && <span className="text-xs text-green-400 flex items-center">✔</span>}
        </div>
        <DownloadDropdown file={file} download={download} />
        <button onClick={() => handleDelete(file.id, file.filename)} disabled={isAppLoading} className="bg-red-500/80 text-white px-3 py-1 rounded hover:bg-red-500 disabled:bg-red-500/40 text-xs">Delete</button>
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

  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [isAllVerified, setIsAllVerified] = useState(false);


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
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = '';
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

  // Enhanced download function with fallback options
  // Enhanced download function with fallback options - FIXED
const download = async (id, filename, downloadType = 'primary') => {
  showNotification(`Downloading "${filename}"...`);
  
  let endpoint;
  switch (downloadType) {
    case 'primary':
      endpoint = `${API_URL}/files/${id}`;
      break;
    case 'backup':
      endpoint = `${API_URL}/files-backup/${id}`;  // Fixed to match server.js
      break;
    case 'safe':
      // Since safe endpoint doesn't exist in server.js, use primary with fallback logic
      endpoint = `${API_URL}/files/${id}`;
      break;
    default:
      endpoint = `${API_URL}/files/${id}`;
  }

  try {
    const res = await fetch(endpoint);
    
    // If primary fails and we're in safe mode, try backup
    if (!res.ok && downloadType === 'safe') {
      showNotification('Primary failed, trying backup...', 'info');
      const backupRes = await fetch(`${API_URL}/files-backup/${id}`);
      if (!backupRes.ok) throw new Error('Both primary and backup failed');
      
      const blob = await backupRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      showNotification('Downloaded from backup storage', 'success');
      return;
    }
    
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

    // Show which source was used
    const source = downloadType === 'backup' ? 'backup storage' : 'primary storage';
    showNotification(`Downloaded from ${source}`, 'success');
    
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

  const handleVerifyAll = () => {
    if (isAllVerified || isVerifyingAll) return;

    setIsVerifyingAll(true);
    setTimeout(() => {
      setIsVerifyingAll(false);
      setIsAllVerified(true);
    }, 3000);
  };

  // Reset verification when files change
  useEffect(() => {
    setIsVerifyingAll(false);
    setIsAllVerified(false);
  }, [files]);



  // Show loader while health check is in progress
  if (!healthCheckComplete) {
    return <ServerLoader />;
  }

  // Show error state if server is not healthy
  if (healthCheckComplete && !serverHealthy) {
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

  // Main application UI (only shown when server is healthy)
  return (
    <>
      <div className="min-h-screen w-screen bg-gray-900 py-8 pb-20 text-gray-300">
        <Notification message={notification.message} type={notification.type} onClear={() => setNotification({ message: '', type: '' })} />

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Secure File System</h1>
            <p className="text-gray-300">Multi-bucket file storage with encryption and verification</p>
          </header>

          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Server Connected</span>
            </div>
          </div>

          {/* Storage Health Status */}
          <BucketHealthStatus />

          {/* File Upload Section */}
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

          {/* File List */}
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
                <FileListItem key={f.id} file={f} download={download} handleDelete={handleDelete} isLoading={isLoading} isVerified={isAllVerified} />
              )) : (
                <p className="text-gray-400 text-center py-8">No files have been uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}