// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ApplicationFormPage from "./pages/ApplicationFormPage";
import AIAssistantPage from "./pages/AIAssistantPage";

function isLoggedIn() {
  const token = localStorage.getItem("scholarcheck_accessToken");
  const user = localStorage.getItem("scholarcheck_user");
  return !!token && !!user;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  if (isLoggedIn()) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public-only pages (if logged in => always redirect to /home) */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/email-verification"
          element={
            <PublicOnlyRoute>
              <EmailVerificationPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <ResetPasswordPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />

        {/* ✅ Protected pages (if NOT logged in => redirect to /login) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/application-form"
          element={
            <ProtectedRoute>
              <ApplicationFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ fallback */}
        <Route path="*" element={<Navigate to={isLoggedIn() ? "/home" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}
