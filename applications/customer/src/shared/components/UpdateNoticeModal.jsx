import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppUpdates } from '@shared/hooks/useAppUpdates';

export default function UpdateNoticeModal({
  visible: controlledVisible,
  onRestart: controlledRestart,
  onDismiss: controlledDismiss,
  isRestarting: controlledIsRestarting,
}) {
  const autoUpdates = useAppUpdates();

  const isVisible =
    controlledVisible !== undefined ? controlledVisible : autoUpdates.modalVisible;
  const isRestarting =
    controlledIsRestarting !== undefined
      ? controlledIsRestarting
      : autoUpdates.isRestarting;
  const handleRestart = controlledRestart || autoUpdates.reloadApp;
  const handleDismiss = controlledDismiss || autoUpdates.dismissModal;

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Circular Brand Icon */}
          <View style={styles.iconCircle}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3v10m0 0l3.5-3.5M12 13l-3.5-3.5"
                stroke="#48AAD9"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1"
                stroke="#48AAD9"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx="19" cy="6" r="2" fill="#48AAD9" />
            </Svg>
          </View>

          {/* Badge */}
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>NEW VERSION AVAILABLE</Text>
          </View>

          {/* Title */}
          <Text style={styles.titleText}>App Update Ready</Text>

          {/* Description */}
          <Text style={styles.bodyText}>
            A new version of PharmaDali is ready to install with the latest improvements and fixes. Restart now to apply the update.
          </Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isRestarting && styles.buttonDisabled]}
            onPress={handleRestart}
            disabled={isRestarting}
            activeOpacity={0.85}
          >
            {isRestarting ? (
              <View style={styles.buttonRow}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>Restarting app...</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>Restart Now</Text>
            )}
          </TouchableOpacity>

          {/* Secondary Action Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDismiss}
            disabled={isRestarting}
            activeOpacity={0.65}
          >
            <Text style={styles.secondaryButtonText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EBF7FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeContainer: {
    backgroundColor: '#EBF7FC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Bold',
    color: '#48AAD9',
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  titleText: {
    fontSize: 19,
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },
  bodyText: {
    fontSize: 12.5,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    includeFontPadding: false,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#48AAD9',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#94A3B8',
    includeFontPadding: false,
  },
});

