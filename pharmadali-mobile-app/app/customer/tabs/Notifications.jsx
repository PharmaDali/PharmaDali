import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const notifications = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>notifications</Text>
    </View>
  )
}

export default notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
  },
})