"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";

export function FormSelect({
  name,
  options,
  placeholder,
  defaultValue = "",
}: {
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value} required />
    </>
  );
}
