import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, spacing } from '@/theme/tokens';

type P = { value: string; onChange: (v: string) => void; onComplete: (v: string) => void; error?: boolean; length?: number };

// Seis casillas (AU_04). Un campo oculto recibe el teclado numérico y las casillas solo lo muestran,
// así el autoavance, borrar y pegar el código funcionan igual en Android y en la web.
export function OtpInput({ value, onChange, onComplete, error, length = 6 }: P) {
  const ref = useRef<TextInput>(null);
  const handle = (t: string) => {
    const v = t.replace(/\D/g, '').slice(0, length);
    onChange(v);
    if (v.length === length) onComplete(v);
  };
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityLabel="Código de verificación">
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const active = i === Math.min(value.length, length - 1);
          return (
            <View key={i} style={[styles.box, active && styles.boxActive, error && styles.boxError]}>
              <Text style={styles.digit}>{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={handle}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        caretHidden
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  box: { flex: 1, aspectRatio: 0.85, maxWidth: 56, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  boxActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  boxError: { borderColor: colors.danger },
  digit: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
