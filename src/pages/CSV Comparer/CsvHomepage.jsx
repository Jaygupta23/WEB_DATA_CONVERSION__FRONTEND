import Customselect from "../../UI/Customselect";
import Input from "../../UI/Input";
import { Fab, CircularProgress, cardActionsClasses } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import OptimisedList from "../../UI/OptimisedList";
import Button from "@mui/material/Button";
import { useContext, useEffect, useState } from "react";
import dataContext from "../../Store/DataContext";
import axios from "axios";
import { useNavigate } from "react-router";
import classes from "./CSVHompage.module.css";
import { REACT_APP_IP } from "../../services/common";
import LoadingButton from "@mui/lab/LoadingButton";
import ModalWithLoadingBar from "../../UI/Modal";
import MultList from "../../UI/MultList";

import NewSelect from "../../UI/NewSelect";

const CsvHomepage = () => {
  const [loading, setLoading] = useState(false);
  const dataCtx = useContext(dataContext);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const token = JSON.parse(localStorage.getItem("userData"));
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    dataCtx.addToCsvHeader([]);
  }, []);
  useEffect(() => {
    document.body.style.userSelect = "none";
    return () => {
      // Cleanup function to reset the style when the component unmounts
      document.body.style.userSelect = "auto";
    };
  }, []);

  const compareHandler = () => {
    const {
      primaryKey = "",
      skippingKey = "",
      firstInputFileName = "",
      secondInputFileName = "",
      firstInputCsvFiles = [],
      // secondInputCsvFiles = [],
      imageColName = "",
      uploadZipImage = [],
      fileId = "",
      formFeilds = [],
    } = dataCtx;
    console.log(fileId, "file1w1w");

    if (firstInputCsvFiles.length === 0) {
      alert("Choose first CSV file");
      return;
    }
    console.log(firstInputCsvFiles, "csv1");

    // if (secondInputCsvFiles.length === 0) {
    //   alert("Choose second CSV file");
    //   return;
    // }

    // if (uploadZipImage.length === 0) {
    //   alert("Please select image zip file");
    //   return;
    // }

    if (primaryKey === "") {
      alert("Please select primary key");
      return;
    }

    if (imageColName === "") {
      alert("Please select image column name");
      return;
    }

    const sendRequest = async () => {
      // Create a FormData object
      try {
        setLoading(true);
        const formData = new FormData();
        // Append file data to FormData
        formData.append("firstInputCsvFile", firstInputCsvFiles);
        // formData.append("secondInputCsvFile", secondInputCsvFiles);
        formData.append("zipImageFile", dataCtx.uploadZipImage);
        formData.append("fileId", dataCtx.fileId);
        // Append other parameters to FormData
        formData.append("firstInputFileName", firstInputFileName);
        formData.append("secondInputFileName", secondInputFileName);
        formData.append("primaryKey", primaryKey);
        formData.append("skippingKey", skippingKey);
        formData.append("imageColName", imageColName);
        formData.append("formFeilds", formFeilds);

        // Make the POST request with Axios
        const response = await axios.post(
          `http://${REACT_APP_IP}:4000/compareData`,
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
        // console.log(response.status);

        // console.log(response.data);

        // dataCtx.setCsvFile(response.data.data);
        // const modifiedRes = response.data.data.map((item) => {
        //   return { ...item, corrected: "" };
        // });
        // dataCtx.addToCorrectedCsv(modifiedRes);
        setLoading(false);

        navigate(`/comparecsv/assign_operator/${selectedTemplate}`, {state: response.data});
      } catch (err) {
        // alert("Error Occured : ", JSON.stringify(err.response.data.err));
        // console.log(err.response);
        if (err.response && err.response.data) {
          const alertmsg = err.response.data.err;
          alert(`Error Occured : ${alertmsg}`);
          console.log(err.response.data.err);
        }
      }
    };
    sendRequest();
  };

  // const handleSelectAll = () => {
  //   setSelectedOptions(dataCtx.csvOptions.map(option => option.value));
  // };
  return (
    <>
      <main
        className={`flex flex-col gap-5 bg-white rounded-md bg-gradient-to-r from-blue-500 to-blue-500 ${classes.homepage}`}
      >
        <div
          className={`flex flex-col border-dashed pt-24 px-5 rounded-md xl:w-5/6 justify-center self-center ${classes.innerBox}`}
        >
          <h1 className="text-center mb-6 text-white text-2xl font-bold">
            MATCH AND COMPARE DATA
          </h1>
          <div className="flex flex-row justify-between  gap-10 mb-6">
            <NewSelect
              label="Select Template"
              onTemplateSelect={setSelectedTemplate}
            />
            <NewSelect
              label="Select Csv Files"
              state="second"
              selectedTemplate={selectedTemplate}
            />
          </div>
          <div className="flex flex-row justify-between  gap-10 mb-6">
            <NewSelect
              label="Select Zip Files"
              state="third"
              selectedTemplate={selectedTemplate}
            />
            <Input label="Select Paper 1" state="first" type="text/csv" />
            {/* <Input label="Select Paper 2" state="second" type="text/csv" /> */}
            {/* <Input
              label="Select Image Zipfile"
              state="third"
              type="application/zip,application/x-zip-compressed"
            /> */}
          </div>
          <div className="flex flex-row justify-between  gap-10 mb-6">
            <div className="w-1/2 text-white">
              <Customselect label="Select Primary Key" className="text-white" />
            </div>
            <div className="w-1/2">
              <Customselect label="Select Image Column" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center  gap-10">
            <div className="bg-opacity-95 border pl-2 pb-2  bg-white rounded sm:w-1/3 ">
              <div className="flex flex-row pt-2 pb-2 justify-between self-center ">
                <p className="text-sm font-semibold align-bottom self-center ">
                  Select Key For Skipping Comparison
                </p>
                {/* <Button onClick={handleSelectAll}>Select All</Button> */}
                <Button>Select All</Button>
              </div>
              <OptimisedList
              // selectedOptions={selectedOptions}
              // setSelectedOptions={setSelectedOptions}
              />
            </div>
            <div className="bg-opacity-95 border pl-2 pb-2  bg-slate-100 rounded sm:w-1/3 ">
              <div className="flex flex-row  pt-2 pb-2 justify-between self-center ">
                <p className="text-sm font-semibold align-bottom self-center ">
                  Select Form Feilds For Mult or Blank
                </p>
                <Button>Clear All</Button>
              </div>
              <MultList />
            </div>
            <div className="flex self-end">
              <LoadingButton
                color="primary"
                onClick={compareHandler}
                loading={loading}
                loadingPosition="start"
                startIcon={
                  <CompareArrowsIcon size={24} sx={{ marginRight: "8px" }} />
                }
                variant="contained"
              >
                Compare And Match
              </LoadingButton>
            </div>
          </div>
          <ModalWithLoadingBar
            isOpen={loading}
            onClose={() => {}}
            progress={progress}
            message="Comparing and matching the files..."
          />
        </div>
      </main>
    </>
  );
};

export default CsvHomepage;
