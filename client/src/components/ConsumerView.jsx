import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import RatingComment from "../components/RatingComment";

     const HOST = import.meta.env.VITE_HOST; 
export default function ConsumerView() {
  const [content, setContent] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const token = localStorage.getItem("token");
  const isCreator = user?.roles?.creator === true;
  const userId = user?._id;
    
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError("");

        let fetchedContent;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        if (searchTerm.trim()) {
          setIsSearching(true);
          const response = await axios.get(
            `${HOST}/api/creator/content/search`, 
            {
              params: { title: searchTerm },
              ...config,
            }
          );
          fetchedContent = response.data;
        } else {
          setIsSearching(false);
          const response = await axios.get(
            `${HOST}/api/creator/content`, 
            config
          );
          fetchedContent = response.data;
        }


        if (isCreator && userId) {
          fetchedContent = fetchedContent.filter((item) => {
            const isOwnPost = item.creator._id !== userId;
            return isOwnPost;
          });
        }

        setContent(fetchedContent);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [isCreator, userId, token, searchTerm]);

  const isImage = (url) => {
    return url.includes("/image/upload");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-[#121212] to-[#1A1A1A] p-2 sm:p-4 lg:p-6">
      <div className="max-w-full sm:max-w-2xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            Explore Content
          </h1>
          <p className="mt-2 sm:mt-3 text-base sm:text-lg text-[#D1D5DB] drop-shadow-sm">
            Discover photos and videos shared by creators.
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="      Search posts by title..."
              className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#4B5563] rounded-lg shadow-sm placeholder-[#6B7280] text-white focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-[#2DD4BF] transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#D1D5DB] hover:text-[#F87171] transition-colors duration-200"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]">
              🔍
            </span>
          </div>
        </div>

        {loading && (
          <div className="text-center text-[#D1D5DB]">
            <p>{isSearching ? "Searching..." : "Loading content..."}</p>
          </div>
        )}

        {error && (
          <div
            className="bg-[#F87171]/20 border border-[#F87171] text-[#F87171] px-4 py-3 rounded-xl text-center mx-auto max-w-full sm:max-w-2xl backdrop-blur-sm"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && content.length > 0 ? (
          <div className="space-y-8 sm:space-y-10">
            {content.map((item) => (
              <div
                key={item._id}
                className="bg-[#1A1A1A] rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-4 sm:p-5 border-b border-[#4B5563]/50 flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4B5563] rounded-full flex items-center justify-center text-white font-semibold">
                    {item.creator.username.charAt(0).toUpperCase()}
                  </div>
                  <Link to={`/profile/${item.creator._id}`}>
                    <p className="text-sm sm:text-base font-semibold text-white drop-shadow-sm hover:text-[#00C4B4] transition-colors duration-200">
                      {item.creator.username}
                    </p>
                  </Link>
                </div>

                <div className="relative w-full aspect-square border-2 border-[#4B5563]/50 rounded-lg overflow-hidden">
                  {isImage(item.mediaUrl) ? (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.mediaUrl}
                      controls
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  )}
                  <div className="absolute bottom-2 right-2 bg-[#121212]/80 backdrop-blur-sm text-[#D1D5DB] text-xs sm:text-sm px-2 py-1 rounded-md">
                    {new Date(item.uploadDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {item.people && item.people.length > 0 && (
                      <div className="inline-flex items-center bg-[#4B5563]/50 text-[#D1D5DB] text-xs sm:text-sm px-3 py-1 rounded-full">
                        <span className="mr-1 text-[#00C4B4]">👥</span>
                        <div className="flex flex-wrap gap-1">
                          {item.people.map((person, index) => (
                            <span key={person._id}>
                              <Link
                                to={`/profile/${person._id}`}
                                className="text-[#D1D5DB] hover:text-[#00C4B4] transition-colors duration-200"
                              >
                                {person.username || "Unknown"}
                              </Link>
                              {index < item.people.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.location && (
                      <div className="inline-flex items-center bg-[#4B5563]/50 text-[#D1D5DB] text-xs sm:text-sm px-3 py-1 rounded-full">
                        <span className="mr-1 text-[#00C4B4]">📍</span> {item.location}
                      </div>
                    )}
                  </div>

                  <div className="text-center bg-[#121212]/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg">
                    <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-md">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-sm sm:text-base text-[#D1D5DB] mt-1 sm:mt-2">{item.caption}</p>
                    )}
                  </div>

                  <RatingComment postId={item._id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="text-center text-[#D1D5DB]">
              <p>
                {isSearching
                  ? "No matching posts found."
                  : "No content available to display."}
              </p>
              {isCreator ? (
                <p>
                  <Link
                    to="/creator"
                    className="font-medium text-[#00C4B4] hover:text-[#00A89A] transition-colors duration-200"
                  >
                    Upload your post!
                  </Link>
                </p>
              ) : (
                <p>
                  Check back later for more content, or{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-[#00C4B4] hover:text-[#00A89A] transition-colors duration-200"
                  >
                    sign up
                  </Link>{" "}
                  to start sharing!
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
