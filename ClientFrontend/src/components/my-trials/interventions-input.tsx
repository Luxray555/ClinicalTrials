"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface Intervention {
  name: string;
  description: string;
  type:
    | "DEVICE"
    | "DRUG"
    | "OTHER"
    | "DIAGNOSTIC_TEST"
    | "BIOLOGICAL"
    | "PROCEDURE"
    | "BEHAVIORAL"
    | "DIETARY_SUPPLEMENT"
    | "COMBINATION_PRODUCT"
    | "RADIATION"
    | "GENETIC";
}

interface InterventionsInputProps {
  field: {
    value: Intervention[];
    onChange: (value: Intervention[]) => void;
  };
}

export function InterventionsInput({ field }: InterventionsInputProps) {
  const [newIntervention, setNewIntervention] = useState<Intervention>({
    name: "",
    description: "",
    type: "DEVICE",
  });

  const [isAdding, setIsAdding] = useState(false);

  const addIntervention = () => {
    if (
      newIntervention.name.trim() === "" ||
      newIntervention.description.trim() === ""
    ) {
      setIsAdding(false);
      return;
    }

    field.onChange([...field.value, newIntervention]);
    setNewIntervention({ name: "", description: "", type: "DEVICE" });
    setIsAdding(false);
  };

  const removeIntervention = (index: number) => {
    const updated = field.value.filter((_, i) => i !== index);
    field.onChange(updated);
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {field.value.map((intervention, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded-md border px-4 py-2"
          >
            <span className="font-bold">{intervention.name}</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-fit p-2 text-xs"
              onClick={() => removeIntervention(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {!isAdding && (
        <Button onClick={() => setIsAdding(true)}>Add Intervention</Button>
      )}

      {isAdding && (
        <div className="rounded-md border p-4">
          <div className="mb-2 font-bold">New Intervention Details</div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Name"
              value={newIntervention.name}
              onChange={(e) =>
                setNewIntervention({ ...newIntervention, name: e.target.value })
              }
            />
            <Select
              onValueChange={(value) =>
                setNewIntervention({
                  ...newIntervention,
                  type: value as Intervention["type"],
                })
              }
              defaultValue={newIntervention.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEVICE">Device</SelectItem>
                <SelectItem value="DRUG">Drug</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
                <SelectItem value="DIAGNOSTIC_TEST">Diagnostic Test</SelectItem>
                <SelectItem value="BIOLOGICAL">Biological</SelectItem>
                <SelectItem value="PROCEDURE">Procedure</SelectItem>
                <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                <SelectItem value="DIETARY_SUPPLEMENT">
                  Dietary Supplement
                </SelectItem>
                <SelectItem value="COMBINATION_PRODUCT">
                  Combination Product
                </SelectItem>
                <SelectItem value="RADIATION">Radiation</SelectItem>
                <SelectItem value="GENETIC">Genetic</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Description"
              className="col-span-2"
              value={newIntervention.description}
              onChange={(e) =>
                setNewIntervention({
                  ...newIntervention,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={addIntervention}>Save Intervention</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
