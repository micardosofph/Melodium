import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LocalDataLifecycle } from './src/services/localData';
import ProgressScreen from './src/screens/ProgressScreen';

import HomeScreen from './src/screens/HomeScreen';
import MetronomeScreen from './src/screens/MetronomeScreen';
import TunerScreen from './src/screens/TunerScreen';
import { DiaryEntryScreen, SocialScreen, UserScreen } from './src/screens/CommunityScreens';
import { EvolutionGalleryScreen, EvolutionPlayerScreen } from './src/screens/EvolutionScreens';
import {
  AddPracticeScreen,
  PracticeScreen,
  RecordPracticeScreen,
  RecordVideoScreen,
} from './src/screens/PracticeScreens';
import {
  ConceptsScreen,
  PathsScreen,
} from './src/screens/LibraryScreens';
import {
  AppGuideScreen,
  LaunchScreen,
  NameScreen,
  ReminderScreen,
  WelcomeScreen,
} from './src/screens/OnboardingScreens';
import { SupportScreen } from './src/screens/SupportScreens';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LocalDataLifecycle />
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Launch">
        <Stack.Screen name="Launch" component={LaunchScreen} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="AppGuide" component={AppGuideScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Name" component={NameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Reminder" component={ReminderScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, animation: 'slide_from_right', animationTypeForReplace: 'push' }} />
        <Stack.Screen name="Social" component={SocialScreen} options={{ headerShown: false, animation: 'slide_from_right', animationTypeForReplace: 'push' }} />
        <Stack.Screen name="DiaryEntry" component={DiaryEntryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="User" component={UserScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Practice" component={PracticeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddPractice" component={AddPracticeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RecordPractice" component={RecordPracticeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RecordVideo" component={RecordVideoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EvolutionGallery" component={EvolutionGalleryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EvolutionPlayer" component={EvolutionPlayerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Paths" component={PathsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Concepts" component={ConceptsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Progress" component={ProgressScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Tuner" component={TunerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Metronome" component={MetronomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
