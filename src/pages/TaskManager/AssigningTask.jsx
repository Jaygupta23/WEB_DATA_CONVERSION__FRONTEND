import React from "react";

const AssigningTask = ({
  allUsers,
  setSelectedUser,
  selectedUser,
  taskValue,
  setTaskValue,
  onTaskAssignedHandler,
  totalData,
}) => {
  return (
    <>
      <div className="flex  space-y-4  flex-row items-center justify-between">
        <div className="">
          <h2 className="text-3xl font-semibold">Assign Tasks</h2>
        </div>
        <article className="rounded-xl bg-white p-2 ring ring-indigo-50  lg:p-4">
          <div className="flex items-start sm:gap-8">
            <div className="flex gap-3">
              <h1 className="rounded border border-indigo-500 bg-indigo-500 px-3 py-2 font-medium text-white">
                Total Data - {totalData}
              </h1>
            </div>
          </div>
        </article>
      </div>
      <div className="mt-4 flex flex-col">
        <div className="-mx-4 -my-2  sm:-mx-6 lg:-mx-8">
          <div className="inline-block w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-x-auto border border-gray-200 md:rounded-lg ">
              <table className="w-full divide-y divide-gray-200 ">
                <thead className="bg-gray-50 ">
                  <tr>
                    <th
                      scope="col"
                      className="px-12 py-3.5 text-left text-xl font-semibold text-gray-700"
                    >
                      <span>Users</span>
                    </th>

                    <th
                      scope="col"
                      className="px-12 py-3.5 text-left  text-xl font-semibold text-gray-700"
                    >
                      Min
                    </th>

                    <th
                      scope="col"
                      className="px-12 py-3.5 text-left text-xl font-semibold text-gray-700"
                    >
                      Max
                    </th>
                    <th
                      scope="col"
                      className="px-12 py-3.5 text-left text-xl font-semibold text-gray-700"
                    >
                      Task
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white ">
                  <tr>
                    <td className="whitespace-nowrap px-4 py-4 border-2">
                      <div className="flex items-center">
                        <div className=" w-full">
                          <div className="overflow-y-auto h-[310px] ">
                            {allUsers?.map((user, i) => {
                              if (user.role !== "Admin") {
                                return (
                                  <button
                                    onClick={() =>
                                      setSelectedUser({
                                        ...selectedUser,
                                        userId: user.id,
                                        userName: user.userName,
                                      })
                                    }
                                    className={`group flex items-center justify-between  mt-2 rounded-lg hover:bg-blue-200 hover:text-black w-full bg-blue-100 px-4 py-2 text-gray-700 
                                       ${
                                         selectedUser.userId === user.id
                                           ? "bg-blue-500 text-white"
                                           : "text-gray-500  hover:text-gray-700"
                                       }`}
                                  >
                                    <span className="text-md font-medium w-full">
                                      {user.userName}
                                    </span>
                                  </button>
                                );
                              } else {
                                return null;
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-12 py-4">
                      <div className="text-2xl text-gray-900 ">
                        <input
                          type="number"
                          min="1"
                          value={taskValue.min}
                          readOnly
                          id="Line3Qty"
                          className="h-10 w-16 rounded border-gray-400 bg-gray-200 p-0 text-center text-gray-600 [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-12 py-4">
                      <div className="text-2xl text-gray-900">
                        <input
                          type="number"
                          id="Line3Qty"
                          value={taskValue.max}
                          onChange={(e) =>
                            setTaskValue({
                              ...taskValue,
                              max: e.target.value,
                            })
                          }
                          className="h-10 w-16 rounded border-gray-400 bg-gray-200 p-0 text-center text-gray-600 [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-12 py-4">
                      <button
                        onClick={onTaskAssignedHandler}
                        className="rounded-3xl border border-indigo-500 bg-indigo-500 px-4 py-1 font-semibold text-white"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssigningTask;
