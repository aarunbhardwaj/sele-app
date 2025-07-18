import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FooterOption {
  label: string;
  onPress: () => void;
}

interface FooterProps {
  options: FooterOption[];
  backgroundColor?: string;
}

const Footer: React.FC<FooterProps> = ({ options, backgroundColor }) => (
  <View style={[styles.footer, backgroundColor ? { backgroundColor } : null]}>
    {options.map((option, idx) => (
      <TouchableOpacity key={option.label} onPress={option.onPress} style={styles.option}>
        <Text style={styles.optionText}>{option.label}</Text>
        {idx !== options.length - 1 && <Text style={styles.separator}>|</Text>}
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 8,
    color: '#aaa',
    fontSize: 14,
  },
});

export default Footer;
