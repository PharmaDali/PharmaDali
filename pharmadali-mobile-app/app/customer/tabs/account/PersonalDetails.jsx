import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '@shared/colorPallete'

const PersonalDetails = () => {
  return (
    <View style={styles.container}>
      <View className="items-center justify-center mt-10 bg-white border border-gray-300 rounded-xl px-4 py-6 mx-4">
        <Text style={styles.title} className="mb-2 text-2xl">Personal Details</Text>
        <View className="flex-row justify-between mt-4">
          <View>
            <Text style={styles.labelText}>First Name: </Text>
            <Text style={styles.labelText}>Last Name: </Text>
            <Text style={styles.labelText}>Birthday: </Text>
            <Text style={styles.labelText}>Contact Number: </Text>
          </View>
          <View>
            <Text style={styles.text}>Denmar</Text>
            <Text style={styles.text}>Redondo</Text>
            <Text style={styles.text}>08/12/2004</Text>
            <Text style={styles.text}>09123456789</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PersonalDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4FF',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  title:{
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  labelText: {
    fontFamily: 'Poppins-Medium',
    color: '#888888',
  },
})