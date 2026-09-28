import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, Pressable, TouchableOpacity, ScrollView, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@shared/theme/colorPalette';
import RedStoreIcon from '@assets/icons/red_store_icon.svg';
import { getPharmacyDataInSelectionPhase } from '@shared/services/selectionPhaseService';
import LocationIcon from '@assets/icons/red_location_icon.svg';
import { getManilaMinutes } from '@src/utils/pickupScheduleUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatBranchName, parsePharmacyLocation } from '@shared/utils/notificationUtils';

const fallbackPharmacies = [];

function parseTimeToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') {
    return null;
  }

  const str = timeValue.trim();

  const ampmMatch = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    const hours12 = Number(ampmMatch[1]);
    const mins = Number(ampmMatch[2] || 0);
    const period = ampmMatch[3].toUpperCase();

    if (hours12 >= 1 && hours12 <= 12 && mins >= 0 && mins <= 59) {
      const hours24 = (hours12 % 12) + (period === 'PM' ? 12 : 0);
      return (hours24 * 60) + mins;
    }
  }

  const match24 = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return (hours * 60) + minutes;
    }
  }

  return null;
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

  const currentMinutes = getManilaMinutes(now);

  if (openingMinutes === closingMinutes) {
    return true;
  }

  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
  }

  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}


function PharmacyCard({ pharmacy, onSelect, isSelected }) {
  const { address, landmark } = parsePharmacyLocation(pharmacy.address || pharmacy.location);
  const branchName = formatBranchName(pharmacy.name, address || pharmacy.address) || pharmacy.name || address;

  return (
    <View
      style={[
        styles.cardContainer,
        isSelected ? styles.cardContainerSelected : styles.cardContainerDefault,
      ]}
    >
      {/* Header: Store Icon + Branch Name + Open/Closed Status Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.storeIconWrap}>
            <RedStoreIcon width={18} height={18} />
          </View>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.pharmacyName} numberOfLines={1}>
              {branchName}
            </Text>
            {isSelected && (
              <View style={styles.currentBadgeWrap}>
                <Text style={styles.currentBadge}>Current</Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            pharmacy.isOpen ? styles.openBadgeBg : styles.closedBadgeBg,
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {pharmacy.isOpen ? 'Open now' : 'Closed'}
          </Text>
        </View>
      </View>

      {/* Subtle Divider */}
      <View style={styles.cardDivider} />

      {/* Middle Body: Primary Address, Highlighted Landmark Callout, & Operating Hours */}
      <View style={styles.cardBody}>
        {address ? (
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <LocationIcon width={13} height={13} />
            </View>
            <Text style={styles.pharmacyAddress} numberOfLines={2}>
              {address}
            </Text>
          </View>
        ) : null}

        {landmark ? (
          <View style={styles.landmarkBox}>
            <View style={styles.landmarkIconWrap}>
              <MaterialCommunityIcons name="compass-outline" size={13} color="#0284c7" />
            </View>
            <Text style={styles.landmarkText} numberOfLines={2}>
              <Text style={styles.landmarkLabel}>Landmark: </Text>
              {landmark}
            </Text>
          </View>
        ) : null}

        <View style={[styles.infoRow, (address || landmark) ? { marginTop: 7 } : null]}>
          <View style={styles.infoIconWrap}>
            <MaterialCommunityIcons name="clock-outline" size={13} color="#666" />
          </View>
          <Text style={styles.pharmacyHours}>
            {pharmacy.hours || 'Operating hours not specified'}
          </Text>
        </View>
      </View>

      {/* Bottom Action: Dedicated Full-Width Select / Active Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isSelected ? styles.actionButtonActive : styles.actionButtonDefault,
        ]}
        onPress={() => onSelect(pharmacy)}
        activeOpacity={0.8}
      >
        {isSelected ? (
          <View style={styles.actionButtonContent}>
            <MaterialCommunityIcons name="check-circle" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionButtonText}>Active Branch</Text>
          </View>
        ) : (
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonText}>Select This Branch</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}


export default function PharmacySelectionOverlay({ visible, onSelect, onClose, currentPharmacyId }) {
  const insets = useSafeAreaInsets();
  const [remotePharmacies, setRemotePharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const isScrollable = contentHeight > containerHeight && containerHeight > 0;
  const scrollTrackHeight = containerHeight > 0 ? containerHeight : 1;
  const scrollRatio = contentHeight > 0 ? containerHeight / contentHeight : 1;
  const thumbHeight = Math.max(32, Math.min(scrollTrackHeight * scrollRatio, scrollTrackHeight - 8));
  const maxScroll = Math.max(1, contentHeight - containerHeight);
  const maxTranslate = Math.max(0, scrollTrackHeight - thumbHeight);

  const thumbTranslateY = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, maxTranslate],
    extrapolate: 'clamp',
  });

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
          const isOperating = item.is_active !== false && item.is_active !== 0 && item.is_active !== '0';
          const isOpen = isOperating && isPharmacyOpenNow(item.opening_hour, item.closing_hour);

          return {
            id: item.id ?? item.pharmacy_id,
            pharmacy_id: item.id ?? item.pharmacy_id,
            name: item.pharmacy_name,
            pharmacy_name: item.pharmacy_name,
            address: item.location,
            location: item.location,
            opening_hour: item.opening_hour,
            closing_hour: item.closing_hour,
            openingHour: item.opening_hour,
            closingHour: item.closing_hour,
            formattedOpeningHour,
            formattedClosingHour,
            hours:
              formattedOpeningHour && formattedClosingHour
                ? `${formattedOpeningHour} - ${formattedClosingHour}`
                : 'Store hours unavailable',
            isOpen,
            is_active: isOperating,
            isActive: isOperating,
            isOperating,
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose || (() => {})}
    >
      <View style={styles.overlayContainer}>
        <View style={styles.backdrop}>
          {onClose && (
            <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
          )}
          <View
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) + 12 }]}
          >
            <View style={styles.sheetHeader}>
              <View className="flex-1 mr-2">
                <Text style={styles.title}>Select a Pharmacy</Text>
                <Text style={styles.subtitle}>Choose a branch to view available products</Text>
              </View>
              {onClose && (
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mt-0.5"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {/* Scrollable Container with Theme-Matched Visible Scrollbar */}
            <View
              style={styles.scrollWrapper}
              onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
            >
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                scrollEventThrottle={16}
                onContentSizeChange={(_, h) => setContentHeight(h)}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false }
                )}
              >
                {isLoading && <Text style={styles.stateText}>Loading pharmacies...</Text>}

                {!isLoading && errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                {!isLoading && displayedPharmacies.length === 0 ? (
                  <Text style={styles.stateText}>No pharmacies available.</Text>
                ) : null}

                {displayedPharmacies.map((pharmacy) => (
                  <PharmacyCard
                    key={pharmacy.id}
                    pharmacy={pharmacy}
                    onSelect={onSelect}
                    isSelected={Number(pharmacy.id) === Number(currentPharmacyId)}
                  />
                ))}
              </ScrollView>

              {/* PharmaDali Theme-Matched Scrollbar */}
              {isScrollable && (
                <View style={styles.scrollbarTrack}>
                  <Animated.View
                    style={[
                      styles.scrollbarThumb,
                      {
                        height: thumbHeight,
                        transform: [{ translateY: thumbTranslateY }],
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
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
  cardContainer: {
    borderRadius: 14,
    padding: 13,
    marginBottom: 12,
  },
  cardContainerDefault: {
    borderWidth: 1,
    borderColor: '#B8DEF0',
    backgroundColor: '#F5FAFE',
  },
  cardContainerSelected: {
    borderWidth: 1.5,
    borderColor: '#0284c7',
    backgroundColor: '#EAF6FD',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  storeIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pharmacyName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: colors.textColor,
    flexShrink: 1,
  },
  currentBadgeWrap: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginLeft: 6,
  },
  currentBadge: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 8.5,
    color: '#FFFFFF',
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBadgeBg: {
    backgroundColor: '#22C55E',
  },
  closedBadgeBg: {
    backgroundColor: '#EF4444',
  },
  statusBadgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2EBF1',
    marginVertical: 10,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconWrap: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginTop: 1.5,
  },
  pharmacyAddress: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#555',
    flex: 1,
    lineHeight: 16,
  },
  landmarkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 6,
  },
  landmarkIconWrap: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landmarkText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10.5,
    color: '#0369A1',
    flex: 1,
    lineHeight: 15,
  },
  landmarkLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10.5,
    color: '#0284C7',
  },
  pharmacyHours: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDefault: {
    backgroundColor: colors.buttonColor,
  },
  actionButtonActive: {
    backgroundColor: '#0284c7',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
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
  overlayContainer: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    maxHeight: '82%',
    flexDirection: 'column',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  scrollWrapper: {
    flexDirection: 'row',
    marginTop: 16,
    maxHeight: Math.min(Dimensions.get('window').height * 0.58, 480),
  },
  scrollView: {
    flex: 1,
    paddingRight: 6,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  scrollbarTrack: {
    width: 5,
    backgroundColor: '#E0F2FE',
    borderRadius: 3,
    marginLeft: 4,
    marginVertical: 2,
    overflow: 'hidden',
  },
  scrollbarThumb: {
    width: 5,
    backgroundColor: colors.buttonColor,
    borderRadius: 3,
  },
});
