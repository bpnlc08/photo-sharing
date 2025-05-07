import { useState, useEffect } from "react";
import axios from "axios";


const HOST = import.meta.env.VITE_HOST
export default function ViewRatingsComments({ postId }) {
  const [averageRating, setAverageRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalComments: 0 });
  const [showComments, setShowComments] = useState(false);

  const token = localStorage.getItem("token");

  const fetchRatingsAndComments = async (page = 1) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(
        `${HOST}/api/ratings-comments/${postId}?page=${page}&limit=5`,
        config
      );
      const { averageRating, ratingsCount, comments, pagination } = response.data;
      setAverageRating(averageRating);
      setRatingsCount(ratingsCount);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center space-x-4">
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
