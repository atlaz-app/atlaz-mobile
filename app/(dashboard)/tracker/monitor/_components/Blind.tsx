import { View, Text, Dimensions, Pressable, TextInput, Keyboard } from 'react-native';
import React from 'react';

import { router, useFocusEffect } from 'expo-router';

import { SensorCommand, SensorFilter } from 'react-native-neurosdk2';

import { LineChart } from 'react-native-gifted-charts';
import Ionicons from '@expo/vector-icons/Ionicons';
import clsx from 'clsx';
import { mutate } from 'swr';
import { HttpStatusCode } from 'axios';
import { useGlobalStore } from '@/store';
import { useTrackerStore } from '@/store/trackerStore';
import { BackendPaths, ScreenPath } from '@/enums/Paths';
import { useTrackerConfig } from '@/hooks';
import { TraceApi } from '@/infrastructure/services/Trace';

const screenWidth = Dimensions.get('window').width;

export const BlindTracker = () => {
  const defaultEnvelope = Array.from({ length: 50 }, () => ({
    value: useTrackerStore.getState().sessionBase!,
  }));
  const { activeSensor, sensorList } = useGlobalStore();

  const sensor = sensorList?.[activeSensor!].sensor;
  const { sessionBase, setSessionBase, preset, presetId } = useTrackerStore();
  const trackerConfig = useTrackerConfig(preset!);

  const sampleCountRef = React.useRef(0);
  const fullEnvelopeRef = React.useRef<{ value: number; timestamp: number }[]>([]);
  const repPeaksRef = React.useRef<{ value: number; timestamp: number }[]>([]);
  const currentRepPeakRef = React.useRef<{ value: number; timestamp: number } | null>(null);
  const repBottomsRef = React.useRef<{ value: number; timestamp: number }[]>([]);
  const currentRepBottomRef = React.useRef<{ value: number; timestamp: number } | null>(null);
  const muscleStateRef = React.useRef<'relaxed' | 'regular' | 'effective'>('relaxed');
  const startTimeRef = React.useRef<number | null>(null);
  const repStartTimeRef = React.useRef<number | null>(null);
  const effectiveStartTimeRef = React.useRef<number | null>(null);
  const regularZoneDurationRef = React.useRef<number | null>(null);
  const effectiveZoneDurationRef = React.useRef<number | null>(null);

  const [duration, setDuration] = React.useState<number>(0);
  const [envelope, setEnvelope] = React.useState<{ value: number }[]>(defaultEnvelope);
  const [totalReps, setTotalReps] = React.useState(0);
  const [effectiveReps, setEffectiveReps] = React.useState(0);
  const [traceNotes, setTraceNotes] = React.useState<string>();
  const [isTracking, setTracking] = React.useState(false);
  const [isRecorded, setRecorded] = React.useState(false);

  const startTracking = async () => {
    sensor?.AddEnvelopeDataChanged((data) => {
      if (data !== null && sampleCountRef.current > 5 && startTimeRef.current) {
        const newEntry = { value: data[0].Sample, timestamp: Date.now() - startTimeRef.current };

        const MAX_DATA_POINTS = 50;

        if (envelope.length === MAX_DATA_POINTS) {
          setEnvelope((prevEnvelope) => {
            const updatedEnvelope = [...prevEnvelope, newEntry];
            updatedEnvelope.shift();

            return updatedEnvelope;
          });
        } else {
          setEnvelope([...envelope, newEntry]);
        }

        if (sampleCountRef.current % 10 === 0) {
          fullEnvelopeRef.current = [...fullEnvelopeRef.current, newEntry];
        }

        if (muscleStateRef.current !== 'relaxed') {
          currentRepPeakRef.current =
            currentRepPeakRef.current === null || newEntry.value > currentRepPeakRef.current.value
              ? newEntry
              : currentRepPeakRef.current;
        }

        if (muscleStateRef.current !== 'regular' && muscleStateRef.current !== 'effective') {
          currentRepBottomRef.current =
            currentRepBottomRef.current === null || newEntry.value < currentRepBottomRef.current.value
              ? newEntry
              : currentRepBottomRef.current;
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

  // console.log('peaks', repPeaksRef);
  // console.log('bottoms', repBottomsRef);
  console.log('length', repPeaksRef.current.length, repBottomsRef.current.length);

  const stopTracking = async () => {
    if (!isTracking) return;
    console.log('peaks', repPeaksRef);
    console.log('bottoms', repBottomsRef);
    console.log('length', repPeaksRef.current.length, repBottomsRef.current.length);

    sensor?.RemoveEnvelopeDataChanged();
    try {
      await sensor?.execute(SensorCommand.StopEnvelope);
      const endTime = Date.now();
      if (startTimeRef.current !== null) {
        const durationMs = endTime - startTimeRef.current;
        const durationSeconds = Math.round(durationMs / 1000);
        setDuration(durationSeconds);
      }

      if (
        currentRepBottomRef.current !== null &&
        repPeaksRef.current.length > 0 &&
        totalReps === repBottomsRef.current.length + 1
      ) {
        repBottomsRef.current = [...repBottomsRef.current, currentRepBottomRef.current];
        currentRepBottomRef.current = null;
      }

      setTracking(false);
      setRecorded(true);
    } catch (e) {
      console.log('Failed start envelope:', e);
    }
  };

  const saveTrace = async ({ retry }: { retry: boolean }) => {
    const envelopeData = [
      ...fullEnvelopeRef.current.map((sample) => ({ ...sample, position: 'neutral' })),
      ...repPeaksRef.current.map((peak) => ({ ...peak, position: 'peak' })),
      ...repBottomsRef.current.map((bottom) => ({ ...bottom, position: 'bottom' })),
    ];

    envelopeData.sort((a, b) => a.timestamp - b.timestamp);

    const formData = new FormData();
    const traceData = {
      mode: preset!.mode,
      muscle: preset!.muscle,
      visual: preset!.visual,
      duration,
      totalReps,
      effectiveReps,
      envelopeBase: sessionBase!,
      effectiveness: Number(((effectiveReps / totalReps) * 100 || 0).toFixed(0)),
      envelopeData,
      presetId: presetId,
      notes: traceNotes,
    };

    formData.append('data', JSON.stringify(traceData));

    const saveTraceResponse = await TraceApi.createTrace(formData);

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
    currentRepBottomRef.current = null;

    mutate(BackendPaths.Traces);

    if (!retry) {
      router.navigate(ScreenPath.DashboardTrackerPresetSaved);
    }
  };

  React.useEffect(() => {
    const { repMultiplier, effectiveMultiplier, relaxedMultiplier, repDuration, effectiveDuration } = trackerConfig;

    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value > sessionBase * repMultiplier &&
      muscleStateRef.current === 'relaxed'
    ) {
      muscleStateRef.current = 'regular';
      repStartTimeRef.current = Date.now();

      if (currentRepBottomRef.current !== null && totalReps === repBottomsRef.current.length + 1) {
        repBottomsRef.current = [...repBottomsRef.current, currentRepBottomRef.current];
        currentRepBottomRef.current = null;
      }
    }

    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value > sessionBase * effectiveMultiplier &&
      muscleStateRef.current === 'regular'
    ) {
      muscleStateRef.current = 'effective';
      effectiveStartTimeRef.current = Date.now();
    }

    if (
      sessionBase &&
      repStartTimeRef.current &&
      envelope?.[envelope.length - 1]?.value < sessionBase * repMultiplier &&
      (muscleStateRef.current === 'regular' || muscleStateRef.current === 'effective')
    ) {
      regularZoneDurationRef.current = Date.now() - repStartTimeRef.current;
    }

    if (
      sessionBase &&
      effectiveStartTimeRef.current &&
      envelope?.[envelope.length - 1]?.value < sessionBase * effectiveMultiplier &&
      muscleStateRef.current === 'effective'
    ) {
      effectiveZoneDurationRef.current = Date.now() - effectiveStartTimeRef.current;
    }

    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value < sessionBase * relaxedMultiplier &&
      (muscleStateRef.current === 'regular' || muscleStateRef.current === 'effective')
    ) {
      if (muscleStateRef.current === 'effective' && effectiveZoneDurationRef.current! >= effectiveDuration * 1000) {
        setEffectiveReps(effectiveReps + 1);
      }

      if (regularZoneDurationRef.current! >= repDuration * 1000) {
        setTotalReps(totalReps + 1);

        if (currentRepPeakRef.current !== null) {
          repPeaksRef.current = [...repPeaksRef.current, currentRepPeakRef.current];
          currentRepPeakRef.current = null;
        }
      }

      muscleStateRef.current = 'relaxed';
      repStartTimeRef.current = null;
      effectiveZoneDurationRef.current = null;
      regularZoneDurationRef.current = null;
    }
  }, [envelope, effectiveReps, sessionBase, totalReps, trackerConfig]);

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

  const graphOffset = sessionBase && sessionBase - sessionBase / 2;

  const graphMaxValue = sessionBase && sessionBase * 50;

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
                  <Text className="text-white text-2xl font-semibold">{preset?.name || 'Workout'}</Text>
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

export default BlindTracker;
