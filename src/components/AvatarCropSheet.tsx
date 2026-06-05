import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check } from "lucide-react";

type CropArea = { x: number; y: number; width: number; height: number };

async function getCroppedImg(
  imageSrc: string,
  cropArea: CropArea,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 400; // output 400x400px
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        size,
        size,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas kosong"));
            return;
          }
          resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9,
      );
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

export function AvatarCropSheet({
  imageSrc,
  onDone,
  onCancel,
}: {
  imageSrc: string;
  onDone: (file: File) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: any, croppedPixels: CropArea) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  async function handleDone() {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const file = await getCroppedImg(imageSrc, croppedAreaPixels);
      onDone(file);
    } catch (err) {
      console.error("Crop gagal:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "#000" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "#111", zIndex: 10 }}
      >
        <button
          onClick={onCancel}
          className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white"
        >
          <X size={18} />
        </button>
        <p className="text-white text-sm font-semibold">Atur Foto Profil</p>
        <button
          onClick={handleDone}
          disabled={loading}
          className="h-9 w-9 rounded-full bg-gradient-pink flex items-center justify-center text-white shadow-pink disabled:opacity-50"
        >
          {loading ? <span className="text-xs">...</span> : <Check size={18} />}
        </button>
      </div>

      {/* Cropper area */}
      <div className="relative flex-1">
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

      {/* Zoom slider */}
      <div className="px-6 py-4" style={{ background: "#111", zIndex: 10 }}>
        <p className="text-white/60 text-xs text-center mb-2">
          Cubit atau geser untuk zoom
        </p>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full accent-pink-400"
        />
      </div>
    </div>
  );
}
