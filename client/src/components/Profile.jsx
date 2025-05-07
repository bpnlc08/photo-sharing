import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import RatingComment from "../components/RatingComment";
import EditDeletePost from "../components/EditDeletePost";
import ViewRatingsComments from "../components/ViewRatingsComments"; 

const HOST = import.meta.env.VITE_HOST
export default function Profile() {
  const { userId } = useParams(); 
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]); 

  const token = localStorage.getItem("token");
  const loggedInUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const isOwnProfile = loggedInUser?._id === userId; 

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${HOST}/api/user/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token]);

  
  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile || !profile.roles.creator) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      try {
        setPostsLoading(true);
        const response = await axios.get(`${HOST}/api/user/posts/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPosts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load posts. Please try again.");
      } finally {
        setPostsLoading(false);
      }
    };

    if (profile) {
      fetchPosts();
    }
  }, [profile, userId, token]);

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
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
        setAllUsers(userOptions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users.");
        console.error(err);
      }
    };

    if (isOwnProfile) {
      fetchUsers();
    }
  }, [isOwnProfile, token, loggedInUser]);

  
  const isImage = (url) => {
    return url.includes("/image/upload");
  };

  
  const handlePostUpdate = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  
  const handlePostDelete = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-[#121212] to-[#1A1A1A] p-2 sm:p-4 lg:p-6">
      <div className="max-w-full sm:max-w-2xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            {profile ? `${profile.username}'s Profile` : "Profile"}
          </h1>
          <p className="mt-2 sm:mt-3 text-base sm:text-lg text-[#D1D5DB] drop-shadow-sm">
            View profile details.
          </p>
        </div>

        {loading && (
          <div className="text-center text-[#D1D5DB]">
            <p>Loading profile...</p>
          </div>
        )}

        {error && (
          <div className="bg-[#F87171]/20 border border-[#F87171] text-[#F87171] px-4 py-3 rounded-xl text-center mx-auto max-w-full sm:max-w-2xl backdrop-blur-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-[#1A1A1A] rounded-2xl shadow-xl p-4 sm:p-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                {profile.username}
              </h2>
              <p className="text-sm sm:text-base text-[#D1D5DB] mt-2">{profile.email}</p>
            </div>

            <div className="bg-[#1A1A1A] rounded-2xl shadow-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white drop-shadow-sm mb-3">
                Stats
              </h3>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                <div className="flex-1 bg-[#121212]/80 backdrop-blur-sm p-3 rounded-lg text-center">
                  <p className="text-sm sm:text-base text-[#D1D5DB]">
                    <span className="font-medium text-[#00C4B4]">Joined:</span>{" "}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-1 bg-[#121212]/80 backdrop-blur-sm p-3 rounded-lg text-center">
                  <p className="text-sm sm:text-base text-[#D1D5DB]">
                    <span className="font-medium text-[#00C4B4]">Role:</span>{" "}
                    {profile.roles.creator ? "Creator" : "Consumer"}
                  </p>
                </div>
              </div>
            </div>

            {profile.roles.creator && (
              <div className="bg-[#1A1A1A] rounded-2xl shadow-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white drop-shadow-sm mb-4">
                  Posts
                </h3>
                {postsLoading ? (
                  <div className="text-center text-[#D1D5DB]">
                    <p>Loading posts...</p>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="bg-[#121212]/80 backdrop-blur-sm rounded-lg p-4 space-y-3"
                      >
                        <div className="relative w-full aspect-square border-2 border-[#4B5563]/50 rounded-lg overflow-hidden">
                          {isImage(post.mediaUrl) ? (
                            <img
                              src={post.mediaUrl}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <video
                              src={post.mediaUrl}
                              controls
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          )}
                          <div className="absolute bottom-2 right-2 bg-[#121212]/80 backdrop-blur-sm text-[#D1D5DB] text-xs sm:text-sm feat px-2 py-1 rounded-md">
                            {new Date(post.uploadDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-base sm:text-lg font-bold text-white drop-shadow-md">
                            {post.title}
                          </h4>
                          {post.caption && (
                            <p className="text-sm sm:text-base text-[#D1D5DB]">{post.caption}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {post.people && post.people.length > 0 && (
                              <div className="inline-flex items-center bg-[#4B5563]/50 text-[#D1D5DB] text-xs sm:text-sm px-3 py-1 rounded-full">
                                <span className="mr-1 text-[#00C4B4]">👥</span>
                                <div className="flex flex-wrap gap-1">
                                  {post.people.map((person, index) => (
                                    <span key={person._id}>
                                      <Link
                                        to={`/profile/${person._id}`}
                                        className="text-[#D1D5DB] hover:text-[#00C4B4] transition-colors duration-200"
                                      >
                                        {person.username || "Unknown"}
                                      </Link>
                                      {index < post.people.length - 1 && ", "}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {post.location && (
                              <div className="inline-flex items-center bg-[#4B5563]/50 text-[#D1D5DB] text-xs sm:text-sm px-3 py-1 rounded-full">
                                <span className="mr-1 text-[#00C4B4]">📍</span> {post.location}
                              </div>
                            )}
                          </div>
                        </div>

                        {isOwnProfile ? (
                          <div className="space-y-3">
                            <EditDeletePost
                              post={post}
                              allUsers={allUsers}
                              onUpdate={handlePostUpdate}
                              onDelete={handlePostDelete}
                              setError={setError}
                            />
                            <ViewRatingsComments postId={post._id} />
                          </div>
                        ) : (
                          <RatingComment postId={post._id} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-[#D1D5DB]">
                    <p>No posts yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
