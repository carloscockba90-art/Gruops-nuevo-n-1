import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '@/theme/tokens';

type Props = TextInputProps & { label?: string; error?: string; password?: boolean };

// Con `password` muestra el ojo para ver/ocultar (diseño de AU_02 y AU_03).
export function Input({ label, error, password, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View>
        <TextInput
          {...rest}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, focused ? styles.inputFocus : null, error ? styles.inputError : null, password ? styles.withIcon : null, style]}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          secureTextEntry={password ? hidden : rest.secureTextEntry}
          accessibilityLabel={rest.accessibilityLabel ?? label}
        />
        {password ? (
          <Pressable accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'} onPress={() => setHidden((h) => !h)} style={styles.eye} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { fontSize: font.md, color: colors.text },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: font.md, color: colors.text, backgroundColor: colors.bg },
  withIcon: { paddingRight: 48 },
  eye: { position: 'absolute', right: spacing.md, top: 15 },
  inputFocus: { borderColor: colors.primary, ...(typeof document !== 'undefined' ? ({ outlineStyle: 'none' } as object) : {}) },
  inputError: { borderColor: colors.danger },
  error: { fontSize: font.sm, color: colors.danger },
});
