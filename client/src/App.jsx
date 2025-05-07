import Signup from "./components/Signup";
import Signin from "./components/Signin";
import CreatorView from "./components/CreatorView";
import ConsumerView from "./components/ConsumerView";
import Home from "./components/Home";
import Profile from "./components/Profile"
import Navbar from "./components/Navbar";
import ProtectedRoute from "./tools/ProjectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#1A1A1A]">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/creator"
              element={
                <ProtectedRoute requiresAuth={true} requiredRole="creator" fallbackRoute="/consumer">
                  <CreatorView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consumer"
              element={
                <ProtectedRoute requiresAuth={true}>
                  <ConsumerView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <ProtectedRoute requiresAuth={false}>
                  <Signup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signin"
              element={
                <ProtectedRoute requiresAuth={false}>
                  <Signin />
                </ProtectedRoute>
              }
            />
          <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute requiresAuth={true}>
                  <Profile />
                </ProtectedRoute>
              }
            />          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
