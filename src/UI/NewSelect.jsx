import React, { useState, useContext, useEffect } from "react";
import Select from "react-select";
import dataContext from "../Store/DataContext";
import {
  onGetTemplateHandler,
  fetchFilesAssociatedWithTemplate,
  onGetAllTasksHandler,
} from "../services/common";

const NewSelect = (props) => {
  const [selectValue, setSelectValue] = useState(null);
  const [options, setOptions] = useState([]);
  const [fileOptions, setFileOptions] = useState([]);
  const [zipFileOptions, setZipFileOptions] = useState([]);
  const dataCtx = useContext(dataContext);

  const fetchFile = async (templateId) => {
    try {
      const response = await fetchFilesAssociatedWithTemplate(templateId);
      const csvOptions = response.map((item) => ({
        label: item.csvFile,
        value: item.id,
      }));
      const zipOptions = response.map((item) => ({
        label: item.zipFile,
        value: item.id,
      }));
      setFileOptions(csvOptions);
      setZipFileOptions(zipOptions);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templates = await onGetTemplateHandler();
        const tasks = await onGetAllTasksHandler();

        const taskStatusArr = tasks.filter((task) => task.taskStatus);

        const filteredTemplates = [];

        for (let i = 0; i < taskStatusArr.length; i++) {
          for (let j = 0; j < templates.length; j++) {
            if (taskStatusArr[i].templeteId == templates[j].id) {
              filteredTemplates.push(templates[j]);
              break;
            }
          }
        }

        const options = templates.map((item) => ({
          label: item.name,
          value: item.id,
        }));

        setOptions(options);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (props.label === "Select Template") {
      fetchData();
    } else if (
      (props.label === "Select Csv Files" ||
        props.label === "Select Zip Files") &&
      props.selectedTemplate
    ) {
      fetchFile(props.selectedTemplate);
    }
  }, [props.label, props.selectedTemplate]);

  const handleChange = (selectedOption) => {
    setSelectValue(selectedOption.value);

    if (props.label === "Select Image Column") {
      dataCtx.setImageColName(selectedOption.value);
    } else if (props.label === "Select Primary Key") {
      dataCtx.addToPrimaryKey(selectedOption.value);
    } else if (props.label === "Select Template") {
      props.onTemplateSelect(selectedOption.value);
      fetchFile(selectedOption.value);
    }
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
    }),
  };
  const customDropdownStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Set a high z-index value
    }),
  };

  const optionsToShow =
    props.label === "Select Csv Files"
      ? fileOptions
      : props.label === "Select Zip Files"
      ? zipFileOptions
      : options;

  return (
    <Select
      value={optionsToShow.find((option) => option.value === selectValue)}
      onChange={handleChange}
      options={optionsToShow}
      styles={{ ...customStyles, ...customDropdownStyles }}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      // styles={customStyles}
      className="w-[100%] pt-5 text-md leading-7 "
      placeholder={props.label}
    />
  );
};

export default NewSelect;
