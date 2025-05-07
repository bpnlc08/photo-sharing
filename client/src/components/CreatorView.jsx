import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";

const HOST =import.meta.env.VITE_HOST;
export default function CreatorView() {
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    location: "",
    people: [],
    media: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]); 
  const [locationOptions, setLocationOptions] = useState([]); 
  const [locationSearch, setLocationSearch] = useState("");

  const token = localStorage.getItem("token");
  const loggedInUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) {
          setError("Please log in to fetch users.");
          return;
        }

        const response = await axios.get(`${HOST}/api/user/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        
        const userOptions = response.data
          .filter((user) => user._id !== loggedInUser?._id)
          .map((user) => ({
            value: user._id,
            label: user.username,
          }));
        setUsers(userOptions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users.");
        console.error(err);
      }
    };

    fetchUsers();
  }, [token, loggedInUser]);

  
  useEffect(() => {
    const fetchLocations = async () => {
      if (!locationSearch) {
        setLocationOptions([]);
        return;
      }

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${locationSearch}&limit=10`
        );
        const locations = response.data.map((place) => ({
          value: place.display_name,
          label: place.display_name,
        }));
        setLocationOptions(locations);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError("Failed to fetch location suggestions.");
      }
    };

    
    const debounce = setTimeout(() => {
      fetchLocations();
    }, 500);

    return () => clearTimeout(debounce); 
  }, [locationSearch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePeopleChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      people: selectedOptions ? selectedOptions.map((option) => option.value) : [],
    }));
  };

  const handleLocationChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      location: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleLocationInputChange = (inputValue) => {
    setLocationSearch(inputValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("caption", formData.caption);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("people", formData.people.join(",")); 
    formDataToSend.append("media", formData.media);

    try {
      if (!token) {
        setError("Please log in to upload content.");
        return;
      }

      const response = await axios.post(
        `${HOST}/creator/upload`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Content uploaded successfully!");
      console.log("Upload response:", response.data);

      
      setFormData({
        title: "",
        caption: "",
        location: "",
        people: [],
        media: null,
      });
      setLocationSearch(""); 
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload content. Please try again.");
      console.log(err);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#1A1A1A",
      borderColor: "#4B5563",
      color: "white",
      padding: "4px",
      borderRadius: "0.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#2DD4BF",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#1A1A1A",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#2DD4BF" : "#1A1A1A",
      color: "white",
      "&:hover": {
        backgroundColor: "#26A69A",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
    input: (provided) => ({
      ...provided,
      color: "white",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#2DD4BF",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "white",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "white",
      "&:hover": {
        backgroundColor: "#EF4444",
        color: "white",
      },
    }),
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-[#1A1A1A] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-8 bg-[#2D2D2D] p-6 sm:p-8 rounded-2xl shadow-2xl transition-all duration-300">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Upload Content</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title - Full Width */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-[#D1D5DB]">
                Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 bg-[#1A1A1A] border border-[#4B5563] rounded-lg shadow-sm placeholder-[#6B7280] text-white focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-[#2DD4BF] transition-all duration-200"
                  placeholder="Enter the title"
                  required
                />
              </div>
            </div>

            {/* Caption - Full Width */}
            <div className="sm:col-span-2">
              <label htmlFor="caption" className="block text-sm font-medium text-[#D1D5DB]">
                Caption
              </label>
              <div className="mt-1">
                <textarea
                  id="caption"
                  name="caption"
                  value={formData.caption}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 bg-[#1A1A1A] border border-[#4B5563] rounded-lg shadow-sm placeholder-[#6B7280] text-white focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-[#2DD4BF] transition-all duration-200"
                  placeholder="Write a caption..."
                  rows="3"
                />
              </div>
            </div>

            {/* Location - Half Width */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[#D1D5DB]">
                Location
              </label>
              <div className="mt-1">
                <Select
                  options={locationOptions}
                  onInputChange={handleLocationInputChange}
                  onChange={handleLocationChange}
                  placeholder="Search for a location..."
                  isClearable
                  styles={customSelectStyles}
                  noOptionsMessage={() => "Type to search for a location..."}
                />
              </div>
            </div>

            {/* People - Half Width */}
            <div>
              <label htmlFor="people" className="block text-sm font-medium text-[#D1D5DB]">
                People
              </label>
              <div className="mt-1">
                <Select
                  options={users}
                  onChange={handlePeopleChange}
                  isMulti
                  placeholder="Select people..."
                  styles={customSelectStyles}
                  noOptionsMessage={() => "No users found"}
                />
              </div>
            </div>

            {/* Media File - Full Width */}
            <div className="sm:col-span-2">
              <label htmlFor="media" className="block text-sm font-medium text-[#D1D5DB]">
                Media File
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  id="media"
                  name="media"
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-[#1A1A1A] border border-[#4B5563] rounded-lg shadow-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2DD4BF] file:text-white hover:file:bg-[#26A69A] transition-all duration-200"
                  accept="image/*,video/*"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2DD4BF] hover:bg-[#26A69A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2DD4BF] focus:ring-offset-[#2D2D2D] transition-all duration-200"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}
