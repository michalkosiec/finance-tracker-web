import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuth, { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import type { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function DashboardPlaceholder() {
  const { logout } = useAuth();
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Jesteś zalogowany! 🚀</h1>
      <p>Tutaj wkrótce pojawią się Twoje statystyki i kategorie.</p>
      <button onClick={logout} style={{ padding: "8px 16px" }}>
        Wyloguj
      </button>
    </div>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPlaceholder />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
