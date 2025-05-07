import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const HOST = import.meta.env.VITE_HOST
export default function EditDeletePost({ post, allUsers, onUpdate, onDelete, setError }) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: post.title,
    caption: post.caption || "",
    location: post.location || "",
    people: post.people
      ? post.people.map((person) => ({
          value: person._id,
          label: person.username,
        }))
      : [],
  });
  const [locationSearch, setLocationSearch] = useState(""); 
  const [locationOptions, setLocationOptions] = useState([]); 

  const token = localStorage.getItem("token");

  
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
  }, [locationSearch, setError]);

  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleEditPeopleChange = (selectedOptions) => {
    setEditForm((prev) => ({
      ...prev,
      people: selectedOptions || [],
    }));
  };

  
  const handleLocationChange = (selectedOption) => {
    setEditForm((prev) => ({
      ...prev,
      location: selectedOption ? selectedOption.value : "",
    }));
  };

  
  const handleLocationInputChange = (inputValue) => {
    setLocationSearch(inputValue);
  };

  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedForm = {
        ...editForm,
        people: editForm.people.length > 0 ? editForm.people.map((person) => person.value).join(",") : "",
      };

      const response = await axios.put(
        `${HOST}/api/user/posts/${post._id}`,
        updatedForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Updated Post Response:", response.data.post); 
      onUpdate(response.data.post); 
      setEditing(false); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post. Please try again.");
    }
  };

  
  const handleDeleteClick = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${HOST}/api/user/posts/${post._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onDelete(post._id); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete post. Please try again.");
    }
  };

  
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#121212",
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
      backgroundColor: "#121212",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#2DD4BF" : "#121212",
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
    <>
      {/* Edit and Delete Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => setEditing(true)}
          className="text-white bg-[#2DD4BF] hover:bg-[#26A69A] px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Edit
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-white bg-[#F87171] hover:bg-[#EF4444] px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Delete
        </button>
      </div>

      {/* Edit Post Modal/Form */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Post</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[#D1D5DB] text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-[#121212] text-[#D1D5DB] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#D1D5DB] text-sm font-medium mb-1">Caption</label>
                <textarea
                  name="caption"
                  value={editForm.caption}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-[#121212] text-[#D1D5DB] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-[#D1D5DB] text-sm font-medium mb-1">Location</label>
                <Select
                  options={locationOptions}
                  onInputChange={handleLocationInputChange}
                  onChange={handleLocationChange}
                  value={
                    editForm.location
                      ? { value: editForm.location, label: editForm.location }
                      : null
                  }
                  placeholder="Search for a location..."
                  isClearable
                  styles={customSelectStyles}
                  noOptionsMessage={() => "Type to search for a location..."}
                />
              </div>
              <div>
                <label className="block text-[#D1D5DB] text-sm font-medium mb-1">People (Optional)</label>
                <Select
                  options={allUsers}
                  value={editForm.people}
                  onChange={handleEditPeopleChange}
                  isMulti
                  placeholder="Select people (optional)..."
                  styles={customSelectStyles}
                  noOptionsMessage={() => "No users found"}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="text-white bg-[#2DD4BF] hover:bg-[#26A69A] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-white bg-[#4B5563] hover:bg-[#6B7280] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
