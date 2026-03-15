import { StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import React from 'react'
import { LineChart } from 'react-native-gifted-charts'
import StatsIcon from '@assets/icons/pharmacist_home/stats_icon.svg'
import ForecastIcon from '@assets/icons/pharmacist_home/forecast_icon.svg'
import DemandAlertIcon from '@assets/icons/pharmacist_home/demand_alert_icon.svg'
import BiogesicImg from '@assets/images/biogesic_img.png'
import SolmuxImg from '@assets/images/solmux_img.png'
import { colors } from '@shared/colorPallete'

const TRENDING_MEDICINES = [
  { name: 'Biogesic', generic: 'Paracetamol', image: BiogesicImg },
  { name: 'Solmux', generic: 'Carbocisteine', image: SolmuxImg },
]

const CHART_DATA = [
  { value: 15, label: '9 AM' },
  { value: 20, label: '12 PM' },
  { value: 30, label: '3 PM' },
  { value: 35, label: '6 PM' },
  { value: 25, label: '6 PM' },
  { value: 20, label: '' },
]

const QuickStats = () => (
  <View className="m-4 mb-2 bg-white rounded-lg p-4 shadow-lg">
    <View className="flex-row items-start p-2 pb-0">
      <StatsIcon width={22} height={22} />
      <Text className="ms-2" style={styles.titleText}>
        Quick Stats
      </Text>
    </View>
    <View className="mt-4 flex-row flex-wrap gap-3">
      <View className="flex-row bg-[#E8F8FF] p-4 rounded-lg items-center flex-1 min-w-[140px]">
        <Text style={styles.pendingCountText}>24</Text>
        <Text className="ms-2 flex-1" style={styles.statsLabelText}>Pending Orders</Text>
      </View>
      <View className="flex-row bg-[#D7FAE4] p-4 rounded-lg items-center flex-1 min-w-[140px]">
        <Text style={styles.completedCountText}>24</Text>
        <Text className="ms-2 flex-1" style={styles.statsLabelText}>Completed Orders</Text>
      </View>
    </View>
  </View>
)

const DemandForecast = () => (
  <View className="mx-4 my-2 bg-white rounded-lg p-4 shadow-lg">
    <View className="flex-row items-center mb-1">
      <ForecastIcon width={22} height={22} />
      <Text className="ms-2" style={styles.titleText}>AI Demand Forecast</Text>
    </View>
    <Text style={styles.subtitleText}>Friday, February 6 ▾</Text>

    <View className="mt-3 mb-2">
      <LineChart
        data={CHART_DATA}
        width={250}
        height={120}
        maxValue={40}
        noOfSections={3}
        spacing={44}
        initialSpacing={10}
        color="#48AAD9"
        thickness={2}
        dataPointsColor="#48AAD9"
        dataPointsRadius={5}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        yAxisColor="transparent"
        xAxisColor="#eee"
        rulesColor="#eee"
        curved
        areaChart
        startFillColor="rgba(72, 170, 217, 0.15)"
        endFillColor="rgba(72, 170, 217, 0.01)"
        startOpacity={0.3}
        endOpacity={0}
        highlightedRange={{
          from: 25,
          to: 40,
          color: 'rgba(253, 216, 53, 0.2)',
        }}
      />
    </View>

    <View className="flex-row justify-between mt-2">
      <View>
        <View className="flex-row items-center mb-1">
          <View className="w-3 h-3 rounded-full bg-[#FDD835] mr-2" />
          <Text style={styles.legendText}>High Demand</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-[#66BB6A] mr-2" />
          <Text style={styles.legendText}>Low Demand</Text>
        </View>
      </View>
      <View className="items-end">
        <Text style={styles.statValueText}>125 orders</Text>
        <Text style={styles.predictionText}>Today's Prediction: 185 orders</Text>
      </View>
    </View>
  </View>
)

const DemandAlert = () => (
  <View className="mx-4 my-2 mb-4 bg-white rounded-lg p-4 shadow-lg">
    <View className="flex-row items-center mb-1">
      <DemandAlertIcon width={22} height={22} />
      <Text className="ms-2" style={styles.titleText}>AI Demand Alert</Text>
    </View>
    <Text style={styles.subtitleText}>Trending Medicines</Text>

    {TRENDING_MEDICINES.map((med, i) => (
      <View key={i} className="flex-row items-center bg-[#F5F9FF] rounded-lg p-3 mt-2">
        <View className="w-12 h-12 bg-white rounded items-center justify-center mr-3">
          <Image source={med.image} className="w-12 h-12" resizeMode="contain" />
        </View>
        <View>
          <Text style={styles.medNameText}>{med.name}</Text>
          <Text style={styles.medGenericText}>({med.generic})</Text>
        </View>
      </View>
    ))}
  </View>
)

const Home = () => {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <QuickStats />
      <DemandForecast />
      <DemandAlert />
    </ScrollView>
  )
}

export default Home

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textColor,
  },
  subtitleText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  pendingCountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: colors.buttonColor,
  },
  completedCountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#60B17E',
  },
  statsLabelText: {
    flexShrink: 1,
  },
  axisText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: '#aaa',
  },
  legendText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.textColor,
  },
  statValueText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.textColor,
  },
  predictionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#888',
  },
  medNameText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.textColor,
  },
  medGenericText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#888',
  },
})