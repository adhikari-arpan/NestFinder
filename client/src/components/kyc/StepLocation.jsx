import { ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { stepNavClass } from "./kycStepStyles";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationPicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const StepLocation = ({
  latitude,
  longitude,
  onPick,
  onNext,
  onBack,
}) => {
  const canProceed = latitude && longitude;

  return (
    <div className="card animate-fade-in flex flex-col gap-8 rounded-lg border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">
          Step 3: Pin Your Permanent Address
        </h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          This pin becomes your fixed posting location — every room you list
          will show at this address. Click the map to drop or move the pin.
        </p>
      </div>

      <div>
        <div
          style={{
            height: "350px",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
          }}
        >
          <LeafletMap
            center={[Number(latitude) || 27.7172, Number(longitude) || 85.324]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationPicker onPick={onPick} />
            {latitude && longitude && (
              <Marker position={[Number(latitude), Number(longitude)]} />
            )}
          </LeafletMap>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Latitude</label>
            <input
              type="text"
              value={latitude}
              readOnly
              className="form-input"
              style={{ backgroundColor: "var(--bg-app)" }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Longitude</label>
            <input
              type="text"
              value={longitude}
              readOnly
              className="form-input"
              style={{ backgroundColor: "var(--bg-app)" }}
            />
          </div>
        </div>

        {!canProceed && (
          <p className="mt-3 flex items-center gap-1 text-[0.8rem] text-(--text-light)">
            <MapPin size={14} /> Click on the map to pin your address.
          </p>
        )}
      </div>

      <div className={stepNavClass}>
        <button onClick={onBack} className="btn btn-outline flex gap-1">
          <ChevronLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="btn btn-primary flex gap-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next Step <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
