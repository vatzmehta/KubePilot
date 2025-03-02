import React from "react";
import { cn } from "../../lib/utils";

const Button = ({ className, ...props }) => {
  return (
    <button className={cn("px-4 py-2 bg-blue-500 text-white rounded", className)} {...props} />
  );
};

export { Button };
