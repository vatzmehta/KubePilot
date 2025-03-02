import React from "react";
import { cn } from "../../lib/utils";

const Input = ({ className, ...props }) => {
  return (
    <input className={cn("px-3 py-2 border rounded-md focus:outline-none focus:ring-2", className)} {...props} />
  );
};

export { Input };
