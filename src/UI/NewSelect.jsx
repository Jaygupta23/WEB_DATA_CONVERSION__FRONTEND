import React, { useState, useContext, useEffect } from "react";
import Select from "react-select";
import dataContext from "../Store/DataContext";
import { onGetTemplateHandler } from "../services/common";

const NewSelect = (props) => {
  const [selectValue, setSelectValue] = useState("");
  const [options, setOptions] = useState([]);
  const dataCtx = useContext(dataContext);

  useEffect(() => {
    if (props.label === "Select Template") {
      fetchData();
    } else if (props.label === "Select Files") {
      setOptions(
        dataCtx.csvHeader.map((item) => ({ label: item, value: item }))
      );
    }

    async function fetchData() {
      const response = await onGetTemplateHandler();
      const options = response.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setOptions(options);
    }
  }, [props.label, dataCtx.csvHeader]);

  const handleChange = (selectedOption) => {
    setSelectValue(selectedOption);
    if (props.label === "Select Image Column") {
      dataCtx.setImageColName(selectedOption.value);
    } else if (props.label === "Select Primary Key") {
      dataCtx.addToPrimaryKey(selectedOption.value);
    }
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)", // Add desired box-shadow for elevation
    }),
  };

  return (
    <Select
      value={selectValue}
      onChange={handleChange}
      options={options}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      styles={customStyles} // Apply custom styles here
      className="w-[100%]"
      placeholder={props.label}
    />
  );
};

export default NewSelect;
