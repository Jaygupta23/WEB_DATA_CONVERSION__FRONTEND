import React from "react";

const ModalWithLoadingBar = ({ isOpen, onClose, progress, message }) => {
  return (
    // Modal backdrop and container
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      {/* Backdrop to block interactions with elements behind the modal */}
      <div className="fixed inset-0 bg-gray-900 opacity-75"></div>

      {/* Modal container */}
      <div className="relative bg-white rounded-lg p-8 max-w-md mx-auto z-50">
        {/* Loading bar container */}
        <div>
          <span id="ProgressLabel" className="sr-only">
            Loading
          </span>

          <span
            role="progressbar"
            aria-labelledby="ProgressLabel"
            aria-valuenow="50"
            className="block rounded-full bg-gray-200"
          >
            <span
              className="block h-4 rounded-full bg-indigo-600 text-center text-[10px]/4"
              style={{ width: `${progress}%` }}
            >
              <span className="font-bold text-white">{progress}% </span>
            </span>
          </span>
        </div>

        {/* Modal content */}
        {progress !== 100 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Uploading Files</h2>
            <p className="text-gray-700 mb-2">
              Your files are being uploaded to the server.
            </p>
          </div>
        )}
        {progress === 100 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">{message}</h2>
          </div>
        )}

        {/* Close button */}
        {/* <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button> */}
      </div>
    </div>
  );
};

export default ModalWithLoadingBar;
