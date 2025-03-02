import React from "react";
import { cn } from "../../lib/utils";

const Badge = ({ className, ...props }) => (
  <span className={cn("inline-block bg-blue-500 text-white text-sm px-2 py-1 rounded-full", className)} {...props} />
);

export { Badge };
