import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Account = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Account</Text>
    </View>
  )
}

export default Account

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