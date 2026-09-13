import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors } from '@src/shared/theme/colorPalette';

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function UndoSnackbar({
  visible,
  message = 'Conversation deleted',
  onUndo,
  duration = 5000,
  bottomOffset = 24,
}) {
  const [progress, setProgress] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(duration / 1000));

  useEffect(() => {
    if (!visible) {
      setProgress(1);
      setSecondsLeft(Math.ceil(duration / 1000));
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress(remaining / duration);
      setSecondsLeft(Math.max(1, Math.ceil(remaining / 1000)));
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [visible, duration]);

  if (!visible) return null;

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: bottomOffset }]}
    >
      <Animated.View
        entering={FadeInUp.duration(200)}
        exiting={FadeOutDown.duration(200)}
        style={styles.pill}
      >
        <View style={styles.leftRow}>
          <View style={styles.progressContainer}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Circle
                cx="12"
                cy="12"
                r={RADIUS}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="2.5"
                fill="none"
              />
              <Circle
                cx="12"
                cy="12"
                r={RADIUS}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 12 12)"
              />
            </Svg>
            <Text style={styles.progressSecondsText}>{secondsLeft}</Text>
          </View>

          <Text style={styles.messageText} numberOfLines={1}>
            {message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onUndo}
          activeOpacity={0.8}
          style={styles.undoButton}
        >
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: 'center',
  },
  pill: {
    backgroundColor: colors.buttonColor || '#48AAD9',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#0369A1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  progressContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  progressSecondsText: {
    position: 'absolute',
    fontFamily: 'Poppins-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlign: 'center',
  },
  messageText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  undoButton: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  undoText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: colors.buttonColor || '#48AAD9',
  },
});


