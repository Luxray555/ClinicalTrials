"use client";

import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

type Props = {
  minAge: number[];
  maxAge: number[];
  handleSliderChange: (key: "minAge" | "maxAge") => (value: number[]) => void;
};

export default function AgeFilter({
  minAge,
  maxAge,
  handleSliderChange,
}: Props) {
  return (
    <div className="flex flex-col items-start justify-center gap-2">
      <label className="font-bold text-primary">Age</label>
      <div className="flex w-full flex-col gap-2 pl-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Min Age : <strong>{minAge}</strong>
          </p>
          <div className="flex items-center gap-2">
            <Button
              className="aspect-square h-6 p-0"
              onClick={() =>
                minAge[0] > 0 && handleSliderChange("minAge")([minAge[0] - 1])
              }
            >
              -
            </Button>
            <Slider
              value={minAge}
              max={100}
              step={1}
              onValueChange={handleSliderChange("minAge")}
            />
            <Button
              className="aspect-square h-6 p-0"
              onClick={() =>
                minAge[0] < 100 && handleSliderChange("minAge")([minAge[0] + 1])
              }
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Max Age : <strong>{maxAge}</strong>
          </p>
          <div className="flex items-center gap-2">
            <Button
              className="aspect-square h-6 p-0"
              onClick={() =>
                maxAge[0] > 0 && handleSliderChange("maxAge")([maxAge[0] - 1])
              }
            >
              -
            </Button>
            <Slider
              value={maxAge}
              max={100}
              step={1}
              onValueChange={handleSliderChange("maxAge")}
            />
            <Button
              className="aspect-square h-6 p-0"
              onClick={() =>
                maxAge[0] < 100 && handleSliderChange("maxAge")([maxAge[0] + 1])
              }
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
