import React from "react";
import { FaCloudDownloadAlt } from "react-icons/fa";

const DeactivateModal = ({ isOpen, onClose }) => {
  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:px-2 sm:py-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3
                    className="text-2xl font-semibold leading-6 text-gray-700 "
                    id="modal-title"
                  >
                    Download File
                  </h3>
                  <div className="mt-6 px-6 ">
                  <div className="flex justify-between my-3 gap-2">
                      <h3
                        className="text-lg font-semibold leading-6 text-blue-500 w-40"
                        id="modal-title"
                      >
                        Error Corrected File
                      </h3>
                      <button
                       className="rounded-3xl border border-indigo-500 bg-indigo-500 px-4 py-1 font-semibold text-white"
                      ><FaCloudDownloadAlt /></button>
                    </div>
                    <div className="flex justify-between my-3 gap-2">
                      <h3
                        className="text-lg font-semibold leading-6 text-blue-500 w-40"
                        id="modal-title"
                      >
                         Corrected File
                      </h3>
                      <button
                       className="rounded-3xl border border-indigo-500 bg-indigo-500 px-4 py-1 font-semibold text-white"
                      ><FaCloudDownloadAlt /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => onClose()}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateModal;
