import React from "react";
import { cn } from "../../lib/utils";

const Label = ({ className, ...props }) => (
  <label className={cn("text-sm font-medium text-gray-700", className)} {...props} />
);

export { Label };
