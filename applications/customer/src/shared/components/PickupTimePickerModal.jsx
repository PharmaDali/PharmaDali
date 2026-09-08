import React, { useState, useEffect, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { formatMinutesToAmPm } from '@src/utils/pickupScheduleUtils'
import BlueClockIcon from '@assets/icons/blue_clock_icon.svg'

export default function PickupTimePickerModal({
  visible,
  onClose,
  onSelectTime,
  selectedTime,
  selectedDate = new Date(),
  openingMinutes = 480,
  closingMinutes = 1200,
  minimumDateTime = new Date(Date.now() + 30 * 60 * 1000),
  closingDateTime = new Date(),
  pharmacyName = 'Selected Pharmacy',
}) {
  const [tempSelectedTime, setTempSelectedTime] = useState(null)

  // Bounds clamping helper
  const clampDate = (date) => {
    if (!date || !(date instanceof Date)) {
      const fallback = minimumDateTime ? new Date(minimumDateTime) : new Date(Date.now() + 30 * 60 * 1000)
      fallback.setSeconds(0, 0)
      return fallback
    }
    const res = new Date(date)
    res.setSeconds(0, 0)
    const timeMs = res.getTime()
    const minMs = minimumDateTime ? minimumDateTime.getTime() : new Date().getTime() + 30 * 60 * 1000
    
    // Max pickup time is 15 minutes before store closing
    let maxMs = closingDateTime ? closingDateTime.getTime() - 15 * 60 * 1000 : minMs + 8 * 3600 * 1000
    if (maxMs < minMs) maxMs = minMs

    if (timeMs < minMs) return new Date(minMs)
    if (timeMs > maxMs) return new Date(maxMs)
    return res
  }

  useEffect(() => {
    if (visible) {
      const initial = selectedTime || minimumDateTime || new Date(Date.now() + 30 * 60 * 1000)
      setTempSelectedTime(clampDate(new Date(initial)))
    }
  }, [visible, selectedTime, minimumDateTime, closingDateTime])

  const formatTime12Hour = (date) => {
    if (!date || !(date instanceof Date)) return '--:--'
    return date.toLocaleTimeString('en-PH', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const adjustMinutes = (deltaMinutes) => {
    setTempSelectedTime((prevDate) => {
      const base = prevDate ? new Date(prevDate) : new Date(minimumDateTime || Date.now() + 30 * 60 * 1000)
      const updatedMs = base.getTime() + deltaMinutes * 60 * 1000
      return clampDate(new Date(updatedMs))
    })
  }

  const isAtMin = useMemo(() => {
    if (!tempSelectedTime || !minimumDateTime) return false
    return tempSelectedTime.getTime() <= minimumDateTime.getTime()
  }, [tempSelectedTime, minimumDateTime])

  const isAtMax = useMemo(() => {
    if (!tempSelectedTime || !closingDateTime) return false
    const maxMs = closingDateTime.getTime() - 15 * 60 * 1000
    return tempSelectedTime.getTime() >= maxMs
  }, [tempSelectedTime, closingDateTime])

  const handleConfirm = () => {
    if (tempSelectedTime) {
      const finalTime = new Date(tempSelectedTime)
      finalTime.setSeconds(0, 0)
      onSelectTime(finalTime)
    }
    onClose()
  }

  const minFormatted = minimumDateTime ? formatTime12Hour(minimumDateTime) : formatMinutesToAmPm(openingMinutes)
  const maxFormatted = closingDateTime
    ? formatTime12Hour(new Date(closingDateTime.getTime() - 15 * 60 * 1000))
    : formatMinutesToAmPm(closingMinutes - 15)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />

        <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl pt-2 shadow-2xl">
          {/* Top Drag Handle */}
          <View className="items-center py-2">
            <View className="w-8 h-1 rounded-full bg-slate-200" />
          </View>

          {/* Minimalist Header */}
          <View className="flex-row items-center justify-between px-6 py-2 border-b border-slate-100">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-lg bg-sky-50 items-center justify-center mr-2.5">
                <BlueClockIcon width={18} height={18} />
              </View>
              <View className="flex-1">
                <Text className="text-base text-slate-800" style={styles.fontBold}>
                  Select Pickup Time
                </Text>
                <Text className="text-[11px] text-slate-400" style={styles.fontMedium}>
                  Open: {formatMinutesToAmPm(openingMinutes)} – {formatMinutesToAmPm(closingMinutes)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-semibold text-slate-400">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="px-6 pt-3 pb-2">
            {/* HERO MINIMALIST ADJUSTABLE TIME DISPLAY */}
            <View className="items-center my-2 py-2">
              <Text className="text-[10px] text-slate-400 uppercase tracking-widest mb-3" style={styles.fontBold}>
                Pickup Time
              </Text>

              <View className="flex-row items-center justify-center w-full px-4 gap-4">
                {/* Minus 15m Button */}
                <TouchableOpacity
                  disabled={isAtMin}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    isAtMin
                      ? 'bg-slate-100 opacity-30'
                      : 'bg-slate-100 active:bg-sky-50'
                  }`}
                  onPress={() => adjustMinutes(-15)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-2xl ${isAtMin ? 'text-slate-400' : 'text-slate-700'}`} style={styles.fontBold}>
                    −
                  </Text>
                </TouchableOpacity>

                {/* Prominent Minimalist Time Text */}
                <View className="items-center px-6 py-2.5 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <Text className="text-3xl text-[#48AAD9]" style={styles.fontBold}>
                    {formatTime12Hour(tempSelectedTime)}
                  </Text>
                </View>

                {/* Plus 15m Button */}
                <TouchableOpacity
                  disabled={isAtMax}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    isAtMax
                      ? 'bg-slate-100 opacity-30'
                      : 'bg-slate-100 active:bg-sky-50'
                  }`}
                  onPress={() => adjustMinutes(15)}
                  activeOpacity={0.7}
                >
                  <Text className={`text-2xl ${isAtMax ? 'text-slate-400' : 'text-slate-700'}`} style={styles.fontBold}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Operating Window Limits */}
              <Text className="text-[11px] text-slate-400 mt-3 text-center" style={styles.fontMedium}>
                Earliest (30m min): {minFormatted} • Latest: {maxFormatted}
              </Text>
            </View>

            {/* QUICK STEP ADJUSTMENT PILLS */}
            <View className="flex-row gap-1.5 my-3">
              {[
                { label: '−30m', delta: -30 },
                { label: '−15m', delta: -15 },
                { label: '+15m', delta: 15 },
                { label: '+30m', delta: 30 },
                { label: '+1h', delta: 60 },
              ].map((step) => (
                <TouchableOpacity
                  key={step.label}
                  className="flex-1 py-2 rounded-lg bg-slate-50 border border-slate-200/50 items-center justify-center active:bg-slate-100"
                  onPress={() => adjustMinutes(step.delta)}
                  activeOpacity={0.7}
                >
                  <Text className="text-xs text-slate-600" style={styles.fontMedium}>
                    {step.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* PRESETS */}
            <Text className="text-[10px] text-slate-400 uppercase tracking-widest mb-2" style={styles.fontBold}>
              Quick Presets
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {[
                {
                  label: 'Earliest (In 30m)',
                  getDate: () => minimumDateTime || new Date(Date.now() + 30 * 60 * 1000),
                },
                {
                  label: 'In 45 Minutes',
                  getDate: () => new Date(Date.now() + 45 * 60 * 1000),
                },
                {
                  label: 'In 1 Hour',
                  getDate: () => new Date(Date.now() + 60 * 60 * 1000),
                },
                {
                  label: 'Before Closing',
                  getDate: () =>
                    closingDateTime
                      ? new Date(closingDateTime.getTime() - 30 * 60 * 1000)
                      : new Date(),
                },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  style={{ width: '48.5%' }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200/60 bg-white items-center justify-center active:bg-sky-50 active:border-[#48AAD9]"
                  onPress={() => setTempSelectedTime(clampDate(preset.getDate()))}
                  activeOpacity={0.75}
                >
                  <Text className="text-xs text-slate-600 text-center" style={styles.fontMedium}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* ACTION FOOTER WITH BOTTOM MARGIN & PADDING */}
          <View className="px-6 pt-3 pb-6 mb-2 border-t border-slate-100 bg-white">
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-slate-200 items-center justify-center bg-white"
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text className="text-xs text-slate-500" style={styles.fontSemiBold}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-[2] py-3 rounded-xl bg-[#48AAD9] items-center justify-center shadow-xs"
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text className="text-xs text-white" style={styles.fontSemiBold}>
                  Confirm Time
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
  },
})
