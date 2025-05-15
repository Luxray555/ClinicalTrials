import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export interface Collaborator {
  name: string;
}

interface CollaboratorsInputProps {
  field: {
    value: Collaborator[];
    onChange: (value: Collaborator[]) => void;
  };
}

export function CollaboratorsInput({ field }: CollaboratorsInputProps) {
  const [inputValue, setInputValue] = useState<string>("");

  const addCollaborator = () => {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue &&
      !field.value.some((collaborator) => collaborator.name === trimmedValue)
    ) {
      field.onChange([...field.value, { name: trimmedValue }]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCollaborator();
    }
  };

  const removeCollaborator = (name: string) => {
    field.onChange(
      field.value.filter((collaborator) => collaborator.name !== name),
    );
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {field.value.map((collaborator, index) => (
          <span
            key={index}
            className="flex items-center rounded border bg-primary/5 px-2 py-1"
          >
            {collaborator.name}
            <button
              type="button"
              onClick={() => removeCollaborator(collaborator.name)}
              className="ml-1 text-primary"
            >
              x
            </button>
          </span>
        ))}
      </div>

      <Input
        placeholder="Type a collaborator and press enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
