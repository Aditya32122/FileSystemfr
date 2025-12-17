import { useState } from "react";
import DownloadModal from "./DownloadModal";

export default function FileListItem({ file, download, handleDelete, isLoading: isAppLoading, isVerified }) {
  const [downloadModal, setDownloadModal] = useState(false);

  const handleDownloadClick = () => {
    setDownloadModal(true);
  };

  const closeModal = () => {
    setDownloadModal(false);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-gray-700/50 p-4 rounded-lg">
        <div className="flex-1 mb-3 lg:mb-0">
          <span className="font-medium text-white block">{file.filename}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {isVerified && <span className="text-xs text-green-400 flex items-center">✔</span>}
          </div>
          
          {/* Safe Download Button */}
          <button
            onClick={handleDownloadClick}
            disabled={isAppLoading}
            className="bg-blue-500/80 text-white px-3 py-1 rounded hover:bg-blue-500 disabled:bg-blue-500/40 text-xs"
          >
            Safe Download
          </button>
          
          {/* Delete Button */}
          <button 
            onClick={() => handleDelete(file.id, file.filename)} 
            disabled={isAppLoading} 
            className="bg-red-500/80 text-white px-3 py-1 rounded hover:bg-red-500 disabled:bg-red-500/40 text-xs"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={downloadModal}
        onClose={closeModal}
        file={file}
        onDownload={download}
      />
    </>
  );
}
