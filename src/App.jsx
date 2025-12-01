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

useEffect(async () => {
  const res = await fetch(`${API_URL}/`);
  if (!res.ok) throw new Error('Server not healthy');
  setServerHealthy(true);
  
},[])

export default function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [serverHealthy, setServerHealthy] = useState(true);

  useEffect(() => { fetchList(); }, []);

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
    if (!file) return showNotification("Please choose a file first.", 'error');
    setIsLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
      if (res.ok) {
        showNotification("File uploaded successfully!");
        fetchList();
        setFile(null);
        document.querySelector('input[type="file"]').value = '';
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

  const handleCorrupt = async (id, filename) => {
    if (!window.confirm(`This is a test function. Are you sure you want to corrupt the primary copy of "${filename}"?`)) return;
    await fetch(`${API_URL}/debug/corrupt/${id}`, { method: 'POST' });
    showNotification(`Primary file for "${filename}" has been corrupted. Try downloading it to see self-healing.`, 'success');
  };

  const handleVerify = async () => {
    const res = await fetch(`${API_URL}/verify`);
    const report = await res.json();
    const reportString = report.map(r => `${r.filename}: ${r.status}`).join('\n');
    alert('Verification Report:\n\n' + reportString);
  };

  return (
    <>
      <div className="h-screen w-screen flex justify-center items-center">
      <Notification message={notification.message} type={notification.type} onClear={() => setNotification({ message: '', type: '' })} />

      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Secure File System</h1>
          <p className="text-gray-600">Try uploading, downloading, and managing checksum-verified files.</p>
        </header>

        <div className="mb-8">
          <p className="text-sm text-gray-400"> It might take 50 seconds to start the server for the first time. Please be patient. </p>
          {serverHealthy}
          </div>

        <div className="bg-white/10 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload a New File</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              
              onClick={upload}
              disabled={isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="bg-white/10 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Stored Files</h2>
            {/* <button onClick={handleVerify} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm">
              Verify All
            </button>  */}
          </div>
          <ul className="space-y-3">
            {files.length > 0 ? files.map(f => (
              <li key={f.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/30 p-3 rounded-lg">
                <span className="font-medium text-white mb-2 sm:mb-0">{f.filename}</span>
                <div className="flex space-x-2">
                  <button onClick={() => download(f.id, f.filename)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs">Download</button>
                  <button onClick={() => handleDelete(f.id, f.filename)} disabled={isLoading} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-red-300 text-xs">Delete</button>
                </div>
              </li>
            )) : (
              <p className="text-gray-500 text-center py-4">No files have been uploaded yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}
