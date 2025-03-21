import { View, Text, Dimensions, Pressable, TextInput, Keyboard } from 'react-native';
import React from 'react';

import { router, useFocusEffect } from 'expo-router';

import { SensorCommand, SensorFilter } from 'react-native-neurosdk2';

import { LineChart } from 'react-native-gifted-charts';
import Ionicons from '@expo/vector-icons/Ionicons';
import clsx from 'clsx';
import { HttpStatusCode } from 'axios';
import { mutate } from 'swr';
import { useGlobalStore } from '@/store';
import { useTrackerStore } from '@/store/trackerStore';
import { BackendPaths, ScreenPath } from '@/enums/Paths';
import { TraceApi } from '@/infrastructure/services/Trace';

const screenWidth = Dimensions.get('window').width;

export const BlindTracker = () => {
  const defaultEnvelopeRef = Array.from({ length: 50 }, () => useTrackerStore.getState().sessionBase!);
  const defaultEnvelope = Array.from({ length: 50 }, () => ({
    value: useTrackerStore.getState().sessionBase!,
  }));
  const { activeSensor, sensorList } = useGlobalStore();

  const sensor = sensorList?.[activeSensor!].sensor;
  const { sessionBase, setSessionBase, config, tracePreset } = useTrackerStore();

  const sampleCountRef = React.useRef(0);
  const envelopeRef = React.useRef<number[]>(defaultEnvelopeRef);
  const fullEnvelopeRef = React.useRef<number[]>([]);
  const repPeaksRef = React.useRef<number[]>([]);
  const currentRepPeakRef = React.useRef<number | null>(null);
  const muscleStateRef = React.useRef<'relaxed' | 'regular' | 'effective'>('relaxed');
  const startTimeRef = React.useRef<number | null>(null);

  const [duration, setDuration] = React.useState<number>(0);
  const [envelope, setEnvelope] = React.useState<{ value: number }[]>(defaultEnvelope);
  const [totalReps, setTotalReps] = React.useState(0);
  const [effectiveReps, setEffectiveReps] = React.useState(0);
  const [traceNotes, setTraceNotes] = React.useState<string>();

  const [isTracking, setTracking] = React.useState(false);
  const [isRecorded, setRecorded] = React.useState(false);

  const startTracking = async () => {
    sensor?.AddEnvelopeDataChanged((data) => {
      if (data !== null && sampleCountRef.current > 5) {
        const newEntry = data[0].Sample;

        envelopeRef.current = [...envelopeRef.current, newEntry];

        const MAX_DATA_POINTS = 50;

        if (envelopeRef.current.length > MAX_DATA_POINTS) {
          envelopeRef.current.shift();
        }

        const envelopeGraphMapping = envelopeRef.current.map((value) => ({
          value,
        }));

        setEnvelope([...envelopeGraphMapping]);

        if (sampleCountRef.current % 10 === 0) {
          fullEnvelopeRef.current = [...fullEnvelopeRef.current, newEntry];
        }

        if (muscleStateRef.current !== 'relaxed') {
          console.log('here');
          currentRepPeakRef.current =
            currentRepPeakRef.current === null ? newEntry : Math.max(currentRepPeakRef.current, newEntry);
        }
      }

      sampleCountRef.current = sampleCountRef.current + 1;
    });

    const filters = [
      SensorFilter.FilterBSFBwhLvl2CutoffFreq45_55Hz,
      SensorFilter.FilterHPFBwhLvl2CutoffFreq10Hz,
      SensorFilter.FilterLPFBwhLvl2CutoffFreq400Hz,
    ];
    sensor?.setHardwareFilters(filters);

    try {
      await sensor?.execute(SensorCommand.StartEnvelope);
      startTimeRef.current = Date.now();
      setTracking(true);
    } catch (e) {
      console.log('Failed start envelope:', e);
    }
  };

  console.log(currentRepPeakRef.current);

  const stopTracking = async () => {
    if (!isTracking) return;

    sensor?.RemoveEnvelopeDataChanged();
    try {
      await sensor?.execute(SensorCommand.StopEnvelope);
      const endTime = Date.now();
      if (startTimeRef.current !== null) {
        const durationMs = endTime - startTimeRef.current;
        const durationSeconds = Math.round(durationMs / 1000);
        setDuration(durationSeconds);
      }
      setTracking(false);
      setRecorded(true);
    } catch (e) {
      console.log('Failed start envelope:', e);
    }
  };

  const saveTrace = async ({ retry }: { retry: boolean }) => {
    const saveTraceResponse = await TraceApi.createTrace({
      mode: config!.mode,
      muscle: config!.muscle,
      visual: config!.visual,
      duration,
      totalReps,
      effectiveReps,
      envelopeBase: sessionBase!,
      effectiveness: Number(((effectiveReps / totalReps) * 100 || 0).toFixed(0)),
      envelopeData: fullEnvelopeRef.current,
      repPeaks: repPeaksRef.current,
      presetId: tracePreset,
      notes: traceNotes,
    });

    if (saveTraceResponse.status !== HttpStatusCode.Created) return;

    setRecorded(false);
    setTotalReps(0);
    setEffectiveReps(0);
    setDuration(0);
    setTraceNotes(undefined);
    muscleStateRef.current = 'relaxed';
    sampleCountRef.current = 0;
    fullEnvelopeRef.current = [];
    repPeaksRef.current = [];
    currentRepPeakRef.current = null;

    mutate(BackendPaths.Traces);

    if (!retry) {
      router.navigate(ScreenPath.DashboardTrackerPresetSaved);
    }
  };

  React.useEffect(() => {
    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value > sessionBase * 10 &&
      muscleStateRef.current === 'relaxed'
    ) {
      muscleStateRef.current = 'regular';
    }

    if (sessionBase && envelope?.[envelope.length - 1]?.value > sessionBase * 35) {
      muscleStateRef.current = 'effective';
    }

    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value < sessionBase * 4 &&
      (muscleStateRef.current === 'regular' || muscleStateRef.current === 'effective')
    ) {
      if (muscleStateRef.current === 'effective') {
        setEffectiveReps(effectiveReps + 1);
      }
      muscleStateRef.current = 'relaxed';
      setTotalReps(totalReps + 1);

      if (currentRepPeakRef.current !== null) {
        repPeaksRef.current = [...repPeaksRef.current, currentRepPeakRef.current];
        currentRepPeakRef.current = null;
      }
    }
  }, [envelope, effectiveReps, sessionBase, totalReps]);

  const graphOffset = sessionBase && sessionBase - sessionBase / 2;

  const graphMaxValue = sessionBase && sessionBase * 50;

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSessionBase(undefined);
      };
    }, [setSessionBase]),
  );

  const handleOutsidePress = () => {
    Keyboard.dismiss();
    if (isTracking) stopTracking();
  };

  return (
    <Pressable onPress={handleOutsidePress}>
      <View className="w-full h-full pt-[180px] flex items-center justify-between bg-black">
        <View className={clsx('absolute top-24 flex flex-row items-center gap-2', !isTracking && 'hidden')}>
          <View className="bg-red-500 w-4 h-4 rounded-full"></View>
          <Text className="text-white font-semibold text-lg">Tap anywhere to stop</Text>
        </View>

        <View className="flex flex-row justify-between w-full px-16">
          <View className="flex items-start">
            <Text className="text-white text-3xl">{totalReps}</Text>
            <Text className="text-white/50">Total</Text>
          </View>

          <View className="flex items-end">
            <Text className="text-white text-3xl">{effectiveReps}</Text>
            <Text className="text-white/50">Effective</Text>
          </View>
        </View>
        <Text className="text-white text-6xl mt-4 font-bold">
          {((effectiveReps / totalReps) * 100 || 0).toFixed(0)}%
        </Text>
        {!isRecorded ? (
          <>
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
            <View
              className={clsx(
                'flex flex-row justify-between items-center mb-12  px-8 py-2 w-full rounded-full',
                isTracking && 'invisible pointer-events-none',
              )}>
              <Pressable onPress={() => router.navigate(ScreenPath.DashboardTrackerPresetSaved)}>
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
          </>
        ) : (
          <View className="h-[386px] w-full px-5">
            <Text className="text-white text-4xl text-center font-bold ">Set ready to be saved!</Text>
            <TextInput
              className="bg-white/10 w-full rounded-xl p-3 text-white text-wrap h-[128px] mt-14 mb-8"
              multiline
              cursorColor="white"
              selectionColor="white"
              placeholder="Add notes"
              value={traceNotes}
              onChangeText={(text) => setTraceNotes(text)}
            />
            <View className="flex flex-row gap-4">
              <Pressable
                onPress={() => saveTrace({ retry: true })}
                className="basis-1/6 flex items-center justify-center rounded-xl h-14">
                <Ionicons name="refresh-outline" size={24} color="white" />
              </Pressable>
              <Pressable
                onPress={() => saveTrace({ retry: false })}
                className="flex-1 bg-white flex items-center justify-center rounded-xl h-14">
                <Ionicons name="checkmark" size={24} color="black" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};
