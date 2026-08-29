import React from 'react';
import { ScrollView, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CenteredBoxProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Centers every profile screen inside a square-ish card. On wide screens the
 * card is capped at `maxWidth` and centered both axes; on phones it fills the
 * width. Content taller than the screen scrolls normally.
 */
export default function CenteredBox({ children, style, contentStyle }: CenteredBoxProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.box, style]}>{children}</View>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
    box: {
      width: '100%',
      maxWidth: 460,
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
    },
  });
