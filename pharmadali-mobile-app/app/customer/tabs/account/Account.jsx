import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { colors } from '@shared/colorPallete'
import AccountIcon from '@assets/icons/account_icon.svg'
import ArrowForwardIcon from '@assets/icons/arrow_forward_icon.svg'
import EditIcon from '@assets/icons/edit_icon.svg'

const Account = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.card} className="m-4 p-6 my-10 rounded-xl border border-gray-200 items-center">
        <Text style={styles.textSemiBold} className="text-2xl">My Profile</Text>

        <View className="items-center mt-4">
          <View className="w-20 h-20 rounded-full items-center justify-center overflow-hidden"
            style={styles.defaultPicture}>
            <Text style={styles.textBold} className="text-3xl">
              D
            </Text>
          </View>
          <TouchableOpacity className="w-6 h-6 rounded-full items-center justify-center -mt-3 ml-10">
            <EditIcon width={25} height={25} className="text-white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.textSemiBoldDark} className="text-lg mt-2">Denmar Redondo</Text>
        <Text style={styles.textLight} className="text-sm">09123456789</Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        className="mx-4 px-4 py-4 rounded-xl border border-gray-200 flex-row items-center"
        onPress={() => router.push('/customer/tabs/account/PersonalDetails')}
      >
        <AccountIcon width={28} height={28} />
        <Text style={styles.textMedium} className="flex-1 text-base ml-3">Personal Details</Text>
        <ArrowForwardIcon width={18} height={18} />
      </TouchableOpacity>
    </View>
  )
}

export default Account

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4FF',
  },
  textMedium: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  textBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  textSemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  textSemiBoldDark: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
  },
  textLight: {
    fontFamily: 'Poppins-Medium',
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
  },
  defaultPicture: {
    backgroundColor: colors.primary,
  },
})