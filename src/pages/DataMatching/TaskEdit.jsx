import React from "react";
import { FaRegUser } from "react-icons/fa";

const TaskEdit = ({ taskEdit, setTaskEdit, allUsers, onEditTaskHandler }) => {
  return (
    <div>
      {taskEdit && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      onClick={() => setTaskEdit(false)}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6 text-red-600 cursor-pointer"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg font-medium text-white"
                      id="modal-title"
                    >
                      Edit Task
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-white">
                        Assign this task to a user.
                      </p>
                      <div className="mt-4 max-h-64 overflow-y-auto bg-white p-4 rounded-md shadow-inner">
                        {allUsers.map((user) => (
                          <>
                            {user.role !== "Admin" && (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-2 border-b hover:bg-gray-100 rounded-md transition duration-150"
                              >
                                <div className="flex items-center">
                                  <span
                                    className="h-12 w-12 rounded-full object-cover mt-4"
                                    src={<FaRegUser />}
                                    alt={user.userName}
                                  >
                                    {<FaRegUser />}
                                  </span>
                                  <span className="ml-3 font-medium text-gray-700">
                                    {user.userName}
                                  </span>
                                  <span className="ml-3 font-medium text-gray-700">
                                    {user.email}
                                  </span>
                                </div>
                                <button
                                  onClick={() => onEditTaskHandler(user)}
                                  className="ml-2 inline-flex justify-center w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                                >
                                  Assign
                                </button>
                              </div>
                            )}
                          </>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end py-3 px-3 bg-gray-100">
                <button
                  onClick={() => setTaskEdit(false)}
                  type="button"
                  className="inline-flex justify-center cursor-pointer rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskEdit;
