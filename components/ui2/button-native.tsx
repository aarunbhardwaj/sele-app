import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent underline",
      },
      size: {
        default: "py-3 px-5 h-12", // Increased from py-2 px-4 h-10
        sm: "py-2 px-4 h-10 rounded-md", // Increased from py-1 px-3 h-8
        lg: "py-4 px-10 h-14 rounded-md", // Increased from py-3 px-8 h-12
        xl: "py-5 px-12 h-16 rounded-lg", // New extra large size
        icon: "p-3 h-12 w-12", // Increased from p-2 h-10 w-10
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const textVariants = cva("font-medium text-center", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "text-base", // Increased from text-sm
      sm: "text-sm", // Increased from text-xs
      lg: "text-lg", // Increased from text-base
      xl: "text-xl font-semibold", // New size for xl buttons
      icon: "text-base", // Increased from text-sm
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  onPress?: () => void;
  disabled?: boolean;
}

const Button = ({
  children,
  className,
  textClassName,
  variant,
  size,
  onPress,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size, className }),
        disabled && "opacity-50"
      )}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn(textVariants({ variant, size }), textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

export { Button, buttonVariants };
