import React, {
  useState,
  useRef,
  useEffect,
  Fragment,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { MdDelete } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { RxCross1 } from "react-icons/rx";
import { CiEdit } from "react-icons/ci";
import dataContext from "../../Store/DataContext";
import { REACT_APP_IP } from "../../services/common";

const ImageScanner = () => {
  const [selection, setSelection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [image, setImage] = useState(null);
  const [inputField, setInputField] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [removeModal, setRemoveModal] = useState(false);
  const [editId, setEditID] = useState("");
  const [removeId, setRemoveId] = useState("");
  const [editInput, setEditInput] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [typeOfOption, setTypeOfOption] = useState({
    start: "",
    end: "",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cancelButtonRef = useRef(null);
  const dataCtx = useContext(dataContext);
  const [templateData, setTemplateData] = useState({
    name: "",
    pageCount: "",
  });
  const [questionRange, setQuestionRange] = useState({
    min: "",
    max: "",
  });
  const token = JSON.parse(localStorage.getItem("userData"));
  const imageRef = useRef(null);
  const navigate = useNavigate();
  const imageURL = JSON.parse(localStorage.getItem("images"));
  const templateOption =
    JSON.parse(localStorage.getItem("templateOption")) || "creating";

  useEffect(() => {
    if (templateOption === "updating") {
      if (Object.keys(dataCtx.templateData).length === 0) {
        navigate("/csvuploader");
      } else {
        if (dataCtx.templateData) {
          const selectedCoordinatesData = dataCtx?.templateData?.metaData.map(
            (data, index) => {
              const newObj = {
                coordinateX: +data.coordinateX,
                coordinateY: +data.coordinateY,
                width: +data.width,
                height: +data.height,
                pageNo: data.pageNo,
                fieldType: data.fieldType,
                fId: index,
                attribute: data.attribute,
              };
              return newObj;
            }
          );
          setTemplateData((prevState) => ({
            ...prevState,
            name: dataCtx?.templateData?.templateData?.name,
            pageCount: dataCtx?.templateData?.templateData?.pageCount,
          }));
          const [a, b] =
            dataCtx?.templateData?.templateData?.typeOption?.split("-");
          setTypeOfOption((prevState) => ({
            ...prevState,
            start: a,
            end: b,
          }));

          setSelectedCoordinates(selectedCoordinatesData);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (imageURL && imageURL.length > 0) {
      setImage(imageURL[currentImageIndex]);
    }
  }, [currentImageIndex]);

  useEffect(() => {
    const handlekeyDown = (e) => {
      if (e.key === "ArrowRight") {
        onNextImageHandler();
      } else if (e.key === "ArrowLeft") {
        onPreviousImageHandler();
      }
    };
    window.addEventListener("keydown", handlekeyDown);
    return () => {
      window.removeEventListener("keydown", handlekeyDown);
    };
  }, []);

  const onNextImageHandler = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < imageURL.length - 1 ? prevIndex + 1 : prevIndex
    );
    setSelection(null);
  };

  const onPreviousImageHandler = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  // Function to handle mouse down event for drag selection
  const handleMouseDown = (e) => {
    const boundingRect = imageRef.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;
    setDragStart({ x: offsetX, y: offsetY });
  };
  // Function to handle mouse up event for drag selection
  const handleMouseUp = () => {
    if (dragStart) {
      setDragStart(null);
      setOpen(true);
      // Remove event listener for mousemove when dragging ends
    }
  };
  // Function to handle mouse move event for drag selection
  const handleMouseMove = (e) => {
    if (!e.buttons || !dragStart) {
      return;
    }
    const boundingRect = imageRef?.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;

    const container = imageRef.current.parentElement;
    if (offsetY > container.clientHeight - 100) {
      container.scrollTop += 100;
    }

    setSelection({
      coordinateX: Math.min(dragStart.x, offsetX),
      coordinateY: Math.min(dragStart.y, offsetY),
      width: Math.abs(offsetX - dragStart.x),
      height: Math.abs(offsetY - dragStart.y),
      pageNo: currentImageIndex,
    });
  };

  const onResetHandler = () => {
    setDragStart(null);
    setSelection(null);
    setOpen(false);
  };

  // Function to submit drag selection and name of options like -> Roll Number , or Subject
  const onSelectedHandler = () => {
    if (!fieldType) {
      toast.error("Please select a field type.");
      return;
    }

    if (fieldType === "questionsField") {
      if (!questionRange || !questionRange.min || !questionRange.max) {
        toast.warning("Please ensure all fields are properly filled out.");
        return;
      }

      if (Number(questionRange.min) > Number(questionRange.max)) {
        toast.warning(
          "Please ensure the minimum value is always less than the maximum value."
        );
        return;
      }
    } else {
      if (fieldType === "formField" && inputField.includes("-")) {
        toast.error("Please refrain from using hyphens (-) in this field.");
        return;
      }

      if (!inputField) {
        toast.error("Please ensure to add the coordinate name.");
        return;
      }
    }
    const newObj = {
      ...selection,
      fieldType,
      fId: Math.random().toString(),
      attribute:
        fieldType === "formField"
          ? inputField
          : questionRange.min + "--" + questionRange.max,
    };
    setSelectedCoordinates((prev) => [...prev, newObj]);
    setInputField("");
    setFieldType("");
    setOpen(false);
    setQuestionRange({
      min: "",
      max: "",
    });
    toast.success("Coordinate successfully added.");
  };

  const onRemoveSelectedHandler = () => {
    const newArray = selectedCoordinates.filter(
      (data) => data.fId !== removeId
    );
    setSelectedCoordinates(newArray);
    toast.success("Successfully deleted coordinate.");
    setRemoveId("");
    setRemoveModal(false);
    setSelection(null);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (selectedCoordinates.length === 0) {
      toast.error("Please select the coordinates");
      return;
    }

    if (typeOfOption.start === typeOfOption.end) {
      toast.warning("start and end cannot be the same.");
      return;
    }

    const data = {
      templateData: {
        name: templateData.name,
        pageCount: imageURL.length,
        typeOption: typeOfOption.start + "-" + typeOfOption.end,
      },
      templateId: dataCtx?.templateData?.templateData?.id
        ? dataCtx?.templateData?.templateData?.id
        : undefined,
      metaData: [...selectedCoordinates],
    };

    const formData = new FormData();

    // Convert data object to JSON string and append it
    formData.append("data", JSON.stringify(data));

    // Append the binary data of each image directly to FormData under the key "images"
    imageURL.forEach((imageData, index) => {
      const contentType = imageData.split(";")[0].split(":")[1];
      const blob = base64ToBlob(imageData.split(",")[1], contentType);
      const file = new File([blob], `image_${index}.${contentType}`, {
        type: contentType,
      });
      formData.append("images", file);
    });

    // Append the array of image files under the key "images"
    try {
      await axios.post(`http://${REACT_APP_IP}:4000/add/templete`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      });
      toast.success("Template created successfully!");
      dataCtx.modifyTemplateData(null);
      localStorage.removeItem("images");
      navigate("/imageuploader");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  function base64ToBlob(base64String, contentType) {
    const byteCharacters = atob(base64String);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }
  const onEditCoordinateHanlder = () => {
    if (!editInput) {
      toast.warning("Please enter the new name.");
      return;
    }

    const updatedData = selectedCoordinates.map((coordinate) => {
      if (editId === coordinate.fId) {
        return { ...coordinate, attribute: editInput };
      }

      return coordinate;
    });
    setSelectedCoordinates(updatedData);
    setEditID("");
    setEditInput("");
    setEditModal(false);
    toast.success("Successfully updated coordinate name.");
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row justify-center items-center scannerbg bg-gradient-to-r from-blue-700 to-purple-800 border-1 pt-20 ">
      {/* LEFT SECTION  */}
      <div className="flex w-[40%] lg:w-[25%] ">
        <div className="flex flex-1  flex-col justify-between ">
          <div className="px-4 py-6">
            <div className="space-y-20">
              <div
                style={{ marginTop: "40px" }}
                className="block w-full rounded-3xl bg-gray-100 px-6 py-2 text-sm font-medium  mb-5"
              >
                <div className="overflow-x-auto">
                  <div className="my-3 table-auto   border-collapse border border-gray-400 min-w-full divide-y-2 divide-gray-200 bg-white text-sm rounded-3xl">
                    <div className="ltr:text-left rtl:text-right flex justify-around text-gray-600">
                      <div className="text-center text-lg whitespace-nowrap py-4 w-1/3">
                        Name
                      </div>
                      <div className="text-center text-lg whitespace-nowrap py-4 w-1/3">
                        Edit
                      </div>
                      <div className="text-center text-lg whitespace-nowrap py-4 w-1/3">
                        Remove
                      </div>
                    </div>

                    <div className="divide-y divide-gray-200 overflow-y-auto min-h-[25vh] h-[30vh]">
                      {selectedCoordinates &&
                        selectedCoordinates?.map((data) => (
                          <div
                            key={data.fId}
                            className="odd:bg-gray-50 h-[40px] flex justify-around"
                          >
                            <div className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900 text-ellipsis overflow-x-hidden w-1/3">
                              {data.attribute}
                            </div>
                            <div className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900 w-1/3">
                              <CiEdit
                                onClick={() => {
                                  setEditID(data.fId);
                                  setEditModal(true);
                                }}
                                className="mx-auto text-blue-500 text-xl cursor-pointer hover:text-2xl hover:font-bold"
                              />
                            </div>
                            <div className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900 w-1/3">
                              <MdDelete
                                onClick={() => {
                                  setRemoveModal(true);
                                  setRemoveId(data.fId);
                                }}
                                className="mx-auto text-red-500 text-xl hover:text-2xl hover:font-bold cursor-pointer"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {/* Form Field Area */}
                <div className="bg-gray-100 rounded-3xl px-8 py-6 border-1 border-gray shadow-md mb-10">
                  <form onSubmit={onSubmitHandler}>
                    <div className="flex items-center justify-between gap-4 bg-green-100 px-4 py-3 mt-2 text-green-700 rounded-lg shadow-md">
                      <div className="flex items-center gap-2">
                        <FaInfoCircle className="h-6 w-6 text-green-700" />
                        <p className="text-sm font-medium">
                          Start with 'a', 'A', or '1'. End with 'd', 'D', or
                          '4'.
                        </p>
                      </div>
                    </div>
                    <div className="flex  mt-4 gap-x-8">
                      <div className="flex items-center  gap-2">
                        <span className="font-bold">Start</span>
                        <input
                          type="text"
                          id="Quantity"
                          required
                          value={typeOfOption.start}
                          onChange={(e) => {
                            if (e.target.value.length <= 1) {
                              setTypeOfOption({
                                ...typeOfOption,
                                start: e.target.value,
                              });
                            }
                          }}
                          className="h-8 w-10 rounded-lg border-2 border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">End</span>
                        <input
                          type="text"
                          id="Quantity"
                          required
                          value={typeOfOption.end}
                          onChange={(e) => {
                            if (e.target.value.length <= 1) {
                              setTypeOfOption({
                                ...typeOfOption,
                                end: e.target.value,
                              });
                            }
                          }}
                          className="h-8 w-10 rounded-lg border-2 border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    <input
                      required
                      className="input w-full font-semibold bg-white  border-none rounded-xl p-3 mt-6 shadow-lg shadow-blue-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      type="text"
                      value={templateData.name}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          name: e.target.value,
                        })
                      }
                      placeholder="enter template name.."
                    />
                    <button className="ms-auto group rounded-3xl  mt-6 flex items-center   bg-indigo-600 hover:shadow-lg hover:shadow-blue-200  py-2 px-4 transition-colors hover:bg-teal-700 focus:outline-none focus:ring">
                      <span className="font-medium  flex text-white transition-colors group-hover:text-white  group-active:text-white mx-auto">
                        Save Template
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* EDIT MODAL  */}
      <div>
        {editModal && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* Modal content */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      {/* Your icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-6 w-6 text-green-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg font-medium text-gray-900"
                        id="modal-title"
                      >
                        Update coordinate name
                      </h3>
                      <div className="mt-2">
                        <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                          <input
                            type="text"
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            id="Username"
                            className="peer border-none py-2 bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
                            placeholder="Username"
                          />
                          <span className="pointer-events-none absolute start-2.5 top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
                            Enter name here.....
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex float-right">
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={onEditCoordinateHanlder}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Save
                    </button>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={() => setEditModal(false)}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL  */}

      <div>
        {removeModal && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* Modal content */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      {/* Your icon */}
                      <svg
                        onClick={() => setRemoveModal(false)}
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
                        className="text-lg font-medium text-gray-900 "
                        id="modal-title"
                      >
                        Remove Template
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to remove this coordinate?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end py-3 px-3">
                  <button
                    type="button cursor-pointer"
                    onClick={onRemoveSelectedHandler}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => setRemoveModal(false)}
                    type="button"
                    className="inline-flex justify-center cursor-pointer w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SECTION  */}
      {!image ? (
        <div className="flex w-[75%] h-[100vh] justify-center items-center">
          <div>
            <ImageNotFound />
            <h1 className="mt-8 text-2xl font-bold tracking-tight text-gray-700 sm:text-4xl">
              Please Select an Image...
            </h1>
            <p className="mt-4 text-gray-600 text-center">
              We can't find that page!
            </p>
          </div>
        </div>
      ) : (
        <div className=" w-[75%]">
          <div className="mx-auto max-w-screen-xl px-2  sm:px-6 lg:px-8">
            <h1 className="text-center my-3  text-xl font-bold text-white">
              {currentImageIndex + 1} out of {imageURL.length}
            </h1>
            <div className="mb-3 flex justify-center">
              <div>
                {image && (
                  <div
                    style={{
                      position: "relative",
                      height: "50rem",
                    }}
                    className="w-full overflow-y-auto"
                  >
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Selected"
                      style={{
                        width: "48rem",
                        cursor: "crosshair",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      draggable={false}
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    />
                    <>
                      {selectedCoordinates
                        .filter((data) => data.pageNo === currentImageIndex)
                        .map((data, index) => (
                          <div
                            key={index}
                            style={{
                              border: "3px solid #007bff",
                              position: "absolute",
                              backgroundColor: "rgba(0, 123, 255, 0.2)",
                              left: data.coordinateX,
                              top: data.coordinateY,
                              width: data.width,
                              height: data.height,
                            }}
                          ></div>
                        ))}
                      {selection && (
                        <div
                          style={{
                            border: "3px solid #007bff",
                            backgroundColor: "rgba(0, 123, 255, 0.2)",
                            position: "absolute",
                            left: selection.coordinateX,
                            top: selection.coordinateY,
                            width: selection.width,
                            height: selection.height,
                          }}
                        ></div>
                      )}
                      <Transition.Root show={open} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-10"
                          initialFocus={cancelButtonRef}
                          onClose={setOpen}
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
                            <div className="fixed inset-0 bg-gray-100 bg-opacity-75 transition-opacity"></div>
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex w-full justify-between items-center">
                                        <div>
                                          <Dialog.Title
                                            as="h1"
                                            className="text-xl font-semibold leading-6 text-gray-900"
                                          >
                                            Add Field Entity..{" "}
                                          </Dialog.Title>
                                        </div>

                                        <div className="mt-2">
                                          <button
                                            type="button"
                                            className="text-red-600 w-[30px] h-[30px] text-xl flex justify-center items-center"
                                            onClick={onResetHandler}
                                          >
                                            <RxCross1 className="font-extrabold" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-5 p-3 mt-3">
                                      <label
                                        htmlFor="formField"
                                        className="flex items-center font-semibold"
                                      >
                                        <input
                                          type="radio"
                                          id="formField"
                                          name="fieldType"
                                          value="formField"
                                          className="form-radio text-blue-500"
                                          required
                                          checked={fieldType === "formField"}
                                          onChange={(e) =>
                                            setFieldType(e.target.value)
                                          }
                                        />
                                        <span className="ml-2 text-lg text-gray-700">
                                          Form Field
                                        </span>
                                      </label>
                                      <label
                                        htmlFor="questionsField"
                                        className="flex items-center font-semibold"
                                      >
                                        <input
                                          type="radio"
                                          id="questionsField"
                                          name="fieldType"
                                          value="questionsField"
                                          className="form-radio text-blue-500"
                                          required
                                          checked={
                                            fieldType === "questionsField"
                                          }
                                          onChange={(e) =>
                                            setFieldType(e.target.value)
                                          }
                                        />
                                        <span className="ml-2 text-lg text-gray-700">
                                          Questions Field
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className="px-4 pb-8 sm:flex sm:px-6 justify-between">
                                    {fieldType === "formField" ||
                                    fieldType === "" ? (
                                      <input
                                        required
                                        className="input w-[72%] border-2 font-semibold bg-white text-lg focus:border-1 rounded-xl px-3 py-2 shadow-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        type="text"
                                        name="field"
                                        placeholder="Field.."
                                        value={inputField}
                                        onChange={(e) =>
                                          setInputField(e.target.value)
                                        }
                                      />
                                    ) : (
                                      <div className="flex gap-5">
                                        <div className="flex items-center gap-4">
                                          <span className="font-bold">
                                            Start
                                          </span>
                                          <input
                                            type="number"
                                            id="Quantity"
                                            value={questionRange.min}
                                            onChange={(e) =>
                                              setQuestionRange({
                                                ...questionRange,
                                                min: e.target.value,
                                              })
                                            }
                                            className="h-10 w-16 rounded border-2 border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                          />
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="font-bold">End</span>
                                          <input
                                            type="number"
                                            id="Quantity"
                                            value={questionRange.max}
                                            onChange={(e) =>
                                              setQuestionRange({
                                                ...questionRange,
                                                max: e.target.value,
                                              })
                                            }
                                            className="h-10 w-16 rounded border-2 border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      data-bs-dismiss="modal"
                                      className="bg-teal-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200 text-md font-medium px-3"
                                      onClick={onSelectedHandler}
                                    >
                                      Save Field
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition.Root>
                    </>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageScanner;
