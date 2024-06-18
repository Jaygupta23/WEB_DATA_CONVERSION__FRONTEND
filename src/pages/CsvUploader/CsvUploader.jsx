import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import UploadFile from "../../assets/images/CsvUploaderImg copy.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dataContext from "../../Store/DataContext";
import ModalWithLoadingBar from "../../UI/Modal";
import {
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
} from "../../services/common";
import { REACT_APP_IP } from "../../services/common";
import TemplateRemove from "./TemplateRemove";
import TemplateEdit from "./TemplateEdit";
import UploadSection from "./UploadSection";

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
      await axios.post(
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
      console.log(error?.response?.data?.error);
      toast.warning(error?.response?.data?.error);
    }
  };

  return (
    <div className="flex justify-center items-center h-auto w-full ">
      <div className="w-full">
        <div className="csvuploader bg-gradient-to-r from-blue-700 to-purple-700 xl:h-[100vh] w-full flex flex-col justify-center items-center">
          <UploadSection
            onImageFolderHandler={onImageFolderHandler}
            setEditId={setEditId}
            setEditModal={setEditModal}
            data={data}
            templateName={templateName}
            setTemplateName={setTemplateName}
            imageNames={imageNames}
            filteredTemplates={filteredTemplates}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            setRemoveModal={setRemoveModal}
            setRemoveId={setRemoveId}
            handleImageNameChange={handleImageNameChange}
            UploadFile={UploadFile}
            csvFile={csvFile}
            onCsvFileHandler={onCsvFileHandler}
            imageFolder={imageFolder}
            onSaveFilesHandler={onSaveFilesHandler}
          />
        </div>

        {/* EDIT CONFIRMATION MODAL */}
        <TemplateEdit
          onTemplateEditHandler={onTemplateEditHandler}
          editModal={editModal}
          editId={editId}
          setEditModal={setEditModal}
        />

        {/* REMOVE CONFIRMATION MODAL */}
        <TemplateRemove
          removeModal={removeModal}
          onTemplateRemoveHandler={onTemplateRemoveHandler}
          setRemoveModal={setRemoveModal}
          removeId={removeId}
        />
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
