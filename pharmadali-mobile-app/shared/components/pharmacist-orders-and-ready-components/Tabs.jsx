import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@shared/colorPallete';

export default function Tabs({ activeTab, onTabChange, tabs }) {
  return (
    <View className="flex-row justify-around border border-gray-200 bg-white px-2 mx-3 mt-2 rounded-xl shadow-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            className="flex-1 items-center py-3"
            onPress={() => onTabChange(tab)}
          >
            <Text
              className="text-sm"
              style={[
                { fontFamily: 'Poppins-SemiBold' },
                isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {tab}
            </Text>
            {isActive && (
              <View className="absolute bottom-0 w-full h-[3px] rounded-t-full" style={{ backgroundColor: colors.buttonColor }} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeText: {
    color: colors.buttonColor,
  },
  inactiveText: {
    color: '#999999',
  },
});
