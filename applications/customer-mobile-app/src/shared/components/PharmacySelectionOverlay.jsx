import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@shared/theme/colorPalette';
import RedStoreIcon from '@assets/icons/red_store_icon.svg';
import { getPharmacyDataInSelectionPhase } from '@shared/services/selectionPhaseService';

const fallbackPharmacies = [];

function parseTimeToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') {
    return null;
  }

  const [hoursRaw, minutesRaw] = timeValue.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return (hours * 60) + minutes;
}

function formatTimeToAmPm(timeValue) {
  const minutes = parseTimeToMinutes(timeValue);

  if (minutes === null) {
    return null;
  }

  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${hours12}:${String(mins).padStart(2, '0')} ${period}`;
}

function isPharmacyOpenNow(openingHour, closingHour, now = new Date()) {
  const openingMinutes = parseTimeToMinutes(openingHour);
  const closingMinutes = parseTimeToMinutes(closingHour);

  if (openingMinutes === null || closingMinutes === null) {
    return false;
  }

  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  // Same opening and closing time is treated as closed/invalid schedule.
  if (openingMinutes === closingMinutes) {
    return false;
  }

  // Normal schedule (e.g., 08:00 - 20:00)
  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  // Overnight schedule (e.g., 20:00 - 06:00)
  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}

function PharmacyCard({ pharmacy, onSelect }) {
  return (
    <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-3 mb-3" style={{ backgroundColor: '#F7FBFE' }}>
      <View className="mr-3">
        <RedStoreIcon width={32} height={32} />
      </View>
      <View className="flex-1">
        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
        <Text style={styles.pharmacyDetail}>{pharmacy.address}</Text>
        <View className="flex-row items-center mt-1">
          <Text style={styles.pharmacyDetail}>{pharmacy.hours}</Text>
          {pharmacy.isOpen && (
            <View className="bg-green-500 rounded-full px-2 py-0.5 ml-2">
              <Text style={styles.openBadge}>Open now</Text>
            </View>
          )}
          {!pharmacy.isOpen && (
            <View className="bg-red-500 rounded-full px-2 py-0.5 ml-2">
              <Text style={styles.closedBadge}>Closed</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        className="rounded-full px-4 py-1.5 ml-2"
        style={{ backgroundColor: colors.buttonColor }}
        onPress={() => onSelect(pharmacy)}
      >
        <Text style={styles.selectText}>Select</Text>
      </Pressable>
    </View>
  );
}

export default function PharmacySelectionOverlay({ visible, onSelect }) {
  const insets = useSafeAreaInsets();
  const [remotePharmacies, setRemotePharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    async function fetchPharmacyData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getPharmacyDataInSelectionPhase();
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        const mapped = normalized.map((item) => {
          const formattedOpeningHour = formatTimeToAmPm(item.opening_hour);
          const formattedClosingHour = formatTimeToAmPm(item.closing_hour);

          return {
            formattedOpeningHour,
            formattedClosingHour,
            id: item.id ?? item.pharmacy_id,
            name: item.pharmacy_name,
            address: item.location,
            hours:
              formattedOpeningHour && formattedClosingHour
                ? `${formattedOpeningHour} - ${formattedClosingHour}`
                : 'Store hours unavailable',
            isOpen: isPharmacyOpenNow(item.opening_hour, item.closing_hour),
            isOperating: typeof item.is_active === 'boolean' ? item.is_active : true,
          };
        });

        if (isMounted) {
          setRemotePharmacies(mapped);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error?.message || 'Failed to load pharmacies.');
          setRemotePharmacies([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPharmacyData();

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const displayedPharmacies = useMemo(() => {
    if (remotePharmacies.length > 0) {
      return remotePharmacies;
    }

    return fallbackPharmacies;
  }, [remotePharmacies]);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Text style={styles.title}>Select a Pharmacy</Text>
          <Text style={styles.subtitle}>Select a Pharmacy</Text>
          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {isLoading && <Text style={styles.stateText}>Loading pharmacies...</Text>}

            {!isLoading && errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {!isLoading && displayedPharmacies.length === 0 ? (
              <Text style={styles.stateText}>No pharmacies available.</Text>
            ) : null}

            {displayedPharmacies.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} onSelect={onSelect} />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: colors.textColor,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  },
  pharmacyName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: colors.textColor,
  },
  pharmacyDetail: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: '#888',
  },
  openBadge: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 8,
    color: '#fff',
  },
  closedBadge: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 8,
    color: '#fff',
  },
  selectText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#fff',
  },
  stateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 12,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    maxHeight: '55%',
  },
});
