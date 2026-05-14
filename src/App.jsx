import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ShoeList from "./components/ShoeList";
import AddShoe from "./components/AddShoe/AddShoe";
import ShoeDetail from "./components/ShoeDetail/ShoeDetail";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<ShoeList />} />
        <Route path="/add" element={<AddShoe />} />
        <Route path="/shoe/:id" element={<ShoeDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
