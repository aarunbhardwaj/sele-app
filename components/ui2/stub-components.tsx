// Temporary stub file for missing UI components
// This file provides basic replacements for removed Radix UI components

import React from 'react';
import { View, Text } from 'react-native';

// Basic stub components to prevent import errors
export const Button = ({ children, ...props }: any) => (
  <Text {...props}>{children}</Text>
);

export const Card = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const Dialog = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const Input = ({ ...props }: any) => (
  <Text {...props}>Input</Text>
);

export const Select = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const Separator = ({ ...props }: any) => (
  <View {...props} />
);

export const Sheet = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const Tabs = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const Toast = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const Tooltip = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

// Export all as default for compatibility
export default {
  Button,
  Card,
  Dialog,
  Input,
  Select,
  Separator,
  Sheet,
  Tabs,
  Toast,
  Tooltip,
};