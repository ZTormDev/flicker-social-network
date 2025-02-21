import React, { useState, useEffect } from "react";
import { formatTimeAgo } from "../utils/dateUtils";
import "../styles/commentsBox.scss";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";

import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  User: {
    id: number;
    username: string;
    userImage: string;
  };
}

interface CommentBoxProps {
  postId: number;
}

const CommentBox: React.FC<CommentBoxProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error fetching comments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: newComment,
          post_id: postId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const newCommentData = await response.json();
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error posting comment"
      );
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error deleting comment"
      );
    }
  };

  useEffect(() => {
    fetchComments();
    // Actualizar comentarios cada 10 segundos
    const intervalId = setInterval(fetchComments, 10000);
    return () => clearInterval(intervalId);
  }, [postId]);

  if (loading)
    return <div className="comments-loading">Loading comments...</div>;
  if (error) return <div className="comments-error">{error}</div>;

  return (
    <div className="comment-box">
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <img
              src={comment.User.userImage || "/default-avatar.png"}
              alt={comment.User.username}
              className="comment-avatar"
            />
            <div className="comment-content">
              <div className="comment-header">
                <p className="comment-text">
                  <b>{comment.User.username}</b> {comment.content}
                </p>
              </div>
              <div className="comment-footer">
                <span className="comment-time">
                  {formatTimeAgo(comment.created_at)}
                </span>
                <span>10 likes</span>
                <button className="comment-reply">Reply</button>
              </div>
              <button className="like-button">
                <FontAwesomeIcon icon={faHeartRegular} />
              </button>
            </div>
            {comment.User.id ===
              JSON.parse(localStorage.getItem("user") || "{}").id && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="comment-delete"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="comment-input"
          maxLength={500}
        />
        <button type="submit" className="comment-submit">
          Post
        </button>
      </form>
    </div>
  );
};

export default CommentBox;
