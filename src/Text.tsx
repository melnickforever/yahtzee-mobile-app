import React from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  Animated,
  StyleSheet,
} from 'react-native';
import type { TextProps, TextInputProps, TextStyle } from 'react-native';
import type { ComponentProps } from 'react';

function lexendFamily(weight?: TextStyle['fontWeight']): string {
  switch (weight) {
    case '500': return 'Lexend_500Medium';
    case '600': return 'Lexend_600SemiBold';
    case '700': case 'bold': return 'Lexend_700Bold';
    case '800': return 'Lexend_800ExtraBold';
    case '900': return 'Lexend_900Black';
    default:    return 'Lexend_400Regular';
  }
}

function resolveStyle(style: TextProps['style']): TextStyle {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const { fontWeight, fontFamily, ...rest } = flat;
  return { ...rest, fontFamily: fontFamily ?? lexendFamily(fontWeight) };
}

export function Text({ style, ...props }: TextProps) {
  return <RNText style={resolveStyle(style)} {...props} />;
}

export const AnimatedText = Animated.createAnimatedComponent(Text);

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput style={resolveStyle(style)} {...props} />;
}
