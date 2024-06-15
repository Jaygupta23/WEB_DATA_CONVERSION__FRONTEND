import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { toast } from "react-toastify";
import {
  onGetTaskHandler,
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
  REACT_APP_IP,
} from "../../services/common";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { LuLoader } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import AdminAssined from "./AdminAssined";

const DataMatching = () => {
  const [popUp, setPopUp] = useState(true);
  const [startModal, setStartModal] = useState(true);
  const [imageUrls, setImageUrls] = useState([]);
  const [templateHeaders, setTemplateHeaders] = useState();
  const [csvCurrentData, setCsvCurrentData] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [imageColName, setImageColName] = useState("");
  const [imageColNames, setImageColNames] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [blankCount, setBlackCount] = useState(1);
  const [currentTaskData, setCurrentTaskData] = useState({});
  const [selectedCoordintes, setSelectedCoordinates] = useState(false);
  const [blankChecked, setBlankChecked] = useState(false);
  const [modifiedKeys, setModifiedKeys] = useState({});
  const [multChecked, setMultChecked] = useState(false);
  const [allDataChecked, setAllDataChecked] = useState(false);
  const [imageNotFound, setImageNotFound] = useState(true);
  const [dataTypeChecker, setDataTypeChecker] = useState("");
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [compareTask, setCompareTask] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [userRole, setUserRole] = useState();
  const [loading, setLoading] = useState(false);
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const token = JSON.parse(localStorage.getItem("userData"));
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const verifiedUser = await onGetVerifiedUserHandler();

        setUserRole(verifiedUser.user.role);
        const tasks = await onGetTaskHandler(verifiedUser.user.id);
        const templateData = await onGetTemplateHandler();

        const uploadTask = tasks.filter((task) => {
          return task.moduleType === "Data Entry";
        });
        const comTask = tasks.filter((task) => {
          return task.moduleType === "CSV Compare";
        });

        const updatedCompareTasks = comTask.map((task) => {
          const matchedTemplate = templateData.find(
            (template) => template.id === parseInt(task.templeteId)
          );
          if (matchedTemplate) {
            return {
              ...task,
              templateName: matchedTemplate.name,
            };
          }
          return task;
        });
        const updatedTasks = uploadTask.map((task) => {
          const matchedTemplate = templateData.find(
            (template) => template.id === parseInt(task.templeteId)
          );
          if (matchedTemplate) {
            return {
              ...task,
              templateName: matchedTemplate.name,
            };
          }
          return task;
        });
        setAllTasks(updatedTasks);
        setCompareTask(updatedCompareTasks);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentUser();
  }, [popUp]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        console.log(response);
        const templateData = response.find(
          (data) => data.id === parseInt(currentTaskData.templeteId)
        );
        setTemplateHeaders(templateData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, [currentTaskData]);

  // Api for updating the csv data in the backend
  const onCsvUpdateHandler = async () => {
    console.log("Proble");
    if (!modifiedKeys) {
      onImageHandler("next", currentIndex, csvData, currentTaskData);
      toast.success("Data updated successfully.");
      return;
    }
    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/updatecsvdata/${parseInt(
          currentTaskData?.fileId
        )}`,
        {
          updatedData: csvCurrentData,
          index: csvCurrentData.rowIndex + 2,
          updatedColumn: modifiedKeys,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      setCsvData((prevCsvData) => {
        const newCsvData = [...prevCsvData];
        newCsvData[currentIndex] = csvCurrentData;
        return newCsvData;
      });
      onImageHandler("next", currentIndex, csvData, currentTaskData);
      toast.success("Data updated successfully.");
    } catch (error) {
      console.error("API error:", error);
      toast.error(error.message);
    }
  };

  // Sortcuts buttons
  useEffect(() => {
    if (!popUp) {
      const handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "ArrowLeft") {
          setPopUp(true);
        } else if (event.altKey && (event.key === "s" || event.key === "S")) {
          console.log("fdljknfj");
          setCsvCurrentData((prevData) => ({
            ...prevData,
          }));
          onCsvUpdateHandler();
        } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
          if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
            setSelectedCoordinates(false);
            setZoomLevel(1);

            if (imageRef.current) {
              imageRef.current.style.transform = "none";
              imageRef.current.style.transformOrigin = "initial";
            }
          } else {
            onImageHandler("prev", currentIndex, csvData, currentTaskData);
            setCurrentImageIndex(0);
          }
        } else if (event.key === "ArrowRight" || event.key === "PageDown") {
          if (currentImageIndex < imageUrls.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
            setSelectedCoordinates(false);
            setZoomLevel(1);
            if (imageRef.current) {
              imageRef.current.style.transform = "none";
              imageRef.current.style.transformOrigin = "initial";
            }
          } else {
            onImageHandler("next", currentIndex, csvData, currentTaskData);
            setCurrentImageIndex(0);
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [csvData, currentTaskData, setCsvCurrentData, onCsvUpdateHandler]);

  const handleKeyDownJump = (e, index) => {
    if (e.key === "Tab") {
      e.preventDefault();

      let nextIndex = index;
      let loopedOnce = false;
      const direction = e.shiftKey ? -1 : 1;

      while (!loopedOnce || nextIndex !== index) {
        // Calculate the next index
        nextIndex =
          (nextIndex + direction + inputRefs.current.length) %
          inputRefs.current.length;

        const [nextKey, nextValue] = Object.entries(csvCurrentData)[nextIndex];

        // Check if nextValue meets the condition
        if (
          nextValue === "" ||
          (nextValue &&
            typeof nextValue === "string" &&
            (nextValue.includes("*") || nextValue.includes(" ")))
        ) {
          // Update focus index
          setCurrentFocusIndex(nextIndex);
          // Ensure the input reference exists and is focusable
          if (inputRefs.current[nextIndex]) {
            inputRefs.current[nextIndex].focus();
          }
          break;
        }

        // Check if we have looped back to the original index
        if (nextIndex === index) {
          loopedOnce = true;
        }
      }
    }
  };

  // Api for getting the image from the backend
  const onImageHandler = async (
    direction,
    currMatchingIndex,
    csvData,
    taskData
  ) => {
    const headers = csvData[0];
    const getKeysByPattern = (object, pattern) => {
      const regex = new RegExp(pattern);
      return Object.keys(object).filter((key) => regex.test(object[key]));
    };

    const imageNames = [];
    for (let i = 0; i < templateHeaders.pageCount; i++) {
      imageNames.push(...getKeysByPattern(headers, `Image${i + 1}`));
    }
    setImageColNames(imageNames);

    try {
      let newIndex = currMatchingIndex;
      let allImagePaths;
      if (direction === "initial") {
        const objects = csvData[newIndex];
        allImagePaths = imageNames.map((key) => objects[key]);
        setCsvCurrentData(objects);
      } else {
        newIndex = direction === "next" ? newIndex + 1 : newIndex - 1;
        if (newIndex > 0 && newIndex < csvData.length) {
          setCurrentIndex(newIndex);
          const objects = csvData[newIndex];
          allImagePaths = imageNames.map((key) => objects[key]);
          setCsvCurrentData(objects);
        } else {
          toast.warning(
            direction === "next"
              ? "All images have been processed."
              : "You are already at the first image."
          );
          return;
        }
      }

      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/get/image`,
        {
          imageNameArray: allImagePaths,
          rowIndex: csvData[newIndex].rowIndex,
          id: taskData.id,
          colName: allDataChecked
            ? "allDataIndex"
            : multChecked && blankChecked
            ? "multAndBlankDataIndex"
            : multChecked && !blankChecked
            ? "multDataIndex"
            : !multChecked && blankChecked
            ? "blankDataIndex"
            : "",
        },
        {
          headers: {
            token: token,
          },
        }
      );
      // const url = response.data?.base64Image;
      // const pathParts = imageName1?.split("/");
      // setCurrImageName(pathParts[pathParts.length - 1]);
      setCurrentTaskData((prevData) => {
        if (direction === "next") {
          return {
            ...prevData,
            currentIndex: parseInt(prevData.currentIndex) + 1,
          };
        } else if (direction === "prev") {
          return {
            ...prevData,
            currentIndex: parseInt(prevData.currentIndex) - 1,
          };
        } else {
          return prevData;
        }
      });
      setSelectedCoordinates(false);
      if (imageRef.current) {
        imageRef.current.style.transform = "none";
        imageRef.current.style.transformOrigin = "initial";
      }
      setModifiedKeys(null);
      setZoomLevel(1);
      setImageUrls(response.data.arrayOfImages);
      setImageNotFound(true);
      setPopUp(false);
    } catch (error) {
      toast.error("Image not found!.");
      setImageNotFound(false);
    }
  };

  // const changeCurrentCsvDataHandler = (key, value) => {
  //   if (!imageNotFound) {
  //     return;
  //   }

  //   setCsvCurrentData((prevData) => ({
  //     ...prevData,
  //     [key]: value,
  //   }));

  //   setModifiedKeys((prevKeys) => {
  //     return {
  //       ...prevKeys,
  //       [key]: true,
  //     };
  //   });
  // };

  // Updating the input field
  // const changeCurrentCsvDataHandler = (key, value) => {
  //   if (!imageNotFound) {
  //     return;
  //   }

  //   setCsvCurrentData((prevData) => ({
  //     ...prevData,
  //     [key]: value,
  //   }));

  //   setModifiedKeys((prevKeys) => {
  //     return {
  //       ...prevKeys,
  //       [key]: true,
  //     };
  //   });
  // };

  // Updating the input field
  const changeCurrentCsvDataHandler = (key, newValue) => {
    if (!imageNotFound) {
      return;
    }

    const csvDataKeys = Object.keys(csvData[0]);
    let matchedValue = null;

    for (const dataKey of csvDataKeys) {
      if (dataKey === key) {
        matchedValue = csvData[0][key];
        break;
      }
    }
    const matchedCoordinate = templateHeaders?.templetedata?.find(
      (data) => data.attribute === matchedValue
    );

    setCsvCurrentData((prevData) => {
      const previousValue = prevData[key];

      // Check if matchedCoordinate.fieldType is "questionsField"
      if (matchedCoordinate?.fieldType === "questionsField") {
        const [start, end] = templateHeaders?.typeOption?.split("-");

        // Check if newValue is a single character or empty string
        if (newValue.length !== 1 && newValue !== "") {
          // If newValue is neither a single character nor empty string, return previous data
          return prevData;
        }

        // Convert start and end to character codes
        const charCodeStart = start.charCodeAt(0);
        const charCodeEnd = end.charCodeAt(0);

        // Convert newValue to character code
        const charCodeNewValue = newValue.charCodeAt(0);

        // Check if newValue falls within the range of start to end inclusively
        if (
          (charCodeNewValue >= charCodeStart &&
            charCodeNewValue <= charCodeEnd) ||
          newValue === ""
        ) {
          // Valid input or removal, proceed with updating data

          // Update modified keys
          setModifiedKeys((prevKeys) => ({
            ...prevKeys,
            [key]: [newValue, previousValue],
          }));

          // Update CSV data
          return {
            ...prevData,
            [key]: newValue,
          };
        } else {
          // Invalid input, return previous data
          return prevData;
        }
      } else {
        // For non-"questionsField" fields, return previous data
        // Update modified keys
        setModifiedKeys((prevKeys) => ({
          ...prevKeys,
          [key]: [newValue, previousValue],
        }));

        return {
          ...prevData,
          [key]: newValue,
        };
      }
    });
  };

  const imageFocusHandler = (headerName) => {
    const csvDataKeys = Object.keys(csvData[0]);
    let matchedValue = null;

    for (const key of csvDataKeys) {
      if (key === headerName) {
        matchedValue = csvData[0][key];
        break;
      }
    }
    const matchedCoordinate = templateHeaders?.templetedata?.find(
      (data) => data.attribute === matchedValue
    );

    if (matchedCoordinate) {
      setCurrentImageIndex(matchedCoordinate.pageNo);
    }

    if (!imageNotFound) {
      return;
    }

    if (!imageUrls || !imageContainerRef || !imageRef) {
      setPopUp(true);
    }

    if (!csvData[0].hasOwnProperty(headerName)) {
      toast.error("Header not found: " + headerName);
      return;
    }

    const metaDataEntry = templateHeaders.templetedata.find(
      (entry) => entry.attribute === csvData[0][headerName]
    );

    if (!metaDataEntry) {
      toast.warning("Metadata entry not found for " + headerName);
      return;
    }

    const { coordinateX, coordinateY, width, height } = metaDataEntry;

    const containerWidth = imageContainerRef?.current?.offsetWidth;
    const containerHeight = imageContainerRef?.current?.offsetHeight;

    // Calculate the zoom level based on the container size and the selected area size
    const zoomLevel = Math.min(
      containerWidth / width,
      containerHeight / height
    );

    // Calculate the scroll position to center the selected area
    const scrollX =
      coordinateX * zoomLevel - containerWidth / 2 + (width / 2) * zoomLevel;
    const scrollY =
      coordinateY * zoomLevel - containerHeight / 2 + (height / 2) * zoomLevel;

    // Update the img element's style property to apply the zoom transformation
    imageRef.current.style.transform = `scale(${zoomLevel})`;
    imageRef.current.style.transformOrigin = `0 0`;

    // Scroll to the calculated position
    imageContainerRef.current.scrollTo({
      left: scrollX,
      top: scrollY,
      behavior: "smooth",
    });
    setSelectedCoordinates(true);
  };

  const handleCheckboxChange = (checkbox) => {
    if (checkbox === "blank") {
      setBlankChecked(!blankChecked);
      setAllDataChecked(false);
    } else if (checkbox === "mult") {
      setMultChecked(!multChecked);
      setAllDataChecked(false);
    } else if (checkbox === "allData") {
      setAllDataChecked(!allDataChecked);
    }
  };

  const onTaskStartHandler = async () => {
    if (currentTaskData.blankTaskStatus && currentTaskData.multTaskStatus) {
      toast.warning("Task is already completed.");
      setPopUp(true);
      setStartModal(true);
      return;
    }

    if (blankChecked && blankCount < 1) {
      toast.warning("Please enter a value greater than zero for blank.");
      return;
    }

    if (!blankChecked && !multChecked && !allDataChecked) {
      toast.warning("Please select at least one option.");
      return;
    }

    if (blankChecked && !blankCount) {
      toast.warning("Please enter the number of blanks.");
      return;
    }
    setLoading(true);
    const conditions = {
      Blank: blankChecked ? Number(blankCount) : 0,
      "*": multChecked,
      AllData: allDataChecked,
    };

    const updatedTasks = {
      ...currentTaskData,
      conditions,
    };

    if (allDataChecked) {
      setDataTypeChecker("allDataIndex");
    } else if (multChecked && blankChecked) {
      setDataTypeChecker("multAndBlankDataIndex");
    } else if (multChecked && !blankChecked) {
      setDataTypeChecker("multDataIndex");
    } else if (!multChecked && blankChecked) {
      setDataTypeChecker("blankDataIndex");
    }

    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/get/csvdata`,
        { taskData: updatedTasks },
        {
          headers: {
            token: token,
          },
        }
      );
      let currRowIndex;

      if (allDataChecked) {
        setDataTypeChecker("allDataIndex");
        currRowIndex = response.data.rowIndexdata.allDataIndex;
      } else if (multChecked && blankChecked) {
        setDataTypeChecker("multAndBlankDataIndex");
        currRowIndex = response.data.rowIndexdata.multAndBlankDataIndex;
      } else if (multChecked && !blankChecked) {
        setDataTypeChecker("multDataIndex");
        currRowIndex = response.data.rowIndexdata.multDataIndex;
      } else if (!multChecked && blankChecked) {
        setDataTypeChecker("blankDataIndex");
        currRowIndex = response.data.rowIndexdata.blankDataIndex;
      }

      setCsvData(response.data.filteredData);
      let matchingIndex;
      for (let i = 0; i < response.data.filteredData.length; i++) {
        if (response.data.filteredData[i].rowIndex === Number(currRowIndex)) {
          matchingIndex = i;
          break;
        }
      }

      if (matchingIndex === 0 || matchingIndex === undefined) {
        setCurrentIndex(1);
        onImageHandler("initial", 1, response.data.filteredData, updatedTasks);
      } else {
        setCurrentIndex(matchingIndex);
        onImageHandler(
          "initial",
          matchingIndex,
          response.data.filteredData,
          updatedTasks
        );
      }
      setLoading(false);
      setPopUp(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const onDataTypeSelectHandler = (taskData) => {
    if (taskData.taskStatus) {
      toast.warning("Task is aready completed.");
      return;
    }
    setStartModal(false);
    setCurrentTaskData(taskData);
  };

  const onCompareTaskStartHandler = (taskdata) => {
    localStorage.setItem("taskdata", JSON.stringify(taskdata));
    navigate("/datamatching/correct_compare_csv", { state: taskdata });
  };

  const onCompleteHandler = async () => {
    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/taskupdation/${parseInt(
          currentTaskData?.id
        )}`,
        {
          blankTaskStatus: allDataChecked ? true : blankChecked,
          multTaskStatus: allDataChecked ? true : multChecked,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      setPopUp(true);
      setStartModal(true);
      toast.success("task complted successfully.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const zoomInHandler = () => {
    setZoomLevel((prevZoomLevel) => Math.min(prevZoomLevel * 1.1, 3));
  };

  const zoomOutHandler = () => {
    setZoomLevel((prevZoomLevel) => Math.max(prevZoomLevel * 0.9, 0.5));
  };

  const onInialImageHandler = () => {
    setZoomLevel(1);
    setSelectedCoordinates(false);
    if (imageRef.current) {
      imageRef.current.style.transform = "none";
      imageRef.current.style.transformOrigin = "initial";
    }
  };

  return (
    <>
      {(userRole === "Operator" || userRole === "Moderator") && (
        <div>
          <div>
            {popUp && (
              <>
                {startModal ? (
                  <div className="h-[100vh] flex justify-center bg-gradient-to-r from-blue-700 to-purple-700  items-center templatemapping pt-20">
                    <div className="">
                      {/* MAIN SECTION  */}
                      <section className="mx-auto max-w-4xl  px-12 py-10 bg-white rounded-xl w-[100vw]">
                        <div className="flex flex-col space-y-4  md:flex-row md:items-center md:justify-between md:space-y-0">
                          <div>
                            <h2 className="text-3xl font-semibold">
                              Assigned Tasks
                            </h2>
                          </div>
                        </div>
                        <div className="mt-6 flex flex-col">
                          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block  py-2 align-middle md:px-6 ">
                              <div className=" border border-gray-200 md:rounded-lg">
                                <div className="divide-y divide-gray-200 ">
                                  <div className="bg-gray-50 w-full">
                                    <div className="flex">
                                      <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[150px]">
                                        <span>Templates</span>
                                      </div>

                                      <div className=" py-3.5 px-4 text-center  text-xl font-semibold text-gray-700 w-[100px]">
                                        Min
                                      </div>

                                      <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[100px]">
                                        Max
                                      </div>
                                      <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[150px]">
                                        Module
                                      </div>
                                      <div className=" py-3.5 px-4 text-center text-xl font-semibold text-gray-700 w-[150px]">
                                        Status
                                      </div>
                                      <div className=" px-4 py-3.5 text-center text-xl font-semibold text-gray-700 w-[150px]">
                                        Start Task
                                      </div>
                                    </div>
                                  </div>
                                  <div className="divide-y divide-gray-200 bg-white overflow-y-auto max-h-[300px]">
                                    {allTasks?.map((taskData, index) => (
                                      <>
                                        <div
                                          key={taskData.id}
                                          className="flex  py-2 w-full"
                                        >
                                          <div className="whitespace-nowrap w-[150px] px-4">
                                            <div className="text-md text-center">
                                              {taskData.templateName}
                                            </div>
                                          </div>
                                          <div className="whitespace-nowrap w-[100px] px-4">
                                            <div className="text-md text-center">
                                              {taskData.min}
                                            </div>
                                          </div>
                                          <div className="whitespace-nowrap w-[100px] px-4">
                                            <div className="text-md text-center">
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
                                                  !taskData.blankTaskStatus ||
                                                  !taskData.multTaskStatus
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                                } px-2.5 py-0.5 `}
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
                                          <div className="whitespace-nowrap text-center w-[150px] px-4">
                                            <button
                                              onClick={() =>
                                                onDataTypeSelectHandler(
                                                  taskData
                                                )
                                              }
                                              className="rounded-3xl border border-indigo-500 bg-indigo-500 px-6 py-1 font-semibold text-white"
                                            >
                                              Start
                                            </button>
                                          </div>
                                        </div>
                                      </>
                                    ))}
                                    {compareTask?.map((taskData, index) => (
                                      <div
                                        key={taskData.id}
                                        className="grid grid-cols-7 gap-x-6 py-2"
                                      >
                                        <div className="whitespace-nowrap w-1/6">
                                          <div className="text-md text-center">
                                            {taskData.templateName}
                                          </div>
                                        </div>
                                        <div className="whitespace-nowrap  w-1/6">
                                          <div className="text-md text-center">
                                            {taskData.min}
                                          </div>
                                        </div>
                                        <div className="whitespace-nowrap w-1/6">
                                          <div className="text-md text-center">
                                            {taskData.max}
                                          </div>
                                        </div>

                                        <div className="whitespace-nowrap w-1/6">
                                          <div className="text-md text-center font-semibold py-1 border-2">
                                            {taskData.moduleType}
                                          </div>
                                        </div>

                                        <div className="whitespace-nowrap w-1/6">
                                          <div className="text-md text-center">
                                            <span
                                              className={`inline-flex items-center justify-center rounded-full ${
                                                !taskData.taskStatus
                                                  ? "bg-amber-100 text-amber-700"
                                                  : "bg-emerald-100 text-emerald-700"
                                              } px-2.5 py-0.5 `}
                                            >
                                              {!taskData.taskStatus ? (
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
                                                {taskData.taskStatus
                                                  ? "Completed"
                                                  : "Pending"}
                                              </p>
                                            </span>
                                          </div>
                                        </div>
                                        <div className="whitespace-nowrap text-center w-1/6">
                                          <button
                                            onClick={() =>
                                              onCompareTaskStartHandler(
                                                taskData
                                              )
                                            }
                                            className="rounded border border-indigo-500 bg-indigo-500 px-10 py-1 font-semibold text-white"
                                          >
                                            Start
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
                ) : (
                  <>
                    <div className="fixed z-10 inset-0 overflow-y-auto ">
                      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
                        <div className=" inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h1 className="text-xl font-bold text-gray-500 mb-6">
                                  Please select the options
                                </h1>
                                <div className="text-gray-600 font-semibold my-2 overflow-y-auto h-[200px]">
                                  <fieldset>
                                    <legend className="sr-only">Options</legend>
                                    <div className="divide-y divide-gray-200">
                                      <label
                                        htmlFor="blank"
                                        className="flex cursor-pointer items-start gap-4 py-4"
                                      >
                                        <div className="flex items-center">
                                          &#8203;
                                          <input
                                            type="checkbox"
                                            className="size-4 rounded border-gray-300"
                                            id="blank"
                                            checked={blankChecked}
                                            onChange={() =>
                                              handleCheckboxChange("blank")
                                            }
                                          />
                                        </div>
                                        <div className="flex justify-between w-[100%]">
                                          <strong className="font-medium text-gray-900">
                                            Blank
                                          </strong>

                                          {blankChecked && (
                                            <label
                                              for="countNumber"
                                              class="relative block overflow-hidden rounded-md border border-gray-200 px-2 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
                                            >
                                              <input
                                                type="number"
                                                required
                                                value={blankCount}
                                                onChange={(e) =>
                                                  setBlackCount(e.target.value)
                                                }
                                                id="countNumber"
                                                class="peer h-6 w-full border-none bg-transparent  placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                                              />
                                            </label>
                                          )}
                                        </div>
                                      </label>

                                      <label
                                        htmlFor="mult"
                                        className="flex cursor-pointer items-start gap-4 py-4"
                                      >
                                        <div className="flex items-center">
                                          &#8203;
                                          <input
                                            type="checkbox"
                                            className="size-4 rounded border-gray-300"
                                            id="mult"
                                            checked={multChecked}
                                            onChange={() =>
                                              handleCheckboxChange("mult")
                                            }
                                          />
                                        </div>
                                        <div>
                                          <strong className="font-medium text-gray-900">
                                            Mult (*)
                                          </strong>
                                        </div>
                                      </label>

                                      {!blankChecked && !multChecked && (
                                        <label
                                          htmlFor="allData"
                                          className="flex cursor-pointer items-start gap-4 py-4"
                                        >
                                          <div className="flex items-center">
                                            &#8203;
                                            <input
                                              type="checkbox"
                                              className="size-4 rounded border-gray-300"
                                              id="allData"
                                              checked={allDataChecked}
                                              onChange={() =>
                                                handleCheckboxChange("allData")
                                              }
                                            />
                                          </div>
                                          <div>
                                            <strong className="font-medium text-gray-900">
                                              All Data
                                            </strong>
                                          </div>
                                        </label>
                                      )}
                                    </div>
                                  </fieldset>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                              onClick={() =>
                                onTaskStartHandler(currentTaskData)
                              }
                              type="button"
                              disabled={loading ? true : false}
                              className={`my-3 ml-3 w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent px-4 py-2 bg-teal-600 text-base leading-6 font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:border-teal-700 focus:shadow-outline-teal transition ease-in-out duration-150 sm:text-sm sm:leading-5 ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              {loading ? (
                                <div className="flex items-center justify-center">
                                  <span className="mr-2">Loading...</span>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                </div>
                              ) : (
                                "Confirm"
                              )}
                            </button>

                            <button
                              onClick={() => setStartModal(true)}
                              type="button"
                              className=" my-3 w-full sm:w-auto inline-flex justify-center rounded-xl
               border border-transparent px-4 py-2 bg-gray-300 text-base leading-6 font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus:outline-none focus:border-gray-600 focus:shadow-outline-gray transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {!popUp && (
              <div className=" flex flex-col lg:flex-row  bg-gradient-to-r from-blue-600 to-purple-700 dataEntry pt-20">
                {/* LEFT SECTION */}
                <div className=" border-e lg:w-3/12 xl:w-[20%] order-lg-1 ">
                  <div className="overflow-hidden w-[100%] ">
                    <article
                      style={{ scrollbarWidth: "thin" }}
                      className="py-10 mt-5 lg:mt-16 shadow transition  hover:shadow-lg mx-auto overflow-y-auto lg:h-[80vh] rounded-lg flex flex-row lg:flex-col lg:items-center w-[95%] bg-blue-500"
                    >
                      {csvCurrentData &&
                        Object.entries({ ...csvData[0] }).map(
                          ([key, value], i) => {
                            const templateData =
                              templateHeaders?.templetedata.find(
                                (data) =>
                                  data.attribute === value &&
                                  data.fieldType === "formField"
                              );
                            if (key !== imageColName && templateData) {
                              return (
                                <div
                                  key={i}
                                  className="w-5/6 px-3 lg:px-0 py-1  overflow-x font-bold justify-center items-center"
                                >
                                  <label className=" w-full overflow-hidden  rounded-md  font-semibold  py-2 shadow-sm  ">
                                    <span className="text-sm text-white font-bold flex">
                                      {key?.toUpperCase()}
                                    </span>
                                  </label>
                                  <input
                                    type="text"
                                    className={`mt-1 border-none p-2 focus:border-transparent text-center rounded-lg focus:outline-none focus:ring-0 sm:text-sm w-48
                                      ${
                                        csvCurrentData[key] === "" ||
                                        (csvCurrentData[key] &&
                                          typeof csvCurrentData[key] ===
                                            "string" &&
                                          (csvCurrentData[key].includes("*") ||
                                            csvCurrentData[key].includes(" ")))
                                          ? "bg-red-500 text-white"
                                          : "bg-white"
                                      }

                                      ${
                                        i === currentFocusIndex
                                          ? "bg-yellow-300"
                                          : ""
                                      }
                                      `}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    value={csvCurrentData[key] || ""}
                                    onKeyDown={(e) => handleKeyDownJump(e, i)}
                                    onChange={(e) =>
                                      changeCurrentCsvDataHandler(
                                        key,
                                        e.target.value
                                      )
                                    }
                                    onFocus={() => imageFocusHandler(key)}
                                  />
                                </div>
                              );
                            }
                          }
                        )}
                    </article>
                  </div>

                  {/* View image */}
                </div>
                {/* RIGHT SECTION */}
                <div className="w-full lg:w-[80%] xl:w-10/12 matchingMain">
                  {imageUrls.length === 0 ? (
                    <div className="flex justify-center items-center ">
                      <div className="mt-10">
                        <ImageNotFound />

                        <h1 className="mt-8 text-2xl font-bold tracking-tight text-gray-700 sm:text-4xl">
                          Please Select Image...
                        </h1>

                        <p className="mt-4 text-gray-600 text-center">
                          We can't find that page!!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-col">
                      <div className="flex float-right gap-4 mt-2 mr-4 ">
                        <div className="">
                          {/* <button
                          onClick={() => setPopUp(true)}
                          className=" px-6 py-2 bg-blue-600 text-white rounded-3xl mx-2 hover:bg-blue-700"
                        >
                          Back
                        </button> */}
                          {/* <Button
                          onClick={onCsvUpdateHandler}
                          variant="contained"
                          color="info"
                        >
                          update
                        </Button> */}

                          {/* <button
                          className="px-6 py-2 bg-blue-600 text-white rounded-3xl mx-2 hover:bg-blue-700"
                          onClick={() =>
                            onImageHandler(
                              "prev",
                              currentIndex,
                              csvData,
                              currentTaskData
                            )
                          }
                          endIcon={<ArrowBackIosIcon />}
                        >
                          Prev
                        </button> */}

                          {/* <button
                          className="px-6 py-2 bg-blue-600 text-white rounded-3xl mx-2 hover:bg-blue-700"
                          onClick={() =>
                            onImageHandler(
                              "next",
                              currentIndex,
                              csvData,
                              currentTaskData
                            )
                          }
                          endIcon={<ArrowForwardIosIcon />}
                        >
                          Next
                        </button> */}
                          {currentIndex === csvData.length - 1 && (
                            <button
                              onClick={onCompleteHandler}
                              className="px-4 py-2 bg-teal-600 mx-2 text-white rounded-3xl hover:bg-teal-700"
                            >
                              Task Completed
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <h3 className="ms-5 text-lg font-semibold py-3 text-white">
                          Data No : {currentIndex} out of {csvData.length - 1}
                        </h3>
                        <div className="flex justify-center my-3">
                          <button
                            onClick={zoomInHandler}
                            className="px-6 py-2 bg-blue-400 text-white rounded-3xl mx-2 hover:bg-blue-500"
                          >
                            Zoom In
                          </button>

                          <button
                            onClick={onInialImageHandler}
                            className="px-6 py-2 bg-blue-400 text-white rounded-3xl mx-2 hover:bg-blue-500"
                          >
                            Initial
                          </button>
                          <button
                            onClick={zoomOutHandler}
                            className="px-6 py-2 bg-blue-400 text-white rounded-3xl mx-2 hover:bg-blue-500"
                          >
                            Zoom Out
                          </button>
                        </div>
                        <h3 className=" text-lg font-semibold py-3 text-white">
                          {" "}
                          Image : {currentImageIndex + 1} Out of{" "}
                          {imageUrls.length}
                        </h3>
                      </div>

                      <div
                        ref={imageContainerRef}
                        className="mx-auto bg-white"
                        style={{
                          position: "relative",
                          border: "2px solid gray",
                          width: "48rem",
                          height: "23rem",
                          overflow: "auto",
                          scrollbarWidth: "thin",
                        }}
                      >
                        <img
                          src={`data:image/jpeg;base64,${imageUrls[currentImageIndex]?.base64Image}`}
                          alt="Selected"
                          ref={imageRef}
                          style={{
                            width: "48rem",
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "center center",
                          }}
                          draggable={false}
                        />

                        {!selectedCoordintes &&
                          templateHeaders?.templetedata?.map(
                            (data, index) =>
                              data.pageNo === currentImageIndex && (
                                <div
                                  key={index}
                                  style={{
                                    border: "3px solid #007bff",
                                    position: "absolute",
                                    backgroundColor: "rgba(0, 123, 255, 0.2)",
                                    left: `${data.coordinateX}px`,
                                    top: `${data.coordinateY}px`,
                                    width: `${data.width}px`,
                                    height: `${data.height}px`,
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: "center center",
                                  }}
                                ></div>
                              )
                          )}
                      </div>
                      <div className="w-full xl:w-2/3 xl:px-6 mx-auto text-white">
                        <div className="my-4 w-full ">
                          <label
                            className="text-xl font-semibold ms-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            htmlFor="questions"
                          >
                            Questions:
                          </label>
                          <div
                            className="flex overflow-auto max-h-[360px] mt-3 ms-2 xl:ms-2"
                            style={{ scrollbarWidth: "thin" }}
                          >
                            <div className="flex flex-wrap">
                              {csvCurrentData &&
                                Object.entries(csvCurrentData).map(
                                  ([key, value], i) => {
                                    const csvHeader = csvData[0][key];
                                    const templateData =
                                      templateHeaders?.templetedata.find(
                                        (data) => data.attribute === csvHeader
                                      );
                                    if (
                                      templateData &&
                                      templateData.fieldType ===
                                        "questionsField" &&
                                      key !== imageColName
                                    ) {
                                      return (
                                        <div
                                          key={i}
                                          className=" me-3 my-1 flex"
                                        >
                                          <label
                                            htmlFor={`Quantity${i}`}
                                            className="font-bold text-sm w-9 text-bold my-1"
                                          >
                                            {key}
                                          </label>
                                          <div className="flex rounded">
                                            <input
                                              type="text"
                                              id={`Quantity${i}`}
                                              className={`h-7 w-7 text-center text-black rounded text-sm ${
                                                csvCurrentData[key] === "" ||
                                                (csvCurrentData[key] &&
                                                  typeof csvCurrentData[key] ===
                                                    "string" &&
                                                  (csvCurrentData[key].includes(
                                                    "*"
                                                  ) ||
                                                    csvCurrentData[
                                                      key
                                                    ].includes(" ")))
                                                  ? "bg-red-500 text-white"
                                                  : "bg-white"
                                              }
                                                  ${
                                                    i === currentFocusIndex
                                                      ? "bg-yellow-300 text-white"
                                                      : ""
                                                  }
                                              `}
                                              ref={(el) =>
                                                (inputRefs.current[i] = el)
                                              }
                                              value={csvCurrentData[key] || ""}
                                              onKeyDown={(e) =>
                                                handleKeyDownJump(e, i)
                                              }
                                              placeholder={value}
                                              onChange={(e) =>
                                                changeCurrentCsvDataHandler(
                                                  key,
                                                  e.target.value
                                                )
                                              }
                                              onFocus={() =>
                                                imageFocusHandler(key)
                                              }
                                            />
                                          </div>
                                        </div>
                                      );
                                    }
                                  }
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {userRole === "Admin" && <AdminAssined />}
    </>
  );
};

export default DataMatching;
