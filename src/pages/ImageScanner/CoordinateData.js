import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RxCross1 } from "react-icons/rx";

const CoordinateData = ({
  onSelectedHandler,
  open,
  cancelButtonRef,
  setOpen,
  onResetHandler,
  fieldType,
  setFieldType,
  setSelectType,
  selectType,
  questionRange,
  setQuestionRange,
  lengthOfField,
  setLengthOfField,
  inputField,
  setInputField,
}) => {
  return (
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
                        onChange={(e) => setFieldType(e.target.value)}
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
                        checked={fieldType === "questionsField"}
                        onChange={(e) => setFieldType(e.target.value)}
                      />
                      <span className="ml-2 text-lg text-gray-700">
                        Questions Field
                      </span>
                    </label>
                  </div>
                </div>
                <div className="px-4 pb-8 sm:flex sm:px-6 justify-between">
                  {fieldType === "formField" || fieldType === "" ? (
                    <div className="flex flex-col">
                      <div className="flex gap-10">
                        <select
                          onChange={(e) => setSelectType(e.target.value)}
                          className="input w-full sm:w-[32%] border-2 font-semibold bg-white text-lg focus:border-1 rounded-xl px-3 py-2 shadow-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select Type</option>
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="alphanumeric">Alphanumeric</option>
                        </select>
                        {selectType === "number" && (
                          <div className="flex gap-5">
                            <div className="flex items-center gap-4">
                              <span className="font-bold">Start</span>
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
                      </div>

                      <div className="mt-10 flex gap-5">
                        <div className="flex items-center gap-4">
                          <span className="font-bold">Field Length</span>
                          <input
                            type="number"
                            id="Quantity"
                            value={lengthOfField}
                            onChange={(e) => setLengthOfField(e.target.value)}
                            className="h-10 w-16 rounded border-2 border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                        <input
                          required
                          className="input w-full sm:w-[36%] border-2 font-semibold bg-white text-lg focus:border-1 rounded-xl px-3 py-2 shadow-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          type="text"
                          name="field"
                          placeholder="field name..."
                          value={inputField}
                          onChange={(e) => setInputField(e.target.value)}
                        />
                        <button
                          type="button"
                          data-bs-dismiss="modal"
                          className="bg-teal-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200 text-md font-medium px-6"
                          onClick={onSelectedHandler}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-5">
                      <div className="flex items-center gap-4">
                        <span className="font-bold">Start</span>
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
                      <button
                        type="button"
                        data-bs-dismiss="modal"
                        className="bg-teal-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200 text-md font-medium px-6"
                        onClick={onSelectedHandler}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CoordinateData;
