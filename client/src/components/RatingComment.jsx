import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const HOST = import.meta.env.VITE_HOST
export default function RatingComment({ postId }) {
  const [averageRating, setAverageRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalComments: 0 });

  const token = localStorage.getItem("token");
  const loggedInUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const navigate = useNavigate();

  const fetchRatingsAndComments = async (page = 1) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(
        `${HOST}/api/ratings-comments/${postId}?page=${page}&limit=5`, 
        config
      );
      const { averageRating, ratingsCount, userRating, comments, pagination } = response.data;
      setAverageRating(averageRating);
      setRatingsCount(ratingsCount);
      setUserRating(userRating);
      setComments(comments);
      setPagination(pagination);
    } catch (err) {
      console.error("Error fetching ratings and comments:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch ratings and comments.");
    }
  };

  useEffect(() => {
    fetchRatingsAndComments(currentPage);
  }, [postId, currentPage]);

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError("Session expired or invalid token. Please log in again.");
      navigate("/login");
    } else {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  const handleRating = async (rating) => {
    if (!token) {
      setError("Please log in to rate this content.");
      navigate("/login");
      return;
    }

    try {
      console.log("Submitting rating with token:", token);
      const response = await axios.post(
        `${HOST}/api/rating`,
        { contentId: postId, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Rating submission response:", response.data);
      await fetchRatingsAndComments(currentPage);
      setShowComments(true);
    } catch (err) {
      console.error("Error submitting rating:", err.response?.data || err.message);
      handleAuthError(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Please log in to comment on this content.");
      navigate("/login");
      return;
    }

    if (!newComment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    try {
      console.log("Submitting comment with token:", token);
      const response = await axios.post(
        `${HOST}/api/comment`,
        { contentId: postId, commentText: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Comment submission response:", response.data);
      setNewComment(""); 
      setUserRating(null); 
      await fetchRatingsAndComments(currentPage);
    } catch (err) {
      console.error("Error submitting comment:", err.response?.data || err.message);
      handleAuthError(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) {
      setError("Please log in to delete a comment.");
      navigate("/login");
      return;
    }

    try {
      console.log("Deleting comment with token:", token);
      const response = await axios.delete(`${HOST}/api/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Delete comment response:", response.data);
      await fetchRatingsAndComments(currentPage);
    } catch (err) {
      console.error("Error deleting comment:", err.response?.data || err.message);
      handleAuthError(err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-3">
      {/* Rating Section */}
      <div className="flex justify-between items-center space-x-4">
        {/* User's Rating */}
        <div className="flex items-center space-x-2">
          <span className="text-[#D1D5DB] text-sm font-medium">
            {token ? "Your Rating:" : "Log in to rate:"}
          </span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                onClick={() => token && handleRating(star)}
                className={`w-6 h-6 ${
                  token ? "cursor-pointer" : "cursor-not-allowed"
                } ${
                  userRating && star <= userRating ? "text-yellow-400" : "text-gray-400"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[#D1D5DB] text-sm font-medium">Average:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-6 h-6 ${
                  star <= averageRating ? "text-yellow-400" : "text-gray-400"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[#D1D5DB] text-sm">
            ({averageRating} from {ratingsCount} ratings)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[#2DD4BF] hover:text-[#26A69A] text-sm font-medium transition-colors duration-200"
          >
            💬 {pagination.totalComments} {pagination.totalComments === 1 ? "Comment" : "Comments"}
          </button>
        </div>

        {showComments && (
          <div className="space-y-3">
            <form onSubmit={handleCommentSubmit} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 bg-[#121212] text-[#D1D5DB] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                maxLength={500}
              />
              <button
                type="submit"
                className="text-white bg-[#2DD4BF] hover:bg-[#26A69A] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Post
              </button>
            </form>

            {comments.length > 0 ? (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-[#1A1A1A] p-3 rounded-md flex justify-between items-start"
                  >
                    <div>
                      <p className="text-[#D1D5DB] text-sm">
                        <span className="font-medium text-[#00C4B4]">
                          {comment.user.username}
                          {comment.userRating && (
                            <span className="ml-2 text-yellow-400">
                              ({comment.userRating} ★)
                            </span>
                          )}
                        </span>{" "}
                        {comment.commentText}
                      </p>
                      <p className="text-[#6B7280] text-xs">
                        {new Date(comment.date).toLocaleDateString()}
                      </p>
                    </div>
                    {loggedInUser?._id === comment.user._id.toString() && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-[#F87171] hover:text-[#EF4444] text-sm transition-colors duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-3">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="text-[#D1D5DB] hover:text-[#2DD4BF] disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-[#D1D5DB]">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="text-[#D1D5DB] hover:text-[#2DD4BF] disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[#D1D5DB] text-sm">No comments yet.</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-[#F87171]/20 border border-[#F87171] text-[#F87171] px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
