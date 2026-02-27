import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@shared/colorPallete';
import RedStoreIcon from '@assets/icons/red_store_icon.svg';

const branches = [
  {
    id: 1,
    name: "Lally's Pharmacy - Burgos Street Branch",
    address: 'Poblacion 7, Tanauan City, Batangas',
    hours: 'Open: 7 AM - 9 PM',
    isOpen: true,
  },
  {
    id: 2,
    name: "Lally's Pharmacy - Victory Mall Branch",
    address: 'Poblacion 7, Tanauan City, Batangas',
    hours: 'Open: 8 AM - 6 PM',
    isOpen: true,
  },
];

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
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View className="bg-white rounded-t-3xl px-5 pt-6 pb-8" style={{ maxHeight: '55%' }}>
          <Text style={styles.title}>Select Your Pharmacy Branch</Text>
          <Text style={styles.subtitle}>Select Your Pharmacy Branch</Text>
          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {branches.map((branch) => (
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
});
