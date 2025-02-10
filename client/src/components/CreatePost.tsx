import React, { useState, useRef, useEffect } from "react";
import "../styles/createPost.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoFilm, faXmark } from "@fortawesome/free-solid-svg-icons";

interface CreatePostProps {
  onSubmit: (content: string, media?: File[]) => Promise<void>;
}

const CreatePost: React.FC<CreatePostProps> = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, mediaFiles);
      setContent("");
      setMediaFiles([]);
      setMediaPreviews([]);
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        (file.type.startsWith("image/") || file.type.startsWith("video/")) &&
        file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length !== files.length) {
      alert(
        "Some files were skipped. Only images and videos under 5MB are allowed."
      );
    }

    setMediaFiles((prev) => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerHTML;
      const isEmpty = !text || text.replace(/<br\s*\/?>/g, "").trim() === "";

      if (isEmpty) {
        editorRef.current.innerHTML = "";
      }
      setContent(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      mediaPreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [mediaPreviews]);

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <div
          ref={editorRef}
          contentEditable
          className="content-editable"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder="What's on your mind?"
          role="textbox"
          aria-multiline="true"
        />

        {mediaPreviews.length > 0 && (
          <div className="media-previews">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="media-preview">
                {preview.startsWith("data:image") ? (
                  <img src={preview} alt="Preview" />
                ) : (
                  <video src={preview} controls />
                )}
                <button
                  type="button"
                  className="remove-media"
                  onClick={() => removeMedia(index)}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="post-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaUpload}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="media-button"
            onClick={() => fileInputRef.current?.click()}
            title="Add photos or videos"
          >
            <FontAwesomeIcon icon={faPhotoFilm} />
          </button>
          <button
            className="post-button"
            type="submit"
            disabled={
              isSubmitting ||
              (content.replace(/<br\s*\/?>/g, "").trim() === "" &&
                mediaFiles.length === 0)
            }
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
