import React, { useState, useRef, useEffect } from "react";
import "../styles/createPost.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhotoFilm,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

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

  const [isCompressing, setCompressionState] = useState(false);

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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      if (file.type.startsWith("video/")) {
        setCompressionState(true);
        document.body.style.overflow = "hidden";

        const formData = new FormData();
        formData.append("video", file);

        try {
          const response = await fetch(
            "http://localhost:5000/api/posts/compress-video",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: formData,
            }
          );

          if (!response.ok) throw new Error("Video compression failed");

          const data = await response.json();

          const blobData = await (async () => {
            const response = await fetch(data.url);
            return await response.blob();
          })();

          setMediaFiles((prev) => [
            ...prev,
            new File([blobData], "compressed-video.webm", {
              type: "video/webm",
            }),
          ]);

          setMediaPreviews((prev) => [...prev, data.url]);
        } catch (error) {
          console.error("Error compressing video:", error);
          alert("Failed to process video");
        } finally {
          setCompressionState(false);
          document.body.style.overflow = "auto";
        }
      } else {
        // Handle images as before
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
        setMediaFiles((prev) => [...prev, file]);
      }
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));

    // Reset the file input value when removing media
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  // Add handler for drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("dragover");

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Add handler for paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files = items
      .filter(
        (item) =>
          item.type.startsWith("image/") || item.type.startsWith("video/")
      )
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // Common function to handle files
  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const maxImageSize = 10 * 1024 * 1024; // 10MB
      const maxVideoSize = 200 * 1024 * 1024; // 200MB

      return (
        (isImage && file.size <= maxImageSize) ||
        (isVideo && file.size <= maxVideoSize)
      );
    });

    if (validFiles.length !== files.length) {
      alert(
        "Some files were skipped. Images must be under 10MB and videos under 200MB."
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

  return (
    <div
      className="create-post"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <form onSubmit={handleSubmit}>
        <div
          ref={editorRef}
          contentEditable
          className="content-editable"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          data-placeholder="What's on your mind?"
          role="textbox"
          aria-multiline="true"
        />
        {isCompressing && (
          <div className="compressing-container">
            <p>Compressing your files, please wait...</p>
            <FontAwesomeIcon className="animate-spin" icon={faSpinner} />
          </div>
        )}
        {mediaPreviews.length > 0 && !isCompressing && (
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
                  disabled={isCompressing}
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
            disabled={isCompressing}
          />
          <button
            type="button"
            className={`media-button`}
            onClick={() => fileInputRef.current?.click()}
            title="Add photos or videos"
            disabled={isCompressing}
          >
            <FontAwesomeIcon icon={faPhotoFilm} />
          </button>
          <button
            className={`post-button`}
            type="submit"
            disabled={
              isSubmitting ||
              isCompressing ||
              (content.replace(/<br\s*\/?>/g, "").trim() === "" &&
                mediaFiles.length === 0)
            }
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
      {isCompressing && <div className="compressing-overlay" />}
    </div>
  );
};

export default CreatePost;
