import React from "react";
import { cn } from "../../lib/utils";

const Separator = ({ className, ...props }) => (
  <hr className={cn("border-t border-gray-300 my-2", className)} {...props} />
);

export { Separator };
