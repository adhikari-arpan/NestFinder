import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { AppContext } from "../Context/AppContext";
import { LoadingScreen } from "./ui/LoadingScreen";
import { ModalLogo } from "./ui/ModalLogo";
import { getCroppedImageBlob } from "../utils/cropImage";
import { Image as ImageIcon, X, Save } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

// Two-step "Update Profile Picture" flow: pick a photo, then crop it inside
// a circular preview (react-easy-crop) showing exactly how it'll display.
// Saving crops to a fixed-size JPEG and hands it to AppContext.updateAvatar.
export const AvatarPictureModal = ({ onClose }) => {
  const { updateAvatar } = useContext(AppContext);
  const inputRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, or WEBP images are supported.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image is over ${MAX_SIZE_MB}MB.`);
      return;
    }

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setImageSrc(URL.createObjectURL(file));
  };

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setError("");
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      await updateAvatar(blob);
      onClose();
    } catch (err) {
      console.error("Failed to update profile picture:", err.message);
      setError(err.message || "Could not update your profile picture. Please try again.");
      setSaving(false);
    }
  };

  return createPortal(
    <>
      <div
        onClick={saving ? undefined : onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2001,
          width: "100%",
          maxWidth: "420px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}
      >
        <ModalLogo />

        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[1.2rem] font-extrabold">
            <ImageIcon size={20} className="text-primary" /> Update Profile Picture
          </h3>
          <button
            className="btn btn-ghost p-2"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {saving ? (
          <LoadingScreen label="Saving your profile picture..." fullScreen={false} />
        ) : (
          <div className="flex flex-col gap-4">
            {error && (
              <p style={{ color: "var(--danger, #dc2626)", fontSize: "0.85rem", margin: 0 }}>
                {error}
              </p>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
            />

            {!imageSrc ? (
              <div
                onClick={() => inputRef.current?.click()}
                className="border-border-color hover:border-primary cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
              >
                <ImageIcon size={28} className="text-primary mx-auto mb-2" />
                <p className="text-[0.9rem] font-semibold">Click to choose a photo</p>
                <p className="text-text-muted mt-1 text-[0.75rem]">
                  JPEG, PNG, or WEBP · up to {MAX_SIZE_MB}MB
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "300px",
                    background: "#111",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-[0.75rem]">Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="btn btn-outline self-start text-[0.8rem]"
                >
                  Choose a different photo
                </button>
              </>
            )}

            <div className="mt-2 flex gap-3">
              <button type="button" onClick={onClose} className="btn btn-outline flex-1">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!imageSrc}
                className="btn btn-primary flex flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} /> Save Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
};
