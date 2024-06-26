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
import DataOption from "./DataOption";
import UserTaskAssined from "./UserTaskAssined";
import FormDataSection from "./FormDataSection";
import QuestionsDataSection from "./QuestionsDataSection";
import ImageSection from "./ImageSection";
import ButtonSection from "./ButtonSection";

const DataMatching = () => {
  const [popUp, setPopUp] = useState(true);
  const [startModal, setStartModal] = useState(true);
  const [imageUrls, setImageUrls] = useState([]);
  const [templateHeaders, setTemplateHeaders] = useState(null);
  const [csvCurrentData, setCsvCurrentData] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [imageColName, setImageColName] = useState("");
  const [imageColNames, setImageColNames] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [blankCount, setBlackCount] = useState(1);
  const [pattern, setPattern] = useState("");
  const [currentTaskData, setCurrentTaskData] = useState({});
  const [selectedCoordintes, setSelectedCoordinates] = useState(false);
  const [blankChecked, setBlankChecked] = useState(false);
  const [modifiedKeys, setModifiedKeys] = useState({});
  const [multChecked, setMultChecked] = useState(false);
  const [allDataChecked, setAllDataChecked] = useState(false);
  const [imageNotFound, setImageNotFound] = useState(true);
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
      toast.success(`Data updated successfully .`);
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
            // onImageHandler("prev", currentIndex, csvData, currentTaskData);
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
            // onImageHandler("next", currentIndex, csvData, currentTaskData);
            setCurrentImageIndex(0);
          }
        } else if (event.shiftKey && event.key === "+") {
          zoomInHandler();
          setSelectedCoordinates(true);
        } else if (event.shiftKey && event.key === "-") {
          zoomOutHandler();
          setSelectedCoordinates(true);
        } else if (event.shiftKey && (event.key === "I" || event.key === "i")) {
          onInialImageHandler();
        } else if (event.shiftKey && (event.key === "p" || event.key === "P")) {
          onImageHandler("prev", currentIndex, csvData, currentTaskData);
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
    let i = 1;
    while (true) {
      const keys = getKeysByPattern(headers, `Image${i}`);
      if (keys.length === 0) break;
      imageNames.push(...keys);
      i++;
    }
    setImageColNames(imageNames);
    console.log(imageNames);
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
        },
        {
          headers: {
            token: token,
          },
        }
      );

      console.log(response);
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
      setLoading(false);
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

      if (matchedCoordinate?.fieldType === "questionsField") {
        const validCharacters = templateHeaders?.typeOption?.split("-");
        newValue = newValue.trim();
        if (newValue.length !== 1 && newValue !== "") {
          return prevData;
        }

        // Check if newValue is in the list of valid characters or is an empty string
        if (validCharacters.includes(newValue) || newValue === "") {
          setModifiedKeys((prevKeys) => ({
            ...prevKeys,
            [key]: [newValue, previousValue],
          }));

          return {
            ...prevData,
            [key]: newValue,
          };
        } else {
          return prevData;
        }
      } else {
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

  const onTaskStartHandler = async (taskData) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/get/csvdata`,
        { taskData: taskData },
        {
          headers: {
            token: token,
          },
        }
      );

      setCsvData(response.data);
      let matching;
      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i]["rowIndex"] == taskData.currentIndex) {
          matching = i;
          break;
        }
      }

      onImageHandler("initial", matching, response.data, taskData);
      setPopUp(false);
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.error);
    }
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
                  <UserTaskAssined
                    onCompareTaskStartHandler={onCompareTaskStartHandler}
                    allTasks={allTasks}
                    compareTask={compareTask}
                    onTaskStartHandler={onTaskStartHandler}
                    setCurrentTaskData={setCurrentTaskData}
                  />
                ) : (
                  <>
                    <DataOption
                      blankChecked={blankChecked}
                      handleCheckboxChange={handleCheckboxChange}
                      blankCount={blankCount}
                      pattern={pattern}
                      setBlackCount={setBlackCount}
                      setPattern={setPattern}
                      multChecked={multChecked}
                      allDataChecked={allDataChecked}
                      onTaskStartHandler={onTaskStartHandler}
                      currentTaskData={currentTaskData}
                      loading={loading}
                      setStartModal={setStartModal}
                    />
                  </>
                )}
              </>
            )}
            {!popUp && (
              <div className=" flex flex-col lg:flex-row  bg-gradient-to-r from-blue-600 to-purple-700 dataEntry pt-20">
                {/* LEFT SECTION */}
                <FormDataSection
                  csvCurrentData={csvCurrentData}
                  csvData={csvData}
                  templateHeaders={templateHeaders}
                  imageColName={imageColName}
                  currentFocusIndex={currentFocusIndex}
                  inputRefs={inputRefs}
                  handleKeyDownJump={handleKeyDownJump}
                  changeCurrentCsvDataHandler={changeCurrentCsvDataHandler}
                  imageFocusHandler={imageFocusHandler}
                />

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
                      <ButtonSection
                        currentIndex={currentIndex}
                        csvData={csvData}
                        zoomInHandler={zoomInHandler}
                        onInialImageHandler={onInialImageHandler}
                        zoomOutHandler={zoomOutHandler}
                        currentImageIndex={currentImageIndex}
                        imageUrls={imageUrls}
                      />

                      <ImageSection
                        imageContainerRef={imageContainerRef}
                        currentImageIndex={currentImageIndex}
                        imageUrls={imageUrls}
                        imageRef={imageRef}
                        zoomLevel={zoomLevel}
                        selectedCoordintes={selectedCoordintes}
                        templateHeaders={templateHeaders}
                      />
                      <QuestionsDataSection
                        csvCurrentData={csvCurrentData}
                        csvData={csvData}
                        templateHeaders={templateHeaders}
                        imageColName={imageColName}
                        currentFocusIndex={currentFocusIndex}
                        inputRefs={inputRefs}
                        handleKeyDownJump={handleKeyDownJump}
                        changeCurrentCsvDataHandler={
                          changeCurrentCsvDataHandler
                        }
                        imageFocusHandler={imageFocusHandler}
                      />
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
