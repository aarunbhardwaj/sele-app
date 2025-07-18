import React from "react";
import { Text, View } from "react-native";
import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className, ...props }: CardProps) => (
  <View
    className={cn(
      "rounded-lg border border-border bg-card shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </View>
);

const CardHeader = ({ children, className, ...props }: CardProps) => (
  <View
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    {children}
  </View>
);

const CardTitle = ({ children, className, ...props }: CardProps) => (
  <Text
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </Text>
);

const CardDescription = ({ children, className, ...props }: CardProps) => (
  <Text
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </Text>
);

const CardContent = ({ children, className, ...props }: CardProps) => (
  <View className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </View>
);

const CardFooter = ({ children, className, ...props }: CardProps) => (
  <View
    className={cn("flex flex-row items-center p-6 pt-0", className)}
    {...props}
  >
    {children}
  </View>
);

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
