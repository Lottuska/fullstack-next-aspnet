import React from "react";

const Table = (props) => {
  // Define custom column widths
  const columns = props.desiredColumnWidths;
  const columnsTotal = columns.length;

  const modifiedHeaders = [...props.headers];
  // Make one empty column for action buttons
  if (props.actions) {
    modifiedHeaders.push("");
  }

  return (
    <table
      className="w-full text-sm text-left text-gray-500"
      style={{ tableLayout: "fixed" }}
    >
      <thead className="text-xs text-gray-800 uppercase bg-indigo-100">
        <tr>
          {modifiedHeaders.map((header, index) => (
            <th
              scope="col"
              className={`hidden md:table-cell px-2 py-2 lg:px-6 lg:py-3 ${
                index === 0 && "rounded-l-lg"
              } ${index + 1 === modifiedHeaders.length && "rounded-r-lg"}`}
              style={{ width: `${(columns[index] / columnsTotal) * 100}%` }}
            >
              {header}
            </th>
          ))}
          {props.mobileHeaders.map((header, index) => (
            <th
              scope="col"
              className={`table-cell md:hidden px-2 py-2 lg:px-6 lg:py-3 ${
                index === 0 && "rounded-l-lg"
              } ${index + 1 === props.mobileHeaders.length && "rounded-r-lg"}`}
              style={{ width: `${(1 / props.mobileHeaders.length) * 100}%` }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.data?.length <= 0 ? (
          <tr className="text-center">
            <td className="py-10" colSpan={modifiedHeaders.length}>
              No data
            </td>
          </tr>
        ) : (
          props.data?.map((item, index) => (
            <React.Fragment key={index}>
              <tr className="bg-white">
                {Object.keys(item).map((property, i) => (
                  <td
                    key={i}
                    className={`${
                      props.mobileHeaders && "hidden md:table-cell"
                    } ${
                      i + 1 <= 3 && "text-gray-800 font-bold"
                    } px-2 py-2 lg:px-6 lg:py-3 align-top`}
                  >
                    {item[property]}
                  </td>
                ))}
                {props.actions && (
                  <td
                    className={`${
                      props.mobileHeaders && "hidden md:table-cell"
                    } px-1 py-4 flex justify-end align-top`}
                  >
                    <div
                      className="inline-flex rounded-md shadow-sm"
                      role="group"
                    >
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-indigo-600 focus:z-10 focus:ring-2 focus:ring-indigo-600 focus:text-indigo-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-indigo-600 focus:z-10 focus:ring-2 focus:ring-indigo-600 focus:text-indigo-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
              {props.mobileHeaders && (
                <>
                  <tr className="bg-white">
                    {Object.keys(item)
                      .slice(0, props.mobileHeaders?.length)
                      .map((property, i) => (
                        <td
                          key={i}
                          className="table-cell md:hidden px-2 py-2 lg:px-6 lg:py-3 align-top text-gray-800 font-bold"
                        >
                          {item[property]}
                        </td>
                      ))}
                  </tr>
                  <tr className="bg-white">
                    {Object.keys(item)
                      .slice(
                        props.mobileHeaders?.length,
                        Object.keys(item).length
                      )
                      .map((property, i) => (
                        <td
                          key={i}
                          className="table-cell md:hidden px-2 py-2 lg:px-6 lg:py-3 align-top"
                          colSpan={modifiedHeaders.length}
                        >
                          {item[property]}
                        </td>
                      ))}
                  </tr>
                  <tr className="bg-white">
                    {props.actions && (
                      <td
                        className="table-cell md:hidden px-1 py-4"
                        colSpan={modifiedHeaders.length}
                      >
                        <div className="w-full flex justify-center">
                          <div
                            className="inline-flex rounded-md shadow-sm"
                            role="group"
                          >
                            <button
                              type="button"
                              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-indigo-600 focus:z-10 focus:ring-2 focus:ring-indigo-600 focus:text-indigo-600"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-indigo-600 focus:z-10 focus:ring-2 focus:ring-indigo-600 focus:text-indigo-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                  <tr className="block md:hidden">
                    <hr
                      className="h-2 my-1 bg-indigo-100 rounded-lg border-0"
                      style={{ width: `${props.mobileHeaders.length * 100}%` }}
                    />
                  </tr>
                </>
              )}
            </React.Fragment>
          ))
        )}
      </tbody>
    </table>
  );
};

export default Table;
