import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@shared/colorPallete';
import RedStoreIcon from '@assets/icons/red_store_icon.svg';
import { getBranchDataInSelectionPhase } from '@shared/services/selectionPhaseService';

const fallbackBranches = [];

function BranchCard({ branch, onSelect }) {
  return (
    <View className="flex-row items-center border border-blue-200 rounded-xl px-3 py-3 mb-3" style={{ backgroundColor: '#F7FBFE' }}>
      <View className="mr-3">
        <RedStoreIcon width={32} height={32} />
      </View>
      <View className="flex-1">
        <Text style={styles.branchName}>{branch.name}</Text>
        <Text style={styles.branchDetail}>{branch.address}</Text>
        <View className="flex-row items-center mt-1">
          <Text style={styles.branchDetail}>{branch.hours}</Text>
          {branch.isOpen && (
            <View className="bg-green-500 rounded-full px-2 py-0.5 ml-2">
              <Text style={styles.openBadge}>Open now</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        className="rounded-full px-4 py-1.5 ml-2"
        style={{ backgroundColor: colors.buttonColor }}
        onPress={() => onSelect(branch)}
      >
        <Text style={styles.selectText}>Select</Text>
      </Pressable>
    </View>
  );
}

export default function BranchSelectionOverlay({ visible, onSelect }) {
  const [remoteBranches, setRemoteBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    async function fetchBranchData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getBranchDataInSelectionPhase();
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        const mapped = normalized.map((item) => ({
          id: item.id ?? item.branch_id,
          name: item.branch_name,
          address: item.location,
          hours: item.opening_hour && item.closing_hour ? `${item.opening_hour} - ${item.closing_hour}` : 'Store hours unavailable',
          isOpen: typeof item.is_active === 'boolean' ? item.is_active : true,
        }));

        if (isMounted) {
          setRemoteBranches(mapped);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error?.message || 'Failed to load branches.');
          setRemoteBranches([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBranchData();

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const displayedBranches = useMemo(() => {
    if (remoteBranches.length > 0) {
      return remoteBranches;
    }

    return fallbackBranches;
  }, [remoteBranches]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View className="bg-white rounded-t-3xl px-5 pt-6 pb-8" style={{ maxHeight: '55%' }}>
          <Text style={styles.title}>Select Your Pharmacy Branch</Text>
          <Text style={styles.subtitle}>Select Your Pharmacy Branch</Text>
          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {isLoading && <Text style={styles.stateText}>Loading branches...</Text>}

            {!isLoading && errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {!isLoading && displayedBranches.length === 0 ? (
              <Text style={styles.stateText}>No branches available.</Text>
            ) : null}

            {displayedBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} onSelect={onSelect} />
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
  branchName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: colors.textColor,
  },
  branchDetail: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: '#888',
  },
  openBadge: {
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
});
