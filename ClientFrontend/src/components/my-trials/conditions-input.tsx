import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export interface Condition {
  name: string;
}

interface ConditionsInputProps {
  field: {
    value: Condition[];
    onChange: (value: Condition[]) => void;
  };
}

export function ConditionsInput({ field }: ConditionsInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  function addCondition() {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue &&
      !field.value.some((condition) => condition.name === trimmedValue)
    ) {
      field.onChange([...field.value, { name: trimmedValue }]);
      setInputValue("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCondition();
    }
  }

  const removeCondition = (name: string) => {
    field.onChange(field.value.filter((condition) => condition.name !== name));
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {field.value.map((condition, index) => (
          <span
            key={index}
            className="flex items-center rounded border bg-primary/5 px-2 py-1"
          >
            {condition.name}
            <button
              type="button"
              onClick={() => removeCondition(condition.name)}
              className="ml-1 text-primary"
            >
              x
            </button>
          </span>
        ))}
      </div>

      <Input
        placeholder="Type a condition and press enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
