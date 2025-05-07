import { Link } from "react-router-dom";

export default function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] px-4 sm:px-6 lg:px-8">
      
      <div className="text-center space-y-8 max-w-3xl mx-auto">
        {/* Welcome Message */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
          Welcome to <span className="text-[#2DD4BF]">SnapVibe</span>
        </h1>
        <p className="text-lg sm:text-xl text-[#D1D5DB] max-w-xl mx-auto">
          Share your moments, connect with others, and explore a world of photos and videos.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!token ? (
            <>
              <Link
                to="/signup"
                className="inline-block px-6 py-3 bg-[#2DD4BF] text-white text-sm font-medium rounded-lg hover:bg-[#26A69A] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200"
              >
                Get Started
              </Link>
              <Link
                to="/signin"
                className="inline-block px-6 py-3 bg-transparent border border-[#2DD4BF] text-[#2DD4BF] text-sm font-medium rounded-lg hover:bg-[#2DD4BF] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200"
              >
                Sign In
              </Link>
            </>
          ) : (
            <Link
              to="/consumer"
              className="inline-block px-6 py-3 bg-[#2DD4BF] text-white text-sm font-medium rounded-lg hover:bg-[#26A69A] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200"
            >
              Explore Content
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
