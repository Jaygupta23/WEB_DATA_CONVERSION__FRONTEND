import React, { useState, useEffect, Fragment, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { REACT_APP_IP } from "../../services/common";
import { Dialog, Transition } from "@headlessui/react";

const ImageScanner = () => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [duplicatesData, setDuplicatesData] = useState([]);
  const [showDuplicates, setShowDuplicates] = useState(true);
  const [showDuplicateField, setShowDuplicateField] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [allCurrentData, setAllCurrentData] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [modifiedKeys, setModifiedKeys] = useState({});
  const token = JSON.parse(localStorage.getItem("userData"));
  let { fileId } = JSON.parse(localStorage.getItem("fileId")) || "";
  let imageNames = JSON.parse(localStorage.getItem("imageName")) || "";
  const { id } = useParams();
  const cancelButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://${REACT_APP_IP}:4000/get/headerdata/${fileId}`,
          {
            headers: {
              token: token,
            },
          }
        );
        setCsvHeaders(response.data.headers);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [fileId, token]);

  const onUpdateCurrentDataHandler = async () => {
    if (!modifiedKeys) {
      toast.success("Row updated successfully.");
      return;
    }

    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/update/duplicatedata`,
        {
          index: currentRowData?.index,
          fileID: fileId,
          rowData: currentRowData.row,
          updatedColumn: modifiedKeys,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      const indexToUpdate = duplicatesData.findIndex((group) =>
        group.sameData.some((item) => item.index === currentRowData.index)
      );
      if (indexToUpdate !== -1) {
        const updatedDuplicateData = duplicatesData.map((group, index) => {
          if (index === indexToUpdate) {
            return {
              sameData: group.sameData.map((item) =>
                item.index === currentRowData.index
                  ? { ...item, row: currentRowData.row }
                  : item
              ),
            };
          }
          return group;
        });

        const updatedAllCurrentData = allCurrentData.map((item) =>
          item.index === currentRowData.index
            ? { ...item, row: currentRowData.row }
            : item
        );

        const filteredUpdatedDuplicateData = updatedDuplicateData
          .map((group) => ({
            sameData: group.sameData.filter(
              (item) => item.row[columnName] !== currentRowData.row[columnName]
            ),
          }))
          .filter((group) => group.sameData.length > 0);

        const filteredAllCurrentData = updatedAllCurrentData.filter(
          (item) => item.row[columnName] !== currentRowData.row[columnName]
        );
        console.log(filteredAllCurrentData);
        if (filteredUpdatedDuplicateData.length !== 0) {
          setDuplicatesData(filteredUpdatedDuplicateData);
        } else {
          setDuplicatesData(updatedDuplicateData);
        }
        if (filteredAllCurrentData.length !== 0) {
          setAllCurrentData(filteredAllCurrentData);
        } else {
          setAllCurrentData(updatedAllCurrentData);
        }
        setModifiedKeys(null);
      }
      toast.success("The row has been updated successfully.");
      setEditModal(false);
    } catch (error) {
      toast.error("Unable to update the row data!");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "PageUp" && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
        setImageUrl(currentRowData.imagePaths[currentImageIndex - 1]);
      } else if (
        event.key === "PageDown" &&
        currentImageIndex < currentRowData?.imagePaths.length - 1
      ) {
        setCurrentImageIndex(currentImageIndex + 1);
        setImageUrl(currentRowData.imagePaths[currentImageIndex + 1]);
      } else if (event.altKey && event.key === "s") {
        // Ensure currentRowData is not null before updating
        if (currentRowData) {
          onUpdateCurrentDataHandler();
        } else {
          console.error("currentRowData is null when trying to update.");
        }
      } else if (event.key === "ArrowLeft") {
        if (editModal) {
          setEditModal(false);
        } else if (!showDuplicates) {
          setShowDuplicates(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentImageIndex, currentRowData, onUpdateCurrentDataHandler]);

  const changeCurrentCsvDataHandler = (key, newValue) => {
    setCurrentRowData((prevData) => {
      const previousValue = prevData.row[key];

      // Set the modified keys with both new and previous values
      setModifiedKeys((prevKeys) => ({
        ...prevKeys,
        [key]: [newValue, previousValue],
      }));

      return {
        ...prevData,
        row: {
          ...prevData.row,
          [key]: newValue,
        },
      };
    });
  };

  const onFindDuplicatesHandler = async (columnName) => {
    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/duplicate/data`,
        {
          colName: columnName,
          fileID: fileId,
          imageColumnName: imageNames,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.data?.message) {
        toast.success(response.data?.message);
        return;
      }

      let groups = response.data.duplicates.reduce((acc, obj) => {
        let key = obj.row[columnName];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});

      let result = Object.values(groups).map((value) => {
        return { sameData: value };
      });

      setDuplicatesData(result);
      // setDuplicatesData(response.data.duplicates);
      const url = response.data?.duplicates[0].imagePaths[currentImageIndex];
      setCurrentRowData(response.data?.duplicates[0]);
      setImageUrl(url);
      setColumnName(columnName);
      setShowDuplicates(false);
      toast.success("Successfully fetched all duplicates data!");
    } catch (error) {
      console.log(error);
      toast.warning(error.response?.data?.message);
    }
  };

  const onRemoveDuplicateHandler = async (index, rowIndex, colName) => {
    const currentData = [...allCurrentData];
    const allDuplicateData = [...duplicatesData];

    const filteredData = currentData.filter((item) => item.index !== rowIndex);

    function removeItemByRowIndex(dataArray, rowIndex) {
      return dataArray
        .map((group) => {
          return {
            sameData: group.sameData.filter((item) => item.index !== rowIndex),
          };
        })
        .filter((group) => group.sameData.length > 0);
    }
    const updatedData = removeItemByRowIndex(allDuplicateData, rowIndex);

    if (currentData.length === 1) {
      toast.warning("Removing the row is not permitted.");
      return;
    }

    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/delete/duplicate`,
        { index: parseInt(rowIndex), fileID: fileId },
        {
          headers: {
            token: token,
          },
        }
      );

      filteredData.forEach((data) => {
        if (data.index > rowIndex) {
          data.index -= 1;
        }
      });
      setAllCurrentData(filteredData);
      setDuplicatesData(updatedData);
      toast.success("Row Deleted successfully!");
    } catch (error) {
      console.log(error);
    }
  };

  const onEditModalHandler = (data, index) => {
    setCurrentRowData(data);
    setEditModal(true);
    setImageUrl(allCurrentData[index].imagePaths[currentImageIndex]);
  };
  const onShowModalHandler = (data) => {
    setAllCurrentData(data.sameData);
    setShowDuplicateField(true);
  };

  const onDuplicateCheckedHandler = () => {
    navigate(`/csvuploader/templatemap/${id}`);
  };

  return (
    <div className="flex duplicateImg  bg-gradient-to-r from-blue-700 to-purple-700 border-1 justify-center items-center   ">
      {showDuplicates ? (
        <div className="flex justify-center items-center w-[100%] pt-20 h-[100vh]">
          <div className=" w-[800px]">
            {/* MAIN SECTION  */}
            <section className="mx-auto w-full max-w-7xl  px-12 py-6 bg-white rounded-xl">
              <div className="flex flex-col space-y-4  md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                  <h2 className="text-3xl font-semibold">Find Duplicates</h2>
                </div>
              </div>
              <div className="mt-6 mb-4 flex flex-col w-full">
                <div className="mx-4 -my-2  sm:-mx-6 lg:-mx-8">
                  <div className="inline-block  py-2 align-middle md:px-6 lg:px-8">
                    <div className=" border border-gray-200 md:rounded-lg ">
                      <div className="divide-y divide-gray-200 ">
                        <div className="bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="px-8 py-3.5 text-left text-xl font-semibold text-gray-700">
                              <span>Headers</span>
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-200 bg-white overflow-y-auto max-h-[300px] w-full">
                          {csvHeaders?.map((columnName, index) =>
                            columnName === "Previous Values" ||
                            columnName === "Updated Values" ||
                            columnName === "User Details" ||
                            columnName === "Updated Col. Name" ||
                            imageNames?.includes(columnName) ? null : (
                              <div
                                key={index}
                                className="flex justify-between items-center"
                              >
                                <div className="whitespace-nowrap px-4 py-4">
                                  <div className="flex items-center">
                                    <div className="ml-4 w-full font-semibold">
                                      <div className="px-2">{columnName}</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="whitespace-nowrap px-4 py-4 text-right">
                                  <button
                                    onClick={() =>
                                      onFindDuplicatesHandler(columnName)
                                    }
                                    className="rounded-3xl border border-indigo-500 bg-indigo-500 px-10 py-1 font-semibold text-white"
                                  >
                                    Check
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={onDuplicateCheckedHandler}
                  class="group inline-block rounded-3xl bg-teal-500 p-[2px] text-white hover:bg-blue-600 focus:outline-none focus:ring active:text-opacity-75"
                >
                  <span class="block  px-8 py-2 text-md font-medium group-hover:bg-transparent">
                    Complete
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full justify-center items-center lg:items-start lg:flex-row pt-20  ">
          {/* LEFT SECTION  */}
          <div className="flex w-full my-2 lg:my-7 lg:w-[30%] xl:w-[25%] ">
            <div className="text-center sm:block sm:p-0 w-full">
              {!editModal ? (
                <div className="inline-block align-bottom pb-6 lg:h-[85vh] bg-teal-100  rounded-xl lg:ms-4 text-left shadow-md overflow-hidden transform transition-all  sm:align-middle w-[90%] ">
                  <div className="px-4 ">
                    <div className="sm:flex ">
                      <div className="text-center sm:mt-0  sm:text-left w-full">
                        <div className="flex justify-between mt-4 ">
                          <h1 className="text-xl text-center font-bold  mb-6  w-1/2">
                            Duplicates :<br />{" "}
                            <span className="text-lg font-medium text-blue-600">
                              {duplicatesData.length}
                            </span>
                          </h1>
                          <h1 className="text-xl text-center font-bold  mb-6 w-1/2">
                            Field :<br />{" "}
                            <span className="text-lg font-medium text-blue-600">
                              {" "}
                              {columnName}
                            </span>
                          </h1>
                        </div>
                        <div className=" font-semibold my-2">
                          <dl className="-my-3  text-sm">
                            <div className="flex justify-around gap-1 py-3 font-bold even:bg-gray-50 sm:grid-cols-4 sm:gap-1 text-center w-full">
                              <dt className=" text-md  w-1/3">{columnName}</dt>
                              <dd className=" text-md w-1/3">Duplicates</dd>
                              <dd className="  text-md w-1/3">View</dd>
                            </div>
                          </dl>
                        </div>
                        <div
                          className=" font-semibold pb-4 overflow-y-auto h-[10vh] lg:h-[40vh] mt-7"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          <dl className="-my-3 divide-y divide-gray-100 text-sm">
                            {duplicatesData?.map((data, index) => (
                              <div
                                key={index}
                                className="flex justify-around gap-1 py-3 text-center even:bg-gray-50 sm:grid-cols-4 "
                              >
                                <dt className="font-medium text-md justify-center whitespace-normal items-center flex w-1/3">
                                  {data?.sameData[0]?.row[columnName]}
                                </dt>
                                <dd className="font-medium items-center text-md w-1/3 flex justify-center ">
                                  {data.sameData.length}
                                </dd>

                                <div className=" w-1/3 ">
                                  <div className="relative">
                                    <div className="inline-flex items-center overflow-hidden rounded-2xl border bg-white">
                                      <button
                                        onClick={() =>
                                          onShowModalHandler(data, index)
                                        }
                                        className="border-e px-3 py-2 bg-blue-500 text-white text-sm/none  hover:bg-gray-50 hover:text-gray-700"
                                      >
                                        View
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {showDuplicateField && (
                      <Transition.Root show={showDuplicateField} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-10"
                          initialFocus={cancelButtonRef}
                          onClose={setShowDuplicateField}
                        >
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <div className="fixed inset-0  bg-opacity-5 backdrop-blur-sm transition-opacity "></div>
                          </Transition.Child>

                          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                              <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                              >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                      <div className="mt-3 text-center  sm:mt-0 sm:text-left w-full">
                                        <Dialog.Title
                                          as="h2"
                                          className="text-xl mb-5 font-semibold leading-6 text-gray-900"
                                        >
                                          Roll
                                        </Dialog.Title>
                                        <div className="mt-2">
                                          <div className="min-w-full divide-y divide-gray-200">
                                            <div className="bg-gray-50 ">
                                              <div className="flex">
                                                <div className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                                  {columnName}
                                                </div>
                                                <div className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                                  Row Index
                                                </div>
                                                <div className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                                  Edit
                                                </div>
                                                <div className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                                  Remove
                                                </div>
                                              </div>
                                            </div>
                                            <div className="overflow-y-auto h-[400px]">
                                              {allCurrentData &&
                                                allCurrentData.map(
                                                  (data, index) => (
                                                    <div
                                                      className=""
                                                      key={index}
                                                    >
                                                      <div
                                                        className={
                                                          index % 2 === 0
                                                            ? "bg-white flex-col"
                                                            : "bg-teal-100 flex-col"
                                                        }
                                                      >
                                                        <div className="flex">
                                                          <div className="text-center py-4 whitespace-nowrap text-xs font-medium text-gray-900 w-1/4">
                                                            {
                                                              data.row[
                                                                columnName
                                                              ]
                                                            }
                                                          </div>
                                                          <div className=" py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/4 text-center">
                                                            {data.index}
                                                          </div>
                                                          <div className="text-center py-4 whitespace-nowrap text-sm text-gray-500 w-1/4">
                                                            <button
                                                              onClick={() =>
                                                                onEditModalHandler(
                                                                  data,
                                                                  index
                                                                )
                                                              }
                                                              className="border-e px-4 bg-gray-100 py-2 text-sm/none text-blue-600 rounded-3xl hover:bg-blue-200"
                                                            >
                                                              Edit
                                                            </button>
                                                          </div>
                                                          <div
                                                            className="text-center py-4 whitespace-nowrap text-red-500 text-2xl  w-1/4"
                                                            onClick={() =>
                                                              onRemoveDuplicateHandler(
                                                                index,
                                                                data.index,
                                                                data.row[
                                                                  columnName
                                                                ]
                                                              )
                                                            }
                                                          >
                                                            <MdDelete className="mx-auto text-2xl hover:text-3xl" />
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition.Root>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-row lg:flex-col justify-center items-center lg:w-[96%] lg:ms-3 lg:mt-5">
                  <div className="mx-6 inline-block align-bottom lg:mt-2  bg-teal-100 rounded-xl  text-left shadow-md transform transition-all  sm:align-middle  w-[90%] lg:w-full">
                    <div className="px-4 py-2 lg:py-3">
                      <div className="sm:flex w-full">
                        <div className="text-center  sm:text-left w-full">
                          <div className=" font-semibold my-2 overflow-x-auto lg:overflow-y-auto lg:h-[70vh]">
                            <div className="divide-y divide-gray-100 text-sm">
                              <div className="flex lg:block">
                                {currentRowData &&
                                  currentRowData.row &&
                                  Object.entries(currentRowData.row).map(
                                    ([key, value], index) => {
                                      if (
                                        key === "Previous Values" ||
                                        key === "Updated Values" ||
                                        key === "User Details" ||
                                        key === "Updated Col. Name" ||
                                        imageNames.includes(key)
                                      ) {
                                        return null;
                                      } else {
                                        return (
                                          <div
                                            key={index}
                                            className="flex flex-col lg:flex-row justify-center"
                                          >
                                            <div className="py-2 px-2 text-center lg:w-1/2">
                                              {key.toUpperCase()}
                                            </div>
                                            <div className="py-2 p-2 px-2 text-center lg:w-1/2">
                                              <input
                                                className="text-center p-2 rounded-3xl lg:w-11/12"
                                                type="text"
                                                placeholder={value}
                                                value={value}
                                                onChange={(e) =>
                                                  changeCurrentCsvDataHandler(
                                                    key,
                                                    e.target.value
                                                  )
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
                    </div>
                    {/* <div className="flex flex-col space-y-4 lg:space-y-0 lg:space-x-12 lg:flex-row lg:pt-2 lg:pb-1  px-4 lg:px-7 w-[25%] lg:w-full">
                    <button
                      onClick={() => setEditModal(false)}
                      class="group inline-block rounded-3xl bg-blue-500 p-[2px] text-white hover:bg-indigo-600 focus:outline-none focus:ring active:text-opacity-75"
                    >
                      <span class="block rounded-sm  text-center lg:px-8 py-2 text-md font-medium group-hover:bg-transparent">
                        Back
                      </span>
                    </button>
                    <button
                      onClick={onUpdateCurrentDataHandler}
                      class="group inline-block rounded-3xl bg-blue-500 p-[2px] text-white hover:bg-indigo-600 focus:outline-none focus:ring active:text-opacity-75"
                    >
                      <span class="block rounded-sm  text-center lg:px-8 py-2 text-md font-medium group-hover:bg-transparent">
                        Save
                      </span>
                    </button>
                  </div> */}
                    <div className="flex  justify-around pb-3 lg:pb-5  px-4 lg:px-7 lg:w-full">
                      <button
                        onClick={() => setEditModal(false)}
                        class="group inline-block rounded-3xl bg-blue-500 p-[2px] text-white hover:bg-indigo-600 focus:outline-none focus:ring active:text-opacity-75"
                      >
                        <span class="block rounded-sm  px-10 py-2 text-md font-medium group-hover:bg-transparent">
                          Back
                        </span>
                      </button>
                      <button
                        onClick={onUpdateCurrentDataHandler}
                        class="group inline-block rounded-3xl bg-blue-500 p-[2px] text-white hover:bg-indigo-600 focus:outline-none focus:ring active:text-opacity-75"
                      >
                        <span class="block rounded-sm  px-10 py-2 text-md font-medium group-hover:bg-transparent">
                          Save
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION  */}
          {!imageUrl ? (
            <div className="flex lg:w-[70%] xl:w-[75%] justify-center items-center ">
              <div className="">
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
            <div className=" w-[75%]">
              <div className="mx-auto max-w-screen-xl px-2 lg:py-1 sm:px-6 lg:px-8">
                <h2 className="text-center text-lg my-3 font-bold text-white w-full ">
                  {currentImageIndex + 1} out of{" "}
                  {currentRowData?.imagePaths.length}
                </h2>

                <div className=" flex justify-center ">
                  <div className="">
                    {imageUrl && (
                      <div
                        style={{
                          position: "relative",
                          
                        }}
                        className="w-full overflow-y-auto pb-4"
                      >
                        <img
                          // src={`data:image/jpeg;base64,${imageUrl}`}
                          src={`http://${REACT_APP_IP}:4000/images/${imageUrl}`}
                          alt="Selected"
                          style={{
                            width: "48rem",
                            height: "49rem",
                          }}
                          draggable={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageScanner;
