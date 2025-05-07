import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); 
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const isCreator = user?.roles?.creator === true;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  return (
    <nav className="bg-[#1A1A1A] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              Snap<span className="text-[#2DD4BF]">Vibe</span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {token ? (
              <>
                {isCreator && (
                  <Link
                    to="/creator"
                    className="text-[#D1D5DB] hover:text-[#2DD4BF] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Creator Dashboard
                  </Link>
                )}
                <Link
                  to="/consumer"
                  className="text-[#D1D5DB] hover:text-[#2DD4BF] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  View Content
                </Link>
                <Link
                  to={`/profile/${user._id}`}
                  className="text-[#D1D5DB] hover:text-[#2DD4BF] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  <span className="text-lg">👤</span>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white bg-[#2DD4BF] hover:bg-[#26A69A] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-[#D1D5DB] hover:text-[#2DD4BF] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>
                <Link
                  to="/signin"
                  className="text-white bg-[#2DD4BF] hover:bg-[#26A69A] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#D1D5DB] hover:text-[#2DD4BF] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {token ? (
              <>
                {isCreator && (
                  <Link
                    to="/creator"
                    className="block text-[#D1D5DB] hover:text-[#2DD4BF] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    Creator Dashboard
                  </Link>
                )}
                <Link
                  to="/consumer"
                  className="block text-[#D1D5DB] hover:text-[#2DD4BF] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  View Content
                </Link>
                <Link
                  to="/profile"
                  className="block text-[#D1D5DB] hover:text-[#2DD4BF] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <span className="text-lg">👤</span>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-white bg-[#2DD4BF] hover:bg-[#26A69A] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="block text-[#D1D5DB] hover:text-[#2DD4BF] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>
                <Link
                  to="/signin"
                  className="block text-white bg-[#2DD4BF] hover:bg-[#26A69A] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
