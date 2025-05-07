import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


const HOST = import.meta.env.VITE_HOST
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; 
    setError("");
    setSuccess("");
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${HOST}/user/signin`, {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess("Login successful! Redirecting to dashboard...");
      
      setFormData({
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-[#1A1A1A] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8 bg-[#2D2D2D] p-6 sm:p-8 rounded-2xl shadow-2xl transition-all duration-300">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Sign In</h1>
          <p className="mt-2 text-sm text-[#D1D5DB]">
            Don’t have an account?{" "}
            <Link to="/signup" className="font-medium text-[#2DD4BF] hover:text-[#26A69A] transition-colors duration-200">
              Sign up
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-[#F87171]/10 border border-[#F87171] text-[#F87171] px-4 py-3 rounded-lg" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#34D399]/10 border border-[#34D399] text-[#34D399] px-4 py-3 rounded-lg" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#D1D5DB]">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 bg-[#1A1A1A] border border-[#4B5563] rounded-lg shadow-sm placeholder-[#6B7280] text-white focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-[#2DD4BF] transition-all duration-200"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#D1D5DB]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 bg-[#1A1A1A] border border-[#4B5563] rounded-lg shadow-sm placeholder-[#6B7280] text-white focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-[#2DD4BF] transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2DD4BF] hover:bg-[#26A69A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2DD4BF] focus:ring-offset-[#2D2D2D] transition-all duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#4B5563]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
