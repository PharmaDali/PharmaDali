import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import StatsIcon from '@assets/icons/pharmacist_home/stats_icon.svg'
import { colors } from '@shared/colorPallete'

const Home = () => {
  return (
    <View className="flex-1">
      <View className="m-4 bg-white rounded-lg p-4 shadow-lg">
        <View className="flex-row items-start p-2 pb-0">
          <StatsIcon width={22} height={22} />
          <Text className="ms-2" style={styles.titleText}>
            Quick Stats
          </Text>
        </View>
        <View className="flex-row justify-around">
          <View className="flex-row bg-[#E8F8FF] p-4 rounded-lg items-center mt-4">
            <Text style={styles.pendingCountText}>
              24
            </Text>
            <Text className="ms-2">
              Pending Orders
            </Text>
          </View>
          <View className="flex-row bg-[#D7FAE4] p-4 rounded-lg items-center mt-4">
            <Text style={styles.completedCountText}>
              24
            </Text>
            <Text className="ms-2">
              Completed Orders
            </Text>
          </View>
        </View>
      </View> 
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textColor
  },
  pendingCountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: colors.buttonColor
  },
  completedCountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#60B17E'
  }

})