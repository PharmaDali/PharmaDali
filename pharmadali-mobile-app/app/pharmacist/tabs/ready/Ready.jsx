import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { ReadyTabs } from '@shared/components/pharmacist-ready-components'

const Ready = () => {

  const [activeTab, setActiveTab] = useState('For Pickup');

  return (
    <View className="flex-1">
      <ReadyTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  )
}

export default Ready

const styles = StyleSheet.create({})