import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import UploadFile from "../../assets/images/CsvUploaderImg copy.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import dataContext from "../../Store/DataContext";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import ModalWithLoadingBar from "../../UI/Modal";
import {
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
} from "../../services/common";
import { REACT_APP_IP } from "../../services/common";

const CsvUploader = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFolder, setImageFolder] = useState(null);
  const [selectedId, setSelectedId] = useState();
  const [allTemplates, setAllTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [imageNames, setImageNames] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [removeId, setRemoveId] = useState(null);
  const [removeModal, setRemoveModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dataCtx = useContext(dataContext);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("userData"));

  const data = allTemplates?.find((item) => item.id === selectedId);

  // Tab Button disabled
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // getting all the templates and users
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        const user = await onGetVerifiedUserHandler();
        setCurrentUser(user.user);
        const csvTemplates = response.filter(
          (data) => data.TempleteType === "Data Entry"
        );
        setAllTemplates(csvTemplates);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, []);

  const filteredTemplates = allTemplates?.filter((template) =>
    template.name.toLowerCase().includes(templateName.toLowerCase())
  );

  const onCsvFileHandler = (event) => {
    const fileInput = event.target.files[0];
    handleFileUpload(
      fileInput,
      ["csv", "xlsx"],
      "Please upload a CSV or Excel file.",
      setCsvFile
    );
  };

  const handleImageNameChange = (index, value) => {
    setImageNames((prevNames) => {
      const updatedNames = [...prevNames];
      updatedNames[index] = value;
      return updatedNames;
    });
  };

  const onImageFolderHandler = (event) => {
    const fileInput = event.target.files[0];
    handleFileUpload(
      fileInput,
      ["zip", "folder", "rar"],
      "Please upload a ZIP file or a folder.",
      setImageFolder
    );
  };

  const handleFileUpload = (
    file,
    allowedExtensions,
    errorMessage,
    setFileState
  ) => {
    if (file) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        toast.error(errorMessage);
        return;
      }
      setFileState(file);
    }
  };

  const onSaveFilesHandler = async () => {
    if (!selectedId) {
      toast.error("Please select the template name.");
      return;
    }

    if (currentUser.role !== "Admin") {
      toast.warning("Access denied. Admins only.");
      return;
    }

    if (imageNames.length !== data.pageCount) {
      toast.error("Please fill in all image fields.");
      return;
    }

    if (!csvFile) {
      toast.error("Please upload the CSV file.");
      return;
    }

    if (!imageFolder) {
      toast.error("Please upload the image folder.");
      return;
    }
    setLoading(true);
    dataCtx.modifyIsLoading(true);
    const formData = new FormData();
    formData.append("csvFile", csvFile);
    formData.append("zipFile", imageFolder);

    const imageNamesString = imageNames.join(",");

    if (selectedId) {
      try {
        const response = await axios.post(
          `http://${REACT_APP_IP}:4000/upload/${selectedId}?imageNames=${imageNamesString}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              token: token,
            },
            onUploadProgress: (progressEvent) => {
              // Calculate percentage completed
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              // Update state with percentage completed
              setProgress(percentage);
            },
          }
        );
        const fileId = response.data;
        toast.success("Files uploaded successfully!");
        dataCtx.modifyIsLoading(false);
        navigate(`/csvuploader/duplicatedetector/${selectedId}`);
        localStorage.setItem("fileId", JSON.stringify(fileId));
        localStorage.setItem("pageCount", JSON.stringify(data.pageCount));
        localStorage.setItem("imageName", JSON.stringify(imageNamesString));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error(error.response?.data?.error);
      }
    }
  };

  const onTemplateEditHandler = async (id) => {
    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/edit/template/${id}`,
        {},
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.data.imagePaths.length === 0) {
        toast.warning("No image found.");
        return;
      }

      const data = response.data.template;
      const templateData = {
        templateData: {
          name: data.name,
          pageCount: data.pageCount,
          id: data.id,
          typeOption: data.typeOption,
        },
        metaData: [...data.templetedata],
      };
      dataCtx.modifyTemplateData(templateData);
      localStorage.setItem("templateOption", JSON.stringify("updating"));
      localStorage.setItem("images", JSON.stringify(response.data.imagePaths));
      navigate("/imageuploader/scanner");
    } catch (error) {
      console.error("Error uploading files: ", error);
    }
  };

  const onTemplateRemoveHandler = async (id) => {
    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/delete/template/${id}`,
        {},
        {
          headers: {
            token: token,
          },
        }
      );
      const filteredTemplates = allTemplates.filter((data) => data.id !== id);
      setAllTemplates(filteredTemplates);
      setRemoveModal(false);
      toast.success("Succesfully template removed.");
    } catch (error) {
      console.error("Error uploading files: ", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-auto w-full ">
      <div className="w-full">
        <div className="csvuploader bg-gradient-to-r from-blue-700 to-purple-700 xl:h-[100vh] w-full flex flex-col justify-center items-center">
          <div className="pt-4 xl:pt-0">
            <div className="xl:flex justify-center items-center gap-5  mx-5 pt-20 ">
              <div className="mx-auto max-w-xl mt-5  min-h-[300px] bg-white px-4 py-4  text-center shadow-lg rounded-3xl">
                <h1 className="mb-3 text-xl font-semibold text-center text-blue-500">
                  Template Name
                </h1>
                <div className="form relative pb-3">
                  <button
                    className="absolute"
                    style={{ top: "10px", left: "10px" }}
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      aria-labelledby="search"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      height="16"
                      width="17"
                    >
                      <path
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="1.333"
                        stroke="currentColor"
                        d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                      ></path>
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    required
                    placeholder="Search..."
                    className="input rounded-full ps-8 py-1 border-2 rounded-4 focus:outline-none focus:border-blue-500 placeholder-gray-400"
                  />
                </div>
                <div className="overflow-y-scroll h-[20vh]  bg-white">
                  {filteredTemplates?.map((template) => (
                    <>
                      <p
                        key={template.id}
                        onClick={() => setSelectedId(template.id)}
                        className={`group flex items-center justify-between w-full mt-2 rounded-lg px-4 py-2  text-black ${
                          selectedId === template.id ? "bg-blue-100" : ""
                        }`}
                      >
                        <span
                          className={`{ ${
                            selectedId === template.id
                              ? "text-blue-700  font-semibold text-lg hover:text-xl  rounded-lg w-2/4 text-ellipsis overflow-x-hidden"
                              : "text-black hover:text-teal-700 hover:text-xl text-md font-medium w-2/4 text-ellipsis overflow-x-hidden"
                          }`}
                        >
                          {template.name}
                        </span>
                        <CiEdit
                          onClick={() => {
                            setEditModal(true);
                            setEditId(template.id);
                          }}
                          className="mx-auto text-blue-600 hover:text-2xl text-xl cursor-pointer w-1/4 hover:text-blue-700"
                        />
                        <MdDelete
                          onClick={() => {
                            setRemoveModal(true);
                            setRemoveId(template.id);
                          }}
                          className="mx-auto text-red-500 hover:text-2xl text-xl cursor-pointer w-1/4"
                        />
                      </p>
                    </>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    <div className="rounded-lg">
                      {data &&
                        Array.from({ length: data.pageCount }).map(
                          (_, index) => (
                            <div key={index} className="flex gap-3">
                              <input
                                type="text"
                                value={imageNames[index] || ""}
                                onChange={(e) =>
                                  handleImageNameChange(index, e.target.value)
                                }
                                required
                                placeholder={
                                  data.pageCount === 1
                                    ? "image name"
                                    : `${
                                        index === 0 ? "first" : "second"
                                      } image name`
                                }
                                className="input rounded-full px-3 mb-5 py-1  border-1 border-gray-200 rounded-3 border-transparent shadow shadow-blue-200 focus:outline-none focus:border-blue-500 placeholder-gray-400"
                              />
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="mx-auto max-w-xl border-2  px-28 mt-5 text-center  shadow-teal-400 pb-5"
                style={{ borderColor: "skyblue", borderRadius: "60px" }}
              >
                <img
                  src={UploadFile}
                  alt="uploadIcon"
                  width={"25%"}
                  className=" mx-auto mt-5 pt-3 mb-4"
                />
                <h2 className=" text-xl font-semibold text-white mb-4 mt-5">
                  Drag and Drop file to upload <br /> or{" "}
                </h2>
                <div className="relative flex justify-center">
                  <label
                    className="flex items-center font-medium text-white bg-blue-500 rounded-3xl shadow-md cursor-pointer select-none text-lg px-6 py-2 hover:shadow-xl active:shadow-md"
                    htmlFor="file-upload"
                  >
                    <span>Upload CSV File : {csvFile?.name}</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx"
                    name="file"
                    onChange={onCsvFileHandler}
                    className="absolute -top-full opacity-0"
                  />
                </div>
                <p className="text-white font-medium my-3">
                  Supported files: xlsx
                </p>
              </div>
              {/* 2nd section */}
              <div
                className="mx-auto max-w-xl border-2 px-28 mt-5 text-center shadow-md pb-5"
                style={{ borderColor: "skyblue", borderRadius: "60px" }}
              >
                <img
                  src={UploadFile}
                  alt="uploadIcon"
                  width={"25%"}
                  className="mx-auto mt-5 pt-3 mb-4"
                />

                <h2 className=" text-xl font-semibold text-white mb-4 mt-5">
                  Drag and Drop file to upload <br /> or{" "}
                </h2>
                <div className="relative flex justify-center">
                  <label
                    className="flex items-center font-medium text-white bg-blue-500 rounded-3xl shadow-md cursor-pointer select-none text-lg px-6 py-2 hover:shadow-xl active:shadow-md"
                    htmlFor="image-folder-upload"
                  >
                    <span>Upload Zip file : {imageFolder?.name}</span>

                    <input
                      id="image-folder-upload"
                      type="file"
                      accept=".zip,.folder,.rar"
                      multiple
                      name="file"
                      onChange={onImageFolderHandler}
                      className="absolute -top-full opacity-0"
                    />
                  </label>
                </div>
                <p className="text-white font-medium my-3">
                  Supported files: .zip
                </p>
              </div>
            </div>
            <div className="my-6 w-full flex justify-center">
              <button
                type="submit"
                onClick={onSaveFilesHandler}
                className="bg-teal-600 px-8 text-white py-3 text-xl font-medium rounded-3xl"
              >
                Save Files
              </button>
            </div>
          </div>
        </div>

        {/* EDIT CONFIRMATION MODAL */}
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
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                        {/* Warning icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-6 w-6 text-yellow-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M12 5.75l-7.75 13.5h15.5L12 5.75z"
                          />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                          className="text-lg font-medium text-gray-900"
                          id="modal-title"
                        >
                          Confirm Update
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to update the template ?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => onTemplateEditHandler(editId)}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setEditModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* REMOVE CONFIRMATION MODAL */}
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-6 w-6 text-red-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M12 5.75l-7.75 13.5h15.5L12 5.75z"
                          />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                          className="text-lg font-medium text-gray-900"
                          id="modal-title"
                        >
                          Confirm Removal
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to remove this template?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => onTemplateRemoveHandler(removeId)}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setRemoveModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <ModalWithLoadingBar
          isOpen={loading}
          onClose={() => {}}
          progress={progress}
          message="Uploading csv and image zip the files..."
        />
      </div>
    </div>
  );
};

export default CsvUploader;
