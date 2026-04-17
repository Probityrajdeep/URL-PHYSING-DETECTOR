import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import SiteLayout from "./components/layout/SiteLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import FAQ from "./pages/FAQ.jsx";
import Careers from "./pages/Careers.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

/** Top-level routes: marketing pages + auth + protected dashboard. */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
            <Route path="faq" element={<FAQ />} />
            <Route path="careers" element={<Careers />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
