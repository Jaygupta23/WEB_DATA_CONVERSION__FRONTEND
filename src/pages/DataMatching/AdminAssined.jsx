import React, { useEffect, useState } from "react";
import {
  REACT_APP_IP,
  onGetAllTasksHandler,
  onGetTemplateHandler,
  onGetAllUsersHandler,
} from "../../services/common";
import axios from "axios";
import { toast } from "react-toastify";

const AdminAssined = () => {
  const [compareTask, setCompareTask] = useState([]);
  const [matchingTask, setMatchingTask] = useState([]);
  const token = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          `http://${REACT_APP_IP}:4000/assignedTasks`,
          {
            headers: {
              token: token,
            },
          }
        );
        const AssignedData = response.data.assignedData;

        // const verifiedUser = await onGetVerifiedUserHandler();
        // const tasks = await onGetTaskHandler(verifiedUser.user.id);
        // const templateData = await onGetTemplateHandler();

        // const uploadTask = AssignedData.filter((task) => {
        //   return task.TemplateType === "Data Entry";
        // });
        const comTask = AssignedData.filter((task) => {
          return task.TemplateType === "CSVCompare";
        });

        // const updatedCompareTasks = comTask.map((task) => {
        //   const matchedTemplate = templateData.find(
        //     (template) => template.id === parseInt(task.templeteId)
        //   );
        //   if (matchedTemplate) {
        //     return {
        //       ...task,
        //       templateName: matchedTemplate.name,
        //     };
        //   }
        //   return task;
        // });
        // const updatedTasks = uploadTask.map((task) => {
        //   const matchedTemplate = templateData.find(
        //     (template) => template.id === parseInt(task.templeteId)
        //   );
        //   if (matchedTemplate) {
        //     return {
        //       ...task,
        //       templateName: matchedTemplate.name,
        //     };
        //   }
        //   return task;
        // });
        // setAllTasks(updatedTasks);
        // setMatchingTask(uploadTask);
        setCompareTask(comTask);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const onFetchTasksData = async () => {
      try {
        const tasks = await onGetAllTasksHandler();
        const templateData = await onGetTemplateHandler();
        const users = await onGetAllUsersHandler();

        const uploadTask = tasks.filter(
          (task) => task.moduleType === "Data Entry"
        );

        const updatedTasks = uploadTask.map((task) => {
          const matchedTemplate = templateData.find(
            (template) => template.id === parseInt(task.templeteId)
          );

          const matchedUser = users.users.find(
            (user) => user.id === parseInt(task.userId)
          );

          // Create a new task object with existing task properties
          const updatedTask = { ...task };

          // Add userName if matchedUser is found
          if (matchedUser) {
            updatedTask.userName = matchedUser.userName;
          }

          // Add templateName if matchedTemplate is found
          if (matchedTemplate) {
            updatedTask.templateName = matchedTemplate.name;
          }

          // Return the updated task
          return updatedTask;
        });

        setMatchingTask(updatedTasks);
      } catch (error) {
        console.error("Error fetching tasks data:", error);
      }
    };

    onFetchTasksData();
  }, []);

  const convertToCsv = (jsonData) => {
    const headers = Object.keys(jsonData[0]);
    const csvHeader = headers.join(",") + "\n";
    const csvData = jsonData
      .map((obj) => {
        return headers.map((key) => obj[key]).join(",");
      })
      .join("\n");
    return csvHeader + csvData;
  };
  const onCompareTaskStartHandler = (taskData) => {
    const sendReq = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          `http://${REACT_APP_IP}:4000/download_error_file/${taskData.id}`,
          {
            headers: {
              token: token,
            },
            // responseType: "blob", // Set the response type to blob to receive binary data
          }
        );
        const jsonObj = response.data.csvFile;
        const csvData = convertToCsv(jsonObj);
        const blob = new Blob([csvData], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        const date = new Date().toJSON();
        link.download = `data_${date}.csv`;
        link.click();
        // Create a blob from the response data
        // const blob = new Blob([response.data], { type: "text/csv" });

        // // Create a temporary URL for the blob
        // const url = window.URL.createObjectURL(blob);

        // // Create a link element
        // const link = document.createElement("a");

        // // Set the href attribute of the link to the temporary URL
        // link.href = url;

        // // Set the download attribute to specify the file name
        // link.download = "error_file.csv";

        // // Append the link to the document body
        // document.body.appendChild(link);

        // // Programmatically click on the link to trigger the download
        // link.click();

        // // Remove the link from the document body after the download is initiated
        // document.body.removeChild(link);

        // Display the message
        // console.log(response.data.message); // or handle the message as required
      } catch (err) {
        console.log(err);
      }
    };
    sendReq();
    console.log(taskData);
  };

  const onDownloadHandler = async (currentTaskData) => {
    if (!currentTaskData.blankTaskStatus || !currentTaskData.multTaskStatus) {
      toast.warning("The task is pending, so downloading is not available.");
      return;
    }

    try {
      const response = await fetch(
        `http://${REACT_APP_IP}:4000/download/csv/${currentTaskData.fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract the filename from the response headers if provided
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "download.csv";
      if (
        contentDisposition &&
        contentDisposition.indexOf("attachment") !== -1
      ) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const onCompleteHandler = async (currentTask) => {
    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/taskupdation/${parseInt(currentTask.id)}`,
        { blankTaskStatus: false, multTaskStatus: false },
        {
          headers: {
            token: token,
          },
        }
      );
      const updatedTasks = matchingTask.map((task) => {
        if (task.id === currentTask.id) {
          return { ...task, blankTaskStatus: false, multTaskStatus: false };
        }
        return task;
      });

      setMatchingTask(updatedTasks);
      toast.success("Task status updated.");
    } catch (error) {
      toast.error(error.message);
    }
  };


  return (
    <div className="h-[100vh] flex justify-center items-center bg-gradient-to-r from-blue-700 to-purple-700 templatemapping pt-20">
      <div className="">
        {/* MAIN SECTION  */}
        <section className=" lg:mx-auto max-w-6xl px-8 py-10 bg-white rounded-xl w-[100vw]">
          <div>
            <div>
              <h2 className="text-3xl font-semibold">Assigned Tasks</h2>
            </div>
          </div>
          <div className="mt-6 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto  sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                  <div className="min-w-full divide-y divide-gray-200">
                    <div className="bg-gray-50">
                      <div className="flex ">
                        <div className="py-3.5 text-xl text-center font-semibold text-gray-700 w-[150px]">
                          Template
                        </div>
                        <div className="py-3.5 text-center text-xl font-semibold text-gray-700 w-[150px]">
                          Assignee.
                        </div>
                        <div className="py-3.5 text-center text-xl font-semibold text-gray-700 w-[80px]">
                          Min
                        </div>
                        <div className="py-3.5 text-center text-xl font-semibold text-gray-700 w-[80px]">
                          Max
                        </div>
                        <div className="py-3.5 text-center text-xl font-semibold text-gray-700 w-[150px]">
                          Module Type
                        </div>
                        <div className="py-3.5 text-center text-xl font-semibold text-gray-700 w-[150px]">
                          Status
                        </div>
                        <div className="py-3.5 text-center text-xl font-semibold text-gray-700 w-[150px]">
                          Re-Assign
                        </div>
                        <div className="py-3.5 text-center text-xl font-semibold text-gray-700 w-[150px]">
                          Download
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200 bg-white overflow-y-auto h-[250px]">
                      {compareTask?.map((taskData) => (
                        <div
                          key={taskData.id}
                          className="flex"
                        >
                          <div className="whitespace-nowrap  w-[150px] py-2">
                            <div className="text-md text-center ">
                              {taskData.name}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[150px] py-2">
                            <div className="text-md text-center">
                              {taskData.userName}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[80px] py-2">
                            <div className="text-md text-center">
                              {taskData.min}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[80px] py-2">
                            <div className="text-md text-center">
                              {taskData.max}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[200px] py-2">
                            <div className="text-md text-center font-semibold border-2 py-1 ">
                              {taskData.TemplateType}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[200px] py-2">
                            <div className="text-md text-center ">
                              <span
                                className={`inline-flex items-center justify-center rounded-full ${
                                  !taskData.blankTaskStatus ||
                                  !taskData.multTaskStatus
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                                } px-2.5 py-0.5`}
                              >
                                {!taskData.blankTaskStatus ||
                                !taskData.multTaskStatus ? (
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
                                  {taskData.blankTaskStatus &&
                                  taskData.multTaskStatus
                                    ? "Completed"
                                    : "Pending"}
                                </p>
                              </span>
                            </div>
                          </div>
                          <div className="whitespace-nowrap text-center w-[200px] py-2">
                            <button
                              className={`rounded px-4 py-1 font-semibold ${
                                taskData.blankTaskStatus &&
                                taskData.multTaskStatus
                                  ? "bg-teal-300"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                              }`}
                              disabled={
                                !taskData.blankTaskStatus ||
                                !taskData.multTaskStatus
                              }
                            >
                              Start Again
                            </button>
                          </div>
                          <div className="whitespace-nowrap text-center w-[200px] py-2">
                            <button
                              onClick={() =>
                                onCompareTaskStartHandler(taskData)
                              }
                              className="rounded border border-indigo-500 bg-indigo-500 px-4 py-1 font-semibold text-white"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                      {matchingTask?.map((taskData) => (
                        <div key={taskData.id} className="flex ">
                          <div className="whitespace-nowrap w-[150px] py-2">
                            <div className="text-center text-md ">
                              {taskData.templateName}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[150px] py-2">
                            <div className="text-center text-md">
                              {taskData.userName}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[80px] py-2">
                            <div className="text-md text-center">
                              {taskData.min}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[80px] py-2">
                            <div className="text-md text-center">
                              {taskData.max}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[150px] py-2">
                            <div className="text-md text-center font-semibold border-2 py-1">
                              {taskData.moduleType}
                            </div>
                          </div>
                          <div className="whitespace-nowrap w-[150px] py-2">
                            <div className="text-md text-center">
                              <span
                                className={`inline-flex items-center justify-center rounded-full ${
                                  !taskData.blankTaskStatus ||
                                  !taskData.multTaskStatus
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                                } px-2.5 py-0.5`}
                              >
                                {!taskData.blankTaskStatus ||
                                !taskData.multTaskStatus ? (
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
                                <p className="whitespace-nowrap text-sm mt-1">
                                  {taskData.blankTaskStatus &&
                                  taskData.multTaskStatus
                                    ? "Completed"
                                    : "Pending"}
                                </p>
                              </span>
                            </div>
                          </div>
                          <div className="whitespace-nowrap text-center w-[150px] py-2">
                            <button
                              onClick={() => onCompleteHandler(taskData)}
                              className={`rounded-3xl px-4 py-1 font-semibold ${
                                taskData.blankTaskStatus &&
                                taskData.multTaskStatus
                                  ? "bg-indigo-500 text-white border border-indigo-500"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                              }`}
                              disabled={
                                !taskData.blankTaskStatus ||
                                !taskData.multTaskStatus
                              }
                            >
                              Start Again
                            </button>
                          </div>
                          <div className="whitespace-nowrap text-center w-[150px] py-2">
                            <button
                              onClick={() => onDownloadHandler(taskData)}
                              className="rounded-3xl border border-indigo-500 bg-indigo-500 px-4 py-1 font-semibold text-white"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminAssined;
