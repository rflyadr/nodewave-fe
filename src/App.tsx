import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import { AuthProvider, useAuth } from "./AuthContext";
import TopNavbar from "./components/Navbar";

function PrivateRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role || "")) {
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isLoggedIn, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={
          isLoggedIn ? (
            user?.role === "ADMIN" ? (
              <Navigate to="/admin" replace />
            ) : (
              <PrivateRoute roles={["USER", "ADMIN"]}>
                <DashboardPage />
              </PrivateRoute>
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={["USER", "ADMIN"]}>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={["ADMIN"]}>
            <AdminPage />
          </PrivateRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <TopNavbar />}
      <div className={isLoggedIn ? "pt-24 px-4 sm:px-8 max-w-6xl mx-auto min-h-screen" : ""}>
        <AppRoutes />
      </div>
    </>
  );
}


export default App;
