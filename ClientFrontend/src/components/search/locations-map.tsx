"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";

const markerIcon = icon({
  iconUrl: "/marker.png",
  iconSize: [40, 40],
});

type Props = {
  id?: string;
  facility?: string;
  longitude?: number;
  latitude?: number;
  country?: string;
  city?: string;
};

export default function LocationsMap({ locations }: { locations: Props[] }) {
  const defaultCenter: [number, number] = [39.29038, -76.61219];

  const center: [number, number] =
    locations.length > 0 && locations[0].latitude && locations[0].longitude
      ? [locations[0].latitude, locations[0].longitude]
      : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={1}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      fadeAnimation={true}
      markerZoomAnimation={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map(
        (location, index) =>
          location.latitude &&
          location.longitude && (
            <Marker
              key={location.id || index}
              icon={markerIcon}
              position={[location.latitude, location.longitude]}
            >
              <Popup>
                {location.facility || "Unknown Facility"} <br />
                {location.city && `${location.city}, `}
                {location.country}
              </Popup>
            </Marker>
          ),
      )}
    </MapContainer>
  );
}
