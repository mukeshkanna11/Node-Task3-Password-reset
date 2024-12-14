import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ResetPage from "./pages/ResetPage";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Set Login as the default page */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
