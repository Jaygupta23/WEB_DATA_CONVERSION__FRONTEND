import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { REACT_APP_IP, onGetTemplateHandler } from "../../services/common";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const FieldDecision = () => {
  const [mappedData, setMappedData] = useState([]);
  const [templateHeaders, setTemplateHeaders] = useState([]);
  const [formFields, setFormField] = useState([]);
  const [questionsField, setQuestionsField] = useState([]);
  const { id } = useParams();
  let token = JSON.parse(localStorage.getItem("userData"));
  // navigate(`/csvuploader/taskAssign/${id}`);

  useEffect(() => {
    const fetchMappedData = async () => {
      try {
        const template = await onGetTemplateHandler();
        const response = await axios.get(
          `http://${REACT_APP_IP}:4000/get/mappeddata/${id}`,
          {
            headers: {
              token: token,
            },
          }
        );
        const selectedTemplate = template.find((data) => data.id == id);
        setTemplateHeaders(selectedTemplate);
        setMappedData(response?.data);
        // Initialize arrays to hold the separated fields
        const formField = {};
        const questionsFields = [];

        // Iterate over templateHeaders and categorize based on typeField
        Object.entries({ ...response?.data }).map(([key, value], i) => {
          const templateData = selectedTemplate?.templetedata?.find((data) => {
            if (data.attribute === value && data.fieldType === "formField") {
              formField[i] = key;
            }
          });
        });

        Object.entries({ ...response?.data }).map(([key, value], i) => {
          const templateData = selectedTemplate?.templetedata?.find((data) => {
            if (
              data.attribute === value &&
              data.fieldType === "questionsField"
            ) {
              questionsFields[i] = key;
            }
          });
        });

        setFormField(formField);
        setQuestionsField(questionsFields);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchMappedData();
  }, []);

  // // Dummy data for form fields and questions (replace with your actual data)
  // // const formFields = [
  // //   { id: 1, name: "RollNo" },
  // //   { id: 2, name: "Name" },
  // //   { id: 3, name: "Dob" },
  // //   { id: 4, name: "Barcode" },
  // //   { id: 5, name: "Field 5" },
  // //   { id: 6, name: "Field 6" },
  // // ];

  // // const questions = [
  // //   { id: 1, text: "Question 1" },
  // //   { id: 2, text: "Question 2" },
  // //   { id: 3, text: "Question 3" },
  // //   { id: 4, text: "Question 4" },
  // //   { id: 5, text: "Question 5" },
  // //   { id: 6, text: "Question 6" },
  // //   { id: 7, text: "Question 7" },
  // //   { id: 8, text: "Question 8" },
  // //   { id: 9, text: "Question 9" },
  // //   { id: 10, text: "Question 10" },
  // //   { id: 11, text: "Question 11" },
  // //   { id: 12, text: "Question 12" },
  // //   { id: 13, text: "Question 13" },
  // //   { id: 14, text: "Question 14" },
  // //   { id: 15, text: "Question 15" },
  // //   { id: 16, text: "Question 16" },
  // //   { id: 17, text: "Question 17" },
  // //   { id: 18, text: "Question 18" },
  // //   { id: 19, text: "Question 19" },
  // //   { id: 20, text: "Question 20" },
  // //   { id: 21, text: "Question 21" },
  // //   { id: 22, text: "Question 22" },
  // //   { id: 23, text: "Question 23" },
  // //   { id: 24, text: "Question 24" },
  // //   { id: 25, text: "Question 25" },
  // //   { id: 26, text: "Question 26" },
  // //   { id: 27, text: "Question 27" },
  // //   { id: 28, text: "Question 28" },
  // //   { id: 29, text: "Question 29" },
  // //   { id: 30, text: "Question 30" },
  // //   { id: 31, text: "Question 31" },
  // //   { id: 32, text: "Question 32" },
  // //   { id: 33, text: "Question 33" },
  // //   { id: 34, text: "Question 34" },
  // //   { id: 35, text: "Question 35" },
  // //   { id: 36, text: "Question 36" },
  // //   { id: 37, text: "Question 37" },
  // //   { id: 38, text: "Question 38" },
  // //   { id: 39, text: "Question 39" },
  // //   { id: 40, text: "Question 40" },
  // //   { id: 41, text: "Question 41" },
  // //   { id: 42, text: "Question 42" },
  // //   { id: 43, text: "Question 43" },
  // //   { id: 44, text: "Question 44" },
  // //   { id: 45, text: "Question 45" },
  // //   { id: 46, text: "Question 46" },
  // //   { id: 47, text: "Question 47" },
  // //   { id: 48, text: "Question 48" },
  // //   { id: 49, text: "Question 49" },
  // //   { id: 50, text: "Question 50" },
  // //   { id: 51, text: "Question 51" },
  // //   { id: 52, text: "Question 52" },
  // //   { id: 53, text: "Question 53" },
  // //   { id: 54, text: "Question 54" },
  // //   { id: 55, text: "Question 55" },
  // //   { id: 56, text: "Question 56" },
  // //   { id: 57, text: "Question 57" },
  // //   { id: 58, text: "Question 58" },
  // //   { id: 59, text: "Question 59" },
  // //   { id: 60, text: "Question 60" },
  // //   { id: 61, text: "Question 61" },
  // //   { id: 62, text: "Question 62" },
  // //   { id: 63, text: "Question 63" },
  // //   { id: 64, text: "Question 64" },
  // //   { id: 65, text: "Question 65" },
  // //   { id: 66, text: "Question 66" },
  // //   { id: 67, text: "Question 67" },
  // //   { id: 68, text: "Question 68" },
  // //   { id: 69, text: "Question 69" },
  // //   { id: 70, text: "Question 70" },
  // //   { id: 71, text: "Question 71" },
  // //   { id: 72, text: "Question 72" },
  // //   { id: 73, text: "Question 73" },
  // //   { id: 74, text: "Question 74" },
  // //   { id: 75, text: "Question 75" },
  // //   { id: 76, text: "Question 76" },
  // //   { id: 77, text: "Question 77" },
  // //   { id: 78, text: "Question 78" },
  // //   { id: 79, text: "Question 79" },
  // //   { id: 80, text: "Question 80" },
  // //   { id: 81, text: "Question 81" },
  // //   { id: 82, text: "Question 82" },
  // //   { id: 83, text: "Question 83" },
  // //   { id: 84, text: "Question 84" },
  // //   { id: 85, text: "Question 85" },
  // //   { id: 86, text: "Question 86" },
  // //   { id: 87, text: "Question 87" },
  // //   { id: 88, text: "Question 88" },
  // //   { id: 89, text: "Question 89" },
  // //   { id: 90, text: "Question 90" },
  // //   { id: 91, text: "Question 91" },
  // //   { id: 92, text: "Question 92" },
  // //   { id: 93, text: "Question 93" },
  // //   { id: 94, text: "Question 94" },
  // //   { id: 95, text: "Question 95" },
  // //   { id: 96, text: "Question 96" },
  // //   { id: 97, text: "Question 97" },
  // //   { id: 98, text: "Question 98" },
  // //   { id: 99, text: "Question 99" },
  // //   { id: 100, text: "Question 100" },
  // // ];

  // // State to manage the selected checkboxes
  // const [formFieldChecks, setFormFieldChecks] = useState(
  //   formFields.reduce((acc, field) => {
  //     acc[field.id] = { legal: false, mult: false, blank: false };
  //     return acc;
  //   }, {})
  // );

  // const [questionChecks, setQuestionChecks] = useState(
  //   questionsField.reduce((acc, question) => {
  //     acc[question.id] = { mult: false, blank: false };
  //     return acc;
  //   }, {})
  // );

  // // State to manage the "Select All" checkboxes
  // const [selectAllFormFields, setSelectAllFormFields] = useState({
  //   legal: false,
  //   mult: false,
  //   blank: false,
  // });

  // const [selectAllQuestions, setSelectAllQuestions] = useState({
  //   mult: false,
  //   blank: false,
  // });

  // // Function to handle checkbox change for form fields
  // const handleFormFieldCheckboxChange = (fieldId, checkboxType) => {
  //   setFormFieldChecks({
  //     ...formFieldChecks,
  //     [fieldId]: {
  //       ...formFieldChecks[fieldId],
  //       [checkboxType]: !formFieldChecks[fieldId][checkboxType],
  //     },
  //   });
  // };

  // // Function to handle checkbox change for questions
  // const handleQuestionCheckboxChange = (questionId, checkboxType) => {
  //   setQuestionChecks({
  //     ...questionChecks,
  //     [questionId]: {
  //       ...questionChecks[questionId],
  //       [checkboxType]: !questionChecks[questionId][checkboxType],
  //     },
  //   });
  // };

  // // Function to handle "Select All" for form fields
  // const handleSelectAllFormFields = (checkboxType) => {
  //   const allChecked = !selectAllFormFields[checkboxType];

  //   const newChecks = formFields.reduce((acc, field) => {
  //     acc[field.id] = {
  //       ...formFieldChecks[field.id],
  //       [checkboxType]: allChecked,
  //     };
  //     return acc;
  //   }, {});

  //   setFormFieldChecks(newChecks);
  //   setSelectAllFormFields({
  //     ...selectAllFormFields,
  //     [checkboxType]: allChecked,
  //   });
  // };

  // // Function to handle "Select All" for questions
  // const handleSelectAllQuestions = (checkboxType) => {
  //   const allChecked = !selectAllQuestions[checkboxType];

  //   const newChecks = questionsField.reduce((acc, question) => {
  //     acc[question.id] = {
  //       ...questionChecks[question.id],
  //       [checkboxType]: allChecked,
  //     };
  //     return acc;
  //   }, {});

  //   setQuestionChecks(newChecks);
  //   setSelectAllQuestions({
  //     ...selectAllQuestions,
  //     [checkboxType]: allChecked,
  //   });
  // };

  console.log(questionsField);
  console.log(formFields);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="container mx-auto px-4 sm:px-8">
        {/* Form Fields Section */}
        <div className="mb-8 mt-12">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="px-4 py-3 bg-blue-500 text-white text-lg font-semibold">
              Form Fields
            </h2>
            <div className="p-4">
              <div className="flex justify-end mb-4 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500"
                    // checked={selectAllFormFields.legal}
                    // onChange={() => handleSelectAllFormFields("legal")}
                  />
                  <span className="ml-2 text-sm text-gray-700">All Legal</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500"
                    // checked={selectAllFormFields.mult}
                    // onChange={() => handleSelectAllFormFields("mult")}
                  />
                  <span className="ml-2 text-sm text-gray-700">All Mult</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500"
                    // checked={selectAllFormFields.blank}
                    // onChange={() => handleSelectAllFormFields("blank")}
                  />
                  <span className="ml-2 text-sm text-gray-700">All Blank</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({ ...formFields }).map(([key, value], i) => {
                  <div key={i} className="flex items-center mb-4">
                    <label className="text-sm font-medium w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {value}
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-500"
                          // checked={formFieldChecks[field.id].legal}
                          // onChange={() =>
                          //   handleFormFieldCheckboxChange(field.id, "legal")
                          // }
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Legal
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-500"
                          // checked={formFieldChecks[field.id].mult}
                          // onChange={() =>
                          //   handleFormFieldCheckboxChange(field.id, "mult")
                          // }
                        />
                        <span className="ml-2 text-sm text-gray-700">Mult</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-500"
                          // checked={formFieldChecks[field.id].blank}
                          // onChange={() =>
                          //   handleFormFieldCheckboxChange(field.id, "blank")
                          // }
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Blank
                        </span>
                      </label>
                    </div>
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Questions Section */}
        <div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="px-4 py-3 bg-green-500 text-white text-lg font-semibold">
              Questions
            </h2>
            <div className="p-4">
              <div className="flex justify-end mb-4 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    // checked={selectAllQuestions.mult}
                    // onChange={() => handleSelectAllQuestions("mult")}
                  />
                  <span className="ml-2 text-sm text-gray-700">All Mult</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-500"
                    // checked={selectAllQuestions.blank}
                    // onChange={() => handleSelectAllQuestions("blank")}
                  />
                  <span className="ml-2 text-sm text-gray-700">All Blank</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                {questionsField.map((question) => (
                  <div key={question.id} className="flex items-center mb-2">
                    <label className="text-sm font-medium w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {question.text}
                    </label>

                    <div className="flex justify-between">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-green-500"
                          // checked={questionChecks[question.id].mult}
                          // onChange={() =>
                          //   handleQuestionCheckboxChange(question.id, "mult")
                          // }
                        />
                        <span className="ml-2 text-sm text-gray-700">Mult</span>
                      </label>
                      <label className="inline-flex items-center ml-2">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-green-500"
                          // checked={questionChecks[question.id].blank}
                          // onChange={() =>
                          //   handleQuestionCheckboxChange(question.id, "blank")
                          // }
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Blank
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDecision;
