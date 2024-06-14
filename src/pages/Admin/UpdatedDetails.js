import React, { useEffect, useState } from "react";
import { onGetTaskHandler } from "../../services/common";
import { useParams } from "react-router-dom";
import axios from "axios";
import { REACT_APP_IP } from "../../services/common";
import { toast } from "react-toastify";

function UpdatedDetails() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [allTasks, setAllTasks] = useState([]);
  const rowsPerPage = 5;
  const [updatedData, setUpdatedData] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  let token = JSON.parse(localStorage.getItem("userData"));
  const { id } = useParams();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        setIsVisible(true);
      }
    };

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userTasks = await onGetTaskHandler(id);
        setAllTasks(userTasks);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTasks();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const onBackGroundClickHandler = (e) => {
    if (e.target.id === "modalBackground") {
      handleClose();
    }
  };

  const onUpdatedDetailsHandler = async (taskData) => {
    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/updated/details`,
        { taskData },
        {
          headers: {
            token: token,
          },
        }
      );
      setUpdatedData(response.data);
      setIsVisible(false);
      setCurrentTask(taskData);
      console.log(response);
    } catch (error) {
      toast.error(error?.response?.data?.error);
      console.log(error);
    }
  };

  const totalPages = Math.ceil(allTasks.length / rowsPerPage);

  const renderTableRows = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const selectedRows = allTasks?.slice(startIndex, startIndex + rowsPerPage);
    return selectedRows.map((taskData, index) => (
      <div key={taskData.id} className="flex  py-2 w-full">
        <div className="whitespace-nowrap w-[150px] px-4">
          <div className="text-md text-center">{index + 1}</div>
        </div>
        <div className="whitespace-nowrap w-[150px] px-4">
          <div className="text-md text-center font-semibold py-1 border-2">
            {taskData.min}
          </div>
        </div>
        <div className="whitespace-nowrap w-[150px] px-4">
          <div className="text-md text-center font-semibold py-1 border-2">
            {taskData.max}
          </div>
        </div>

        <div className="whitespace-nowrap w-[150px] px-4">
          <div className="text-md text-center font-semibold py-1 border-2">
            {taskData.moduleType}
          </div>
        </div>

        <div className="whitespace-nowrap w-[150px] px-4">
          <div className="text-md text-center">
            <span
              className={`inline-flex items-center justify-center rounded-full ${
                !taskData.blankTaskStatus || !taskData.multTaskStatus
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              } px-2.5 py-0.5 `}
            >
              {!taskData.blankTaskStatus || !taskData.multTaskStatus ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="-ms-1 me-1.5 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="-ms-1 me-1.5 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <p className="whitespace-nowrap text-sm">
                {taskData.blankTaskStatus && taskData.multTaskStatus
                  ? "Completed"
                  : "Pending"}
              </p>
            </span>
          </div>
        </div>
        <div className="whitespace-nowrap text-center w-[150px] px-4">
          <button
            className="rounded-3xl border border-indigo-500 bg-indigo-500 px-6 py-1 font-semibold text-white"
            onClick={() => onUpdatedDetailsHandler(taskData)}
          >
            Show
          </button>
        </div>
      </div>
    ));
  };

  const renderPagination = () => {
    return (
      <ol className="flex justify-end gap-1 text-xs font-medium">
        <li>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="sr-only">Prev Page</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>

        {[...Array(totalPages)].map((_, index) => (
          <li key={index}>
            <button
              onClick={() => setCurrentPage(index + 1)}
              className={`block size-8 rounded border border-gray-100 bg-white text-center leading-8 ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "text-gray-900"
              }`}
            >
              {index + 1}
            </button>
          </li>
        ))}

        <li>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="sr-only">Next Page</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      </ol>
    );
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-r from-blue-400 to-blue-600 h-[100vh] pt-20">
      {isVisible ? (
        <div
          id="modalBackground"
          className="flex justify-center items-center"
          onClick={onBackGroundClickHandler}
        >
          <div
            role="alert"
            className="rounded-xl border border-gray-100 bg-white p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="block text-gray-900 text-3xl font-semibold">
                  All Tasks
                </h1>
              </div>
            </div>
            <div className=" rounded-xl my-6">
              <div className="rounded-lg ">
                <div className="inline-block align-middle md:px-6 py-4 px-16">
                  <div className=" border border-gray-200 md:rounded-lg">
                    <div className="divide-y divide-gray-200 py-4 px-8">
                      <div className="bg-gray-50 w-full">
                        <div className="flex">
                          <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[150px]">
                            <span>SN.</span>
                          </div>
                          <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[150px]">
                            Min
                          </div>
                          <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[150px]">
                            Max
                          </div>
                          <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[150px]">
                            Module
                          </div>
                          <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[150px]">
                            Status
                          </div>
                          <div className=" px-4 py-3.5 text-center text-xl font-semibold text-gray-700 w-[150px]">
                            UpdatedDetails
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200 bg-white overflow-y-auto max-h-[300px]">
                        {renderTableRows()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-b-lg border-gray-200">
                  {renderPagination()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl w-[800px] shadow-sm shadow-white">
          <div className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm w-full">
            <div className="px-4 py-8">
              <h1 className="text-3xl font-semibold px-4 pb-8 pt-4">
                Updated Details
              </h1>
              <div className="mx-4 border-2 rounded-xl">
                <div className="ltr:text-left rtl:text-right">
                  <div className="text-xl flex font-bold text-center">
                    <div className="whitespace-nowrap px-4 py-4 font-medium text-gray-900 w-1/4">
                      Key
                    </div>
                    <div className="whitespace-nowrap px-4 py-4 font-medium text-gray-900 w-1/4">
                      Row Index
                    </div>
                    <div className="whitespace-nowrap px-4 py-4 font-medium text-gray-900 w-1/4">
                      Updated Data
                    </div>
                    <div className="whitespace-nowrap px-4 py-4 font-medium text-gray-900 w-1/4">
                      Previous Data
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 text-center overflow-y-auto h-[280px]">
                  {Array.from({ length: updatedData.rowIndex.length }).map(
                    (_, index) => {
                      const updatedKeyData =
                        updatedData?.updatedColumn[index]?.split(",") || [];
                      const updatedCurrentData =
                        updatedData?.currentData[index]?.split(",") || [];
                      const previousData =
                        updatedData?.previousData[index]?.split(",") || [];
                      return (
                        <>
                          {updatedKeyData.map((d, i) => (
                            <div
                              key={i}
                              className={`flex border ${
                                i % 2 === 0 ? "odd:bg-blue-50" : ""
                              }`}
                            >
                              <div className=" flex whitespace-nowrap px-4 py-3 font-medium text-gray-900 w-1/4">
                                <div className="whitespace-nowrap px-4 py-3 text-gray-700 w-1/4">
                                  {d}
                                </div>
                              </div>
                              <div className="whitespace-nowrap px-4 py-3 text-gray-700 w-1/4">
                                {updatedData?.rowIndex[index]}
                              </div>
                              <div className="whitespace-nowrap px-4 py-3 text-gray-700 w-1/4">
                                {updatedCurrentData[i]}
                              </div>
                              <div className="whitespace-nowrap px-4 py-3 text-gray-700 w-1/4">
                                {previousData[i]}
                              </div>
                            </div>
                          ))}
                        </>
                      );
                    }
                  )}
                </div>
                <div className="flex justify-center py-4">
                  {/* {renderPageNumbers} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdatedDetails;
