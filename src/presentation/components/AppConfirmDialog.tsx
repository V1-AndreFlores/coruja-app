import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppText } from './AppText';

type AppConfirmDialogProps = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  processingLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AppConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  isProcessing = false,
  processingLabel = 'Removendo...',
  onCancel,
  onConfirm,
}: AppConfirmDialogProps) {
  const { colors } = useAppTheme();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable
          accessibilityLabel="Fechar confirmação"
          accessibilityRole="button"
          disabled={isProcessing}
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.dialog,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <AppText style={styles.title}>{title}</AppText>
          <AppText secondary style={styles.description}>
            {description}
          </AppText>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isProcessing}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed || isProcessing ? 0.68 : 1,
                },
              ]}
            >
              <AppText style={styles.cancelText}>{cancelLabel}</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isProcessing}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed || isProcessing ? 0.68 : 1,
                },
              ]}
            >
              <AppText style={styles.confirmText}>
                {isProcessing ? processingLabel : confirmLabel}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  button: {
    minHeight: 44,
    minWidth: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
