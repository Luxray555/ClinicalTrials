import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Adjust import to your Input component
import { Button } from "../ui/button";

// Define the shape of a Location object
interface Location {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  facility: string;
}

interface LocationsInputProps {
  field: {
    value: Location[];
    onChange: (value: Location[]) => void;
  };
}

export function LocationsInput({ field }: LocationsInputProps) {
  const [newLocation, setNewLocation] = useState<Location>({
    country: "",
    city: "",
    latitude: 0,
    longitude: 0,
    facility: "",
  });

  const [isAdding, setIsAdding] = useState(false);

  const addLocation = () => {
    if (
      newLocation.country.trim() === "" ||
      newLocation.city.trim() === "" ||
      newLocation.facility.trim() === ""
    ) {
      setIsAdding(false);
      return;
    }

    field.onChange([...field.value, newLocation]);
    setNewLocation({
      country: "",
      city: "",
      latitude: 0,
      longitude: 0,
      facility: "",
    });
    setIsAdding(false);
  };

  const removeLocation = (index: number) => {
    const updated = field.value.filter((_, i) => i !== index);
    field.onChange(updated);
  };

  return (
    <div>
      {/* Display added locations as chips with just the index shown */}
      <div className="mb-2 flex flex-wrap gap-2">
        {field.value.map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded-md border px-4 py-2"
          >
            <span className="font-bold">Location {index + 1}</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-fit p-2 text-xs"
              onClick={() => removeLocation(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Button to show the new location form */}
      {!isAdding && (
        <Button onClick={() => setIsAdding(true)}>Add Location</Button>
      )}

      {/* New Location Form */}
      {isAdding && (
        <div className="rounded-md border p-4">
          <div className="mb-2 font-bold">New Location Details</div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Country"
              value={newLocation.country}
              onChange={(e) =>
                setNewLocation({ ...newLocation, country: e.target.value })
              }
            />
            <Input
              placeholder="City"
              value={newLocation.city}
              onChange={(e) =>
                setNewLocation({ ...newLocation, city: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Latitude"
              value={newLocation.latitude}
              onChange={(e) =>
                setNewLocation({
                  ...newLocation,
                  latitude: Number(e.target.value),
                })
              }
            />
            <Input
              type="number"
              placeholder="Longitude"
              value={newLocation.longitude}
              onChange={(e) =>
                setNewLocation({
                  ...newLocation,
                  longitude: Number(e.target.value),
                })
              }
            />
            <Input
              placeholder="Facility"
              className="col-span-2"
              value={newLocation.facility}
              onChange={(e) =>
                setNewLocation({ ...newLocation, facility: e.target.value })
              }
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={addLocation}>Save Location</Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                // Optionally, reset newLocation here as well
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
