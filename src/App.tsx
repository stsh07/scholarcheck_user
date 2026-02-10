import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ApplicationFormPage from "./pages/ApplicationFormPage";
import AIAssistantPage from "./pages/AIAssistantPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/application-form" element={<ApplicationFormPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
      </Routes>
    </Router>
  );
}