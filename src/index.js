import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import "./styles/account.css";
import "./styles/book.css";
import "./styles/books.css";
import "./styles/createReview.css";
import "./styles/dashboard.css";
import "./styles/login.css";
import "./styles/register.css";
import "./styles/review.css";
import "./styles/updateReview.css";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
