import React from "react";
import { cn } from "../../lib/utils";

const Card = ({ className, ...props }) => (
  <div className={cn("bg-white shadow-md rounded-lg p-4", className)} {...props} />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn("border-b pb-2 mb-2", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-gray-600", className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-2", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
