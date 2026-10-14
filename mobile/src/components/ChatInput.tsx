import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '@/theme/tokens';

type P = { onSend: (text: string) => void; placeholder?: string; autoFocus?: boolean; disabled?: boolean };

// Campo de texto de Lucas: micrófono (voz aún no conectada) y botón de enviar.
export function ChatInput({ onSend, placeholder = '¿Qué quieres hacer?', autoFocus, disabled }: P) {
  const [text, setText] = useState('');
  const send = () => {
    const t = text.trim();
    if (!t || disabled) return;
    setText('');
    onSend(t);
  };
  return (
    <View style={styles.row}>
      <View style={styles.input}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.field}
          autoFocus={autoFocus}
          onSubmitEditing={send}
          returnKeyType="send"
          accessibilityLabel="Mensaje para Lucas"
        />
        <Ionicons name="mic-outline" size={22} color={colors.textMuted} />
      </View>
      <Pressable accessibilityLabel="Enviar" onPress={send} disabled={!text.trim() || disabled} style={[styles.send, (!text.trim() || disabled) && { opacity: 0.45 }]}>
        <Ionicons name="arrow-up" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg },
  field: { flex: 1, fontSize: font.md, color: colors.text, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}) },
  send: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
