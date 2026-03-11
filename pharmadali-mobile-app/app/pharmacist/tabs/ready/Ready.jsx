import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Ready = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl font-bold">Ready Tab</Text>
      <Text className="text-lg">This page will display ready orders.</Text>
      <Text className="text-sm text-gray-500">The contents and functionalities of this tab will be implemented soon!</Text>
    </View>
  )
}

export default Ready

const styles = StyleSheet.create({})