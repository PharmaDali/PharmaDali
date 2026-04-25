import { Redirect } from 'expo-router';
import Constants from 'expo-constants';

export default function Index() {
  const appType = Constants.expoConfig?.extra?.appType || 'customer';
  
  if (appType === 'pharmacist') {
    return <Redirect href="/pharmacist" />;
  }
  
  return <Redirect href="/customer" />;
}
