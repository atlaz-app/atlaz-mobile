import { createMaterialTopTabNavigator, MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { mutate } from 'swr';
import SetupCreatePresetMuscle from './muscle';
import SetupCreatePresetMode from './mode';
import SetupCreatePresetSave from './save';
import SetupCreatePresetVisual from './visual';
import { CreatePresetTabParamList } from '@/types';
import { PresetParam } from '@/enums/Common';
import { usePresetStore, useTrackerStore } from '@/store';
import { BackendPaths, ScreenPath } from '@/enums/Paths';
import { PresetApi } from '@/infrastructure/services/Preset';

const Tab = createMaterialTopTabNavigator<CreatePresetTabParamList>();

type TabNavigationProp = MaterialTopTabNavigationProp<CreatePresetTabParamList>;

export default function TrackerNewPresetLayout() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabNavigationProp>();
  const { name, getPreset } = usePresetStore();
  const { setPreset } = useTrackerStore();

  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.state?.routes[route.state.index as number]?.name;
  }) as keyof CreatePresetTabParamList;

  const { text, onPress } = React.useMemo(() => {
    switch (currentRoute) {
      case PresetParam.Muscle:
        return {
          text: 'Confirm Muscle',
          onPress: () => navigation.navigate(PresetParam.Mode),
        };
      case PresetParam.Mode:
        return {
          text: 'Confirm Mode',
          onPress: () => navigation.navigate(PresetParam.Visual),
        };
      case PresetParam.Visual:
        return {
          text: 'Confirm Visual',
          onPress: () => navigation.navigate('Save'),
        };
      case 'Save':
        return {
          text: name ? 'Save' : 'Continue anyway',
          onPress: async () => {
            const newPreset = getPreset();

            if (newPreset && newPreset.name) {
              const response = await PresetApi.createPreset(newPreset);
              mutate(BackendPaths.Presets, response.data);
            }

            setPreset(newPreset);

            router.navigate(ScreenPath.DashboardTrackerMonitor);
          },
        };
      default:
        return {
          text: 'Confirm Muscle',
          onPress: () => navigation.navigate(PresetParam.Muscle),
        };
    }
  }, [currentRoute, name, setPreset, getPreset, navigation]);

  return (
    <View className="flex-1 bg-black">
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12, color: 'white' },
          tabBarStyle: {
            backgroundColor: 'black',
          },
          tabBarIndicatorStyle: { backgroundColor: 'white' },
          tabBarItemStyle: { width: Dimensions.get('window').width / 3 },
        }}
        initialLayout={{ width: Dimensions.get('window').width }}>
        <Tab.Screen name="Muscle" component={SetupCreatePresetMuscle} />
        <Tab.Screen name="Mode" component={SetupCreatePresetMode} />
        <Tab.Screen name="Visual" component={SetupCreatePresetVisual} />
        <Tab.Screen name="Save" component={SetupCreatePresetSave} />
      </Tab.Navigator>
      <View className="absolute bottom-8 w-full flex items-center px-4" style={{ marginBottom: insets.bottom }}>
        <Pressable
          className="flex flex-row justify-between items-center rounded-xl w-full px-4 border-solid border-[1px] h-[54] bg-white/50"
          onPress={onPress}>
          <Text className="text-white font-semibold text-lg">{text}</Text>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
