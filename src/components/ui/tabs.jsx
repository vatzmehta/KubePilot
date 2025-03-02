import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

const Tabs = ({ children, ...props }) => (
  <TabsPrimitive.Root className="w-full" {...props}>
    {children}
  </TabsPrimitive.Root>
);

const TabsList = ({ children, ...props }) => (
  <TabsPrimitive.List className="flex border-b" {...props}>
    {children}
  </TabsPrimitive.List>
);

const TabsTrigger = ({ children, ...props }) => (
  <TabsPrimitive.Trigger className="p-2 border-b-2 border-transparent hover:border-black" {...props}>
    {children}
  </TabsPrimitive.Trigger>
);

const TabsContent = ({ children, ...props }) => (
  <TabsPrimitive.Content className="p-4" {...props}>
    {children}
  </TabsPrimitive.Content>
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
