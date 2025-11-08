"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useT } from "@/i18n/provider";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadComplete: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
  size?: "sm" | "md" | "lg";
}

export default function AvatarUpload({
  currentAvatarUrl,
  onUploadComplete,
  onUploadError,
  size = "md",
}: AvatarUploadProps) {
  const t = useT();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      onUploadError?.(t("AvatarUpload.invalidFileType"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.(t("AvatarUpload.fileTooLarge"));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Update avatar URL
      onUploadComplete(result.avatarUrl);
      setPreview(null); // Clear preview after successful upload
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError?.(
        error instanceof Error ? error.message : t("AvatarUpload.uploadFailed")
      );
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = preview || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg ${
          dragActive ? "ring-4 ring-blue-500" : ""
        } ${uploading ? "opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Avatar"
            fill
            className="object-cover"
            sizes={
              size === "sm" ? "64px" : size === "md" ? "96px" : "128px"
            }
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg
              className="w-1/2 h-1/2 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}

        {/* Upload Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Edit Button Overlay */}
        {!uploading && (
          <button
            onClick={handleClick}
            className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group"
            disabled={uploading}
          >
            <svg
              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* Upload Button (Alternative to click on avatar) */}
      <button
        onClick={handleClick}
        disabled={uploading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading
          ? t("AvatarUpload.uploading")
          : currentAvatarUrl
          ? t("AvatarUpload.changePhoto")
          : t("AvatarUpload.uploadPhoto")}
      </button>

      {/* Help Text */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
        {t("AvatarUpload.helpText")}
        <br />
        {t("AvatarUpload.dragDropText")}
      </p>
    </div>
  );
}

