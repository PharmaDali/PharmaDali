import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { formatMinutesToAmPm, roundToNextFiveMinutes } from '@src/utils/pickupScheduleUtils'
import BlueClockIcon from '@assets/icons/blue_clock_icon.svg'

const ITEM_HEIGHT = 48
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const PERIODS = ['AM', 'PM']

function WheelColumn({ items, selectedIndex, onSelect, width = 76, visible = false }) {
  const scrollViewRef = useRef(null)
  const isUserScrolling = useRef(false)
  const currentScrolledIndex = useRef(selectedIndex)

  // Scroll to new position when selectedIndex changes externally (e.g. preset clicked or modal opened)
  useEffect(() => {
    if (!isUserScrolling.current && selectedIndex >= 0 && selectedIndex !== currentScrolledIndex.current) {
      currentScrolledIndex.current = selectedIndex
      scrollViewRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: true,
      })
    }
  }, [selectedIndex])

  // Sync scroll position whenever modal becomes visible
  useEffect(() => {
    if (visible && selectedIndex >= 0) {
      currentScrolledIndex.current = selectedIndex
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [visible])

  // Initial scroll when component mounts
  useEffect(() => {
    if (selectedIndex >= 0) {
      currentScrolledIndex.current = selectedIndex
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        })
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleScrollBegin = () => {
    isUserScrolling.current = true
  }

  const handleScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index))
    currentScrolledIndex.current = clampedIndex
    isUserScrolling.current = false
    if (clampedIndex !== selectedIndex) {
      onSelect(clampedIndex)
    }
  }

  return (
    <View style={{ height: ITEM_HEIGHT * 3, width }} className="overflow-hidden">
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled={true}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollBegin={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(e) => {
          if (!e.nativeEvent.velocity || Math.abs(e.nativeEvent.velocity.y) < 0.1) {
            handleScrollEnd(e)
          }
        }}
        contentContainerStyle={{
          paddingTop: ITEM_HEIGHT,
          paddingBottom: ITEM_HEIGHT,
        }}
      >
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex
          return (
            <TouchableOpacity
              key={String(item) + idx}
              style={{ height: ITEM_HEIGHT }}
              className="items-center justify-center"
              onPress={() => {
                currentScrolledIndex.current = idx
                isUserScrolling.current = false
                onSelect(idx)
                scrollViewRef.current?.scrollTo({
                  y: idx * ITEM_HEIGHT,
                  animated: true,
                })
              }}
              activeOpacity={0.7}
            >
              <Text
                className={isSelected ? 'text-2xl text-[#48AAD9]' : 'text-base text-slate-400'}
                style={isSelected ? styles.fontBold : styles.fontMedium}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

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
  hoursLabel = '',
}) {
  const [tempSelectedTime, setTempSelectedTime] = useState(null)

  const minMs = useMemo(() => {
    if (minimumDateTime instanceof Date) {
      return minimumDateTime.getTime()
    }
    return Date.now() + 30 * 60 * 1000
  }, [minimumDateTime])

  const maxMs = useMemo(() => {
    if (closingDateTime instanceof Date) {
      return closingDateTime.getTime() - 15 * 60 * 1000
    }
    return minMs + 8 * 3600 * 1000
  }, [closingDateTime, minMs])

  const getAlignedDate = useCallback((date) => {
    const targetDate = minimumDateTime instanceof Date ? minimumDateTime : selectedDate
    const d = new Date(date)
    if (targetDate instanceof Date) {
      d.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    }
    return d
  }, [minimumDateTime, selectedDate])

  const clampDate = useCallback((date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      const fallback = new Date(minMs)
      fallback.setSeconds(0, 0)
      return fallback
    }
    const aligned = getAlignedDate(date)
    aligned.setSeconds(0, 0)
    const timeMs = aligned.getTime()
    const effectiveMax = maxMs < minMs ? minMs : maxMs

    if (timeMs < minMs) return new Date(minMs)
    if (timeMs > effectiveMax) return new Date(effectiveMax)
    return aligned
  }, [minMs, maxMs, getAlignedDate])

  const getEarliestTarget = useCallback(() => {
    const base = new Date(minMs)
    return clampDate(roundToNextFiveMinutes(base))
  }, [clampDate, minMs])

  useEffect(() => {
    if (visible) {
      let initial = selectedTime
      if (!initial || !(initial instanceof Date) || isNaN(initial.getTime())) {
        initial = getEarliestTarget()
      } else {
        const targetDate = minimumDateTime instanceof Date ? minimumDateTime : selectedDate
        if (targetDate instanceof Date) {
          initial = new Date(initial)
          initial.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
        }
      }
      setTempSelectedTime(clampDate(new Date(initial)))
    }
  }, [visible, selectedTime, selectedDate, minimumDateTime, clampDate, getEarliestTarget])

  const formatTime12Hour = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '--:--'
    return date.toLocaleTimeString('en-PH', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Derive hour, minute (0-59), and period from tempSelectedTime
  const { hourIndex, minuteIndex, periodIndex } = useMemo(() => {
    if (!tempSelectedTime) {
      return { hourIndex: 0, minuteIndex: 0, periodIndex: 0 }
    }
    const h24 = tempSelectedTime.getHours()
    const mins = tempSelectedTime.getMinutes()
    const isPm = h24 >= 12
    const h12 = (h24 % 12) === 0 ? 12 : h24 % 12

    const hIdx = Math.max(0, HOURS.indexOf(h12))
    const mIdx = Math.max(0, Math.min(59, mins))
    const pIdx = isPm ? 1 : 0

    return { hourIndex: hIdx, minuteIndex: mIdx, periodIndex: pIdx }
  }, [tempSelectedTime])

  const handleWheelChange = (newHourIdx, newMinIdx, newPeriodIdx) => {
    const hour12 = HOURS[newHourIdx]
    const minute = Number(MINUTES[newMinIdx])
    const isPm = newPeriodIdx === 1

    let hour24 = hour12 % 12
    if (isPm) hour24 += 12

    const base = tempSelectedTime || selectedDate || new Date(minMs)
    const updated = getAlignedDate(base)
    updated.setHours(hour24, minute, 0, 0)
    setTempSelectedTime(updated)
  }

  const handlePreset = (type) => {
    const earliest = getEarliestTarget()
    const oneHourTarget = clampDate(new Date(earliest.getTime() + 60 * 60 * 1000))
    const twoHoursTarget = clampDate(new Date(earliest.getTime() + 120 * 60 * 1000))

    if (type === 'earliest') {
      setTempSelectedTime(earliest)
      return
    }

    if (type === 'close') {
      setTempSelectedTime(new Date(maxMs))
      return
    }

    const currentMs = tempSelectedTime?.getTime?.() || earliest.getTime()

    if (type === 'plus1') {
      if (currentMs === oneHourTarget.getTime()) {
        const nextTime = clampDate(new Date(currentMs + 60 * 60 * 1000))
        setTempSelectedTime(nextTime)
      } else if (currentMs === earliest.getTime() || currentMs === twoHoursTarget.getTime()) {
        setTempSelectedTime(oneHourTarget)
      } else {
        const nextTime = clampDate(new Date(currentMs + 60 * 60 * 1000))
        setTempSelectedTime(nextTime)
      }
      return
    }

    if (type === 'plus2') {
      if (currentMs === twoHoursTarget.getTime()) {
        const nextTime = clampDate(new Date(currentMs + 120 * 60 * 1000))
        setTempSelectedTime(nextTime)
      } else if (currentMs === earliest.getTime() || currentMs === oneHourTarget.getTime()) {
        setTempSelectedTime(twoHoursTarget)
      } else {
        const nextTime = clampDate(new Date(currentMs + 120 * 60 * 1000))
        setTempSelectedTime(nextTime)
      }
      return
    }
  }

  const isValidTime = useMemo(() => {
    if (!tempSelectedTime) return false
    const timeMs = tempSelectedTime.getTime()
    return timeMs >= minMs && timeMs <= maxMs
  }, [tempSelectedTime, minMs, maxMs])

  const isSelectedDateToday = useMemo(() => {
    const target = selectedDate instanceof Date ? selectedDate : minimumDateTime
    if (!(target instanceof Date)) return true
    const now = new Date()
    return (
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate()
    )
  }, [selectedDate, minimumDateTime])

  const validationWarning = useMemo(() => {
    if (!tempSelectedTime) return null
    const timeMs = tempSelectedTime.getTime()
    if (timeMs < minMs) {
      const reason = isSelectedDateToday ? ' (30m prep required)' : ' (store opening time)'
      return `Earliest pickup is ${formatTime12Hour(new Date(minMs))}${reason}`
    }
    if (timeMs > maxMs) {
      return `Latest pickup is ${formatTime12Hour(new Date(maxMs))} (15m before closing)`
    }
    return null
  }, [tempSelectedTime, minMs, maxMs, isSelectedDateToday])

  const handleConfirm = () => {
    if (tempSelectedTime && isValidTime) {
      const finalTime = getAlignedDate(tempSelectedTime)
      finalTime.setSeconds(0, 0)
      onSelectTime(finalTime)
    }
    onClose()
  }

  const minFormatted = formatTime12Hour(new Date(minMs))
  const maxFormatted = formatTime12Hour(new Date(maxMs))

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

          {/* Header */}
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
                  Open: {hoursLabel || `${formatMinutesToAmPm(openingMinutes)} - ${formatMinutesToAmPm(closingMinutes)}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-xs font-semibold text-slate-400">✕</Text>
            </TouchableOpacity>
          </View>

          {/* SCROLL WHEEL PICKER */}
          <View className="items-center justify-center my-3">
            <View className="relative flex-row items-center justify-center w-full px-8">
              {/* Center Highlight Bar Behind Wheels */}
              <View
                style={{ height: ITEM_HEIGHT, top: ITEM_HEIGHT }}
                className="absolute left-10 right-10 bg-sky-50/80 border-y border-[#48AAD9]/30 rounded-xl"
                pointerEvents="none"
              />

              {/* Hours Column (1-12) */}
              <WheelColumn
                items={HOURS}
                selectedIndex={hourIndex}
                onSelect={(newH) => handleWheelChange(newH, minuteIndex, periodIndex)}
                width={76}
                visible={visible}
              />

              {/* Colon Separator */}
              <Text
                style={styles.fontBold}
                className="text-2xl text-[#48AAD9] px-2 mb-1"
              >
                :
              </Text>

              {/* Minutes Column (00-59, 1-min increments) */}
              <WheelColumn
                items={MINUTES}
                selectedIndex={minuteIndex}
                onSelect={(newM) => handleWheelChange(hourIndex, newM, periodIndex)}
                width={76}
                visible={visible}
              />

              {/* AM/PM Column */}
              <WheelColumn
                items={PERIODS}
                selectedIndex={periodIndex}
                onSelect={(newP) => handleWheelChange(hourIndex, minuteIndex, newP)}
                width={76}
                visible={visible}
              />
            </View>

            {/* Operating Window or Validation Warning */}
            {validationWarning ? (
              <Text className="text-[11px] text-[#B42318] mt-2.5 px-6 text-center" style={styles.fontMedium}>
                {validationWarning}
              </Text>
            ) : (
              <Text className="text-[11px] text-slate-400 mt-2.5 text-center" style={styles.fontMedium}>
                Earliest: {minFormatted} • Latest: {maxFormatted}
              </Text>
            )}
          </View>

          {/* QUICK PRESETS */}
          <View className="px-6 pt-1 pb-2">
            <View className="flex-row gap-2">
              {[
                {
                  label: 'Earliest',
                  type: 'earliest',
                },
                {
                  label: '+1 Hour',
                  type: 'plus1',
                },
                {
                  label: '+2 Hours',
                  type: 'plus2',
                },
                {
                  label: 'Before Close',
                  type: 'close',
                },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 items-center justify-center active:bg-sky-50 active:border-[#48AAD9]"
                  onPress={() => handlePreset(preset.type)}
                  activeOpacity={0.75}
                >
                  <Text className="text-[11px] text-slate-600" style={styles.fontMedium}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ACTION FOOTER */}
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
                disabled={!isValidTime}
                className={`flex-[2] py-3 rounded-xl items-center justify-center ${
                  isValidTime ? 'bg-[#48AAD9]' : 'bg-slate-300'
                }`}
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
