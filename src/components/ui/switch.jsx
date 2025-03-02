import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

const Switch = ({ className, ...props }) => (
  <SwitchPrimitive.Root className={cn("relative w-10 h-6 bg-gray-300 rounded-full", className)} {...props}>
    <SwitchPrimitive.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform transform translate-x-1" />
  </SwitchPrimitive.Root>
);

export { Switch };
