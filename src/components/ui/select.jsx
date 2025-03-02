import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "../../lib/utils";

const Select = SelectPrimitive.Root;
const SelectTrigger = ({ className, ...props }) => (
  <SelectPrimitive.Trigger className={cn("p-2 border rounded-md", className)} {...props} />
);
const SelectValue = SelectPrimitive.Value;
const SelectContent = ({ className, ...props }) => (
  <SelectPrimitive.Content className={cn("bg-white shadow-md p-2 rounded-md", className)} {...props} />
);
const SelectItem = ({ className, children, ...props }) => (
  <SelectPrimitive.Item className={cn("cursor-pointer p-2 hover:bg-gray-200", className)} {...props}>
    {children}
  </SelectPrimitive.Item>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
