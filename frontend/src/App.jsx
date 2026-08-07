import { Routes, Route, Navigate } from "react-router"; 
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import Home from "./pages/Home";
import Signup from "./pages/authentication/Signup";
import Login from "./pages/authentication/Login";
import { checkAuth } from "./features/auth/authSlice";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProblemsTable from "./pages/admin/ManageProblems";
import UpdateProblem from "./pages/admin/UpdateProblem";
import UserManagement from "./pages/admin/UserManagement";
import ProblemWorkSpace from "./pages/problemWorkspace/problemWorkspace";
import UserProfile from "./pages/UserProfile";


// --- Route Wrappers ---
const ProtectedRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ user, isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};


const App = () => {
  const { user, isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        console.log("app is dispatching checkAuth")
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        console.error("Authentication check failed:", error.message);
      }
    };
    verifyUser();
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-base-300">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* --- PUBLIC & AUTH ROUTES --- */}
      <Route 
        path="/login" 
        element={<PublicOnlyRoute isAuthenticated={isAuthenticated}><Login /></PublicOnlyRoute>} 
      />
      <Route 
        path="/signup" 
        element={<PublicOnlyRoute isAuthenticated={isAuthenticated}><Signup /></PublicOnlyRoute>} 
      />

      {/* --- PROTECTED USER ROUTES --- */}
      <Route 
        path="/" 
        element={<ProtectedRoute isAuthenticated={isAuthenticated}><Home /></ProtectedRoute>} 
      />
      <Route 
        path="/profile" 
        element={<ProtectedRoute isAuthenticated={isAuthenticated}><UserProfile /></ProtectedRoute>} 
      />
      <Route 
        path="/problem/:problemId"  
        element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProblemWorkSpace /></ProtectedRoute>} 
      />

      {/* --- ADMIN ROUTES --- */}
      <Route
        path="/admin"
        element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><AdminLayout /></AdminRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="problems" element={<ManageProblemsTable />} />
        <Route path="update-problem/:problemId" element={<UpdateProblem />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* --- CATCH ALL (404) --- */}
      <Route 
        path="*" 
        element={
          <div className="flex h-screen w-full flex-col items-center justify-center text-base-content bg-base-300">
            <h1 className="text-4xl font-bold">404 - Not Found</h1>
            <p className="mt-2 text-base-content/60">The page you are looking for does not exist.</p>
          </div>
        } 
      />
    </Routes>
  );
};

export default App;