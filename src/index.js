import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "animate.css";
import { ToastContainer } from "react-toastify";
import reportWebVitals from "./reportWebVitals";
import DataProvider from "./Store/DataProvider.jsx";

// import '@syncfusion/ej2-base/styles/material.css';
// import '@syncfusion/ej2-react-grids/styles/material.css';
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DataProvider>
      <App />
      <ToastContainer
        position="top-center"
        autoClose={800}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </DataProvider>
  </React.StrictMode>
);

reportWebVitals();
