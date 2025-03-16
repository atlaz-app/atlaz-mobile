import React from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { Button, Dimensions, Pressable, Text, View } from 'react-native';

import { router, useFocusEffect } from 'expo-router';

import { SensorCommand, SensorFilter } from 'react-native-neurosdk2';

import clsx from 'clsx';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGlobalStore, useTrackerStore } from '@/store';

const screenWidth = Dimensions.get('window').width;

const defaultEnvelope = Array.from({ length: 50 }, () => ({ value: 0.0009 }));

export const VisualTracker = () => {
  const { activeSensor, sensorList } = useGlobalStore();

  const sensor = sensorList?.[activeSensor!].sensor;

  const { sessionBase, setSessionBase, config } = useTrackerStore();

  const sampleCountRef = React.useRef(0);
  const envelopeRef = React.useRef<{ value: number }[]>(defaultEnvelope);
  const [envelope, setEnvelope] = React.useState<{ value: number }[]>(defaultEnvelope);

  const [totalReps, setTotalReps] = React.useState(0);
  const [effectiveReps, setEffectiveReps] = React.useState(0);

  const [isTracking, setTracking] = React.useState(false);
  const [muscleState, setMuscleState] = React.useState('relaxed');

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);

  const startTracking = async () => {
    sensor?.AddEnvelopeDataChanged((data) => {
      if (data !== null && sampleCountRef.current > 5) {
        const newEntry = {
          value: data[0].Sample,
        };

        envelopeRef.current = [...envelopeRef.current, newEntry];

        const MAX_DATA_POINTS = 50;

        if (envelopeRef.current.length > MAX_DATA_POINTS) {
          envelopeRef.current.shift();
        }

        setEnvelope([...envelopeRef.current]);
      }

      sampleCountRef.current = sampleCountRef.current + 1;
    });

    const filters = [
      SensorFilter.FilterBSFBwhLvl2CutoffFreq45_55Hz,
      SensorFilter.FilterBSFBwhLvl2CutoffFreq55_65Hz,
      SensorFilter.FilterHPFBwhLvl2CutoffFreq10Hz,
      SensorFilter.FilterLPFBwhLvl2CutoffFreq400Hz,
    ];
    sensor?.setHardwareFilters(filters);

    try {
      await sensor?.execute(SensorCommand.StartEnvelope);
      setTracking(true);
    } catch (e) {
      console.log('Failed start envelope:', e);
    }
  };

  const stopTracking = async () => {
    sensor?.RemoveEnvelopeDataChanged();
    try {
      await sensor?.execute(SensorCommand.StopEnvelope);
      setTracking(false);
      setTotalReps(0);
      setEffectiveReps(0);
      setMuscleState('relaxed');
      sampleCountRef.current = 0;
    } catch (e) {
      console.log('Failed start envelope:', e);
    }
  };

  React.useEffect(() => {
    if (sessionBase && envelope?.[envelope.length - 1]?.value > sessionBase * 10 && muscleState === 'relaxed') {
      setMuscleState('regular');
    }

    if (sessionBase && envelope?.[envelope.length - 1]?.value > sessionBase * 35) {
      setMuscleState('effective');
    }

    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value < sessionBase * 4 &&
      (muscleState === 'regular' || muscleState === 'effective')
    ) {
      setMuscleState('relaxed');
      setTotalReps(totalReps + 1);

      if (muscleState === 'effective') {
        setEffectiveReps(effectiveReps + 1);
      }
    }
  }, [envelope, effectiveReps, muscleState, sessionBase, totalReps]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSessionBase(undefined);
      };
    }, [setSessionBase]),
  );

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="h-screen flex justify-center items-center">
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const graphOffset = sessionBase && sessionBase - sessionBase / 2;

  const graphMaxValue = sessionBase && sessionBase * 50;

  return (
    <Pressable onPress={stopTracking}>
      <View className="w-full h-full bg-black">
        <View className="h-2/3 w-full top-0">
          <CameraView ref={cameraRef}>
            <View className="h-full flex items-end flex-row w-full justify-center">
              <View className={clsx('absolute top-24 flex flex-row items-center gap-2', !isTracking && 'hidden')}>
                <View className="bg-red-500 w-4 h-4 rounded-full"></View>
                <Text className="text-black font-semibold text-lg">Tap anywhere to stop</Text>
              </View>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,1)']}
                locations={[0, 0.8]}
                style={{
                  flex: 1,
                  gap: 84,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingTop: 128,
                  paddingBottom: 16,
                }}>
                <View className="flex items-start">
                  <Text className="text-white text-3xl">{totalReps}</Text>
                  <Text className="text-white/50">Total</Text>
                </View>
                <Text className="text-white text-4xl mt-4 font-bold">
                  {((effectiveReps / totalReps) * 100 || 0).toFixed(0)}%
                </Text>
                <View className="flex items-end">
                  <Text className="text-white text-3xl">{effectiveReps}</Text>
                  <Text className="text-white/50">Effective</Text>
                </View>
              </LinearGradient>
            </View>
          </CameraView>
        </View>
        {isTracking ? (
          <LineChart
            data={envelope}
            width={screenWidth - 20}
            adjustToWidth
            curved
            thickness={3}
            hideDataPoints
            maxValue={graphMaxValue}
            mostNegativeValue={0}
            hideRules
            yAxisOffset={graphOffset}
            height={200}
            showYAxisIndices={false}
            showXAxisIndices={false}
            showFractionalValues={false}
            hideAxesAndRules
            hideYAxisText
            yAxisLabelWidth={0}
            color={'white'}
          />
        ) : (
          <View
            className={clsx(
              'flex flex-row justify-between items-center mb-12  px-8 py-2 w-full h-1/3',
              isTracking && 'invisible pointer-events-none',
            )}>
            <Pressable onPress={() => router.navigate('/(dashboard)/tracker/preset/saved')}>
              <View className="flex flex-row gap-4 items-center">
                <Ionicons size={24} color="white" name="settings-outline" />
                <Text className="text-white text-2xl font-semibold">{config?.name || 'Workout'}</Text>
              </View>
            </Pressable>
            <Pressable onPress={startTracking}>
              <View className="bg-white p-4 rounded-full">
                <Ionicons size={24} color="black" name="play" />
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
};
