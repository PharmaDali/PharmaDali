import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@shared/theme/colorPalette';

export default function Tabs({ activeTab, onTabChange, tabs, counts = {} }) {
  return (
    <View className="flex-row justify-around border border-gray-200 bg-white px-2 mx-3 mt-2 rounded-xl shadow-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const count = counts[tab] || 0;
        return (
          <TouchableOpacity
            key={tab}
            className="flex-1 items-center py-3"
            onPress={() => onTabChange(tab)}
          >
            <View className="flex-row items-center">
              <Text
                className="text-sm"
                style={[
                  { fontFamily: 'Poppins-SemiBold' },
                  isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {tab}
              </Text>
              {count > 0 && (
                <View 
                  className="ml-1.5 px-1.5 rounded-full items-center justify-center min-w-[18px] h-[18px]" 
                  style={{ backgroundColor: isActive ? colors.buttonColor : '#E0E0E0' }}
                >
                  <Text 
                    className="text-[10px]" 
                    style={{ 
                      fontFamily: 'Poppins-Bold', 
                      color: isActive ? '#FFFFFF' : '#666666',
                      includeFontPadding: false,
                      textAlignVertical: 'center',
                      textAlign: 'center'
                    }}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </View>
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
