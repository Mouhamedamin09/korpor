import { Text, TextProps } from 'react-native';

export function ThemedText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[
        { fontFamily: 'Inter-Regular' },
        props.style,
      ]}
    >
      {props.children}
    </Text>
  );
} 