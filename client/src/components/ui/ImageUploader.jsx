// Drop-in image picker for the "post a room" form.
// Controlled component: parent owns the File[] state, this just handles
// the drag/drop UI, validation, compression, and previews.
//
// Usage:
//   const [images, setImages] = useState([]);
//   <ImageUploader files={images} onChange={setImages} />
//   ...later: createListing({ ...formData, images })

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const COMPRESS_MAX_EDGE = 1600; // px, longest side after resize
const COMPRESS_QUALITY = 0.8;

// Resize + re-encode a File as JPEG using a canvas. Skips files that are
// already small enough. Returns a new File (same name, .jpg extension).
async function compressImage(file) {
  if (file.size <= 800 * 1024) return file; // already small, don't bother

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    COMPRESS_MAX_EDGE / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", COMPRESS_QUALITY),
  );

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

export default function ImageUploader({
  files,
  onChange,
  maxFiles = MAX_FILES,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef(null);

  // Object URLs for previews — created per file, revoked on cleanup.
  const previews = useMemo(
    () =>
      files.map((f) => (typeof f === "string" ? f : URL.createObjectURL(f))),
    [files],
  );
  useEffect(() => {
    return () => {
      previews.forEach((u, i) => {
        if (typeof files[i] !== "string") URL.revokeObjectURL(u);
      });
    };
  }, [files, previews]);

  const handleFiles = useCallback(
    async (incoming) => {
      setError("");
      const incomingArr = Array.from(incoming);

      if (files.length + incomingArr.length > maxFiles) {
        setError(`You can upload up to ${maxFiles} photos.`);
        return;
      }

      const valid = [];
      for (const file of incomingArr) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError("Only JPEG, PNG, or WEBP images are supported.");
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`"${file.name}" is over ${MAX_SIZE_MB}MB.`);
          continue;
        }
        valid.push(file);
      }
      if (valid.length === 0) return;

      setCompressing(true);
      try {
        const compressed = await Promise.all(valid.map(compressImage));
        onChange([...files, ...compressed]);
      } finally {
        setCompressing(false);
      }
    },
    [files, maxFiles, onChange],
  );

  const removeAt = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-sm text-gray-600">
          {compressing
            ? "Processing photos…"
            : "Click to browse or drag photos here"}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          JPEG, PNG, or WEBP · up to {MAX_SIZE_MB}MB each · {files.length}/
          {maxFiles} added
        </p>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {previews.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-md"
            >
              <img
                src={url}
                alt={`Room photo ${i + 1}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove photo ${i + 1}`}
              >
                ✕
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
