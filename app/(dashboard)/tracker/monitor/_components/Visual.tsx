import React from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { Button, Dimensions, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SensorCommand, SensorFilter } from 'react-native-neurosdk2';
import clsx from 'clsx';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { mutate } from 'swr';
import { HttpStatusCode } from 'axios';
import { useGlobalStore, useTrackerStore } from '@/store';
import { BackendPaths, ScreenPath } from '@/enums/Paths';
import { TraceApi } from '@/infrastructure/services/Trace';
import { useTrackerConfig } from '@/hooks';

const screenWidth = Dimensions.get('window').width;

export const VisualTracker = () => {
  const defaultEnvelopeRef = Array.from({ length: 50 }, () => useTrackerStore.getState().sessionBase!);
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
  const videoUriRef = React.useRef<string | null>(null); // Store video URI

  const [duration, setDuration] = React.useState<number>(0);
  const [envelope, setEnvelope] = React.useState<{ value: number }[]>(defaultEnvelope);
  const [totalReps, setTotalReps] = React.useState(0);
  const [effectiveReps, setEffectiveReps] = React.useState(0);
  const [traceNotes, setTraceNotes] = React.useState<string>();
  const [isTracking, setTracking] = React.useState(false);
  const [isRecorded, setRecorded] = React.useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = React.useRef<CameraView>(null);

  const startTracking = async () => {
    sensor?.AddEnvelopeDataChanged((data) => {
      if (data !== null && startTimeRef.current) {
        const newEntry = { value: data[0].Sample, timestamp: Date.now() - startTimeRef.current };

        const MAX_GRAPH_DATA_POINTS = 50;

        if (envelope.length === MAX_GRAPH_DATA_POINTS) {
          setEnvelope((prevEnvelope) => {
            const updatedEnvelope = [...prevEnvelope, newEntry];
            updatedEnvelope.shift();

            return updatedEnvelope;
          });
        } else {
          setEnvelope([...envelope, newEntry]);
        }

        if (sampleCountRef.current % 5 === 0) {
          fullEnvelopeRef.current = [...fullEnvelopeRef.current, newEntry];
        }

        // Register new rep peak
        if (muscleStateRef.current !== 'relaxed') {
          currentRepPeakRef.current =
            currentRepPeakRef.current === null || newEntry.value > currentRepPeakRef.current.value
              ? newEntry
              : currentRepPeakRef.current;
        }

        // Register new rep bottom
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

      // Start video recording
      if (cameraRef.current) {
        console.log('1');

        const recording = await cameraRef.current.recordAsync();
        console.log('2');

        videoUriRef.current = recording?.uri;
        console.log('3');
      }
      console.log('4');
    } catch (e) {
      console.log('Failed to start tracking or recording:', e);
    }
  };

  const stopTracking = async () => {
    if (!isTracking) return;

    console.log('peaks', repPeaksRef);
    console.log('bottoms', repBottomsRef);
    console.log('length', repPeaksRef.current.length, repBottomsRef.current.length);
    console.log(fullEnvelopeRef);

    sensor?.RemoveEnvelopeDataChanged();
    try {
      await sensor?.execute(SensorCommand.StopEnvelope);

      // Stop video recording
      if (cameraRef.current) {
        cameraRef.current.stopRecording(); // URI is set from startTracking promise resolution
      }

      const endTime = Date.now();
      if (startTimeRef.current !== null) {
        const durationMs = endTime - startTimeRef.current;
        const durationSeconds = Math.round(durationMs / 1000);
        setDuration(durationSeconds);
      }

      if (currentRepBottomRef.current !== null && repPeaksRef.current.length > 0) {
        repBottomsRef.current = [...repBottomsRef.current, currentRepBottomRef.current];
        currentRepBottomRef.current = null;
      }

      setTracking(false);
      setRecorded(true);
    } catch (e) {
      console.log('Failed to stop tracking or recording:', e);
    }
  };

  const saveTrace = async ({ retry }: { retry: boolean }) => {
    try {
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

      // Append video file if recorded
      if (videoUriRef.current) {
        console.log('Video URI:', videoUriRef.current); // Debug
        const fileExtension = videoUriRef.current.split('.').pop()?.toLowerCase();
        const mimeType = fileExtension === 'mov' ? 'video/quicktime' : 'video/mp4'; // Dynamic MIME
        const fileName = `trace-video-${Date.now()}.${fileExtension}`;

        formData.append('video', {
          uri: videoUriRef.current,
          type: mimeType,
          name: fileName,
        } as any);

        console.log('Sending video with MIME:', mimeType, 'Name:', fileName); // Debug
      }

      console.log(formData);
      console.log('saving...');

      const saveTraceResponse = await TraceApi.createTrace(formData);

      console.log('saved');

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
      videoUriRef.current = null; // Reset video URI

      mutate(BackendPaths.Traces);

      if (!retry) {
        router.navigate(ScreenPath.DashboardTrackerPresetSaved);
      }
    } catch (e) {
      console.log('Failed to save trace:', e);
    }
  };

  // Muscle state manager
  React.useEffect(() => {
    const { repMultiplier, effectiveMultiplier, relaxedMultiplier, repDuration, effectiveDuration } = trackerConfig;

    // Register the start & time of regular a zone
    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value > sessionBase * repMultiplier &&
      muscleStateRef.current === 'relaxed'
    ) {
      muscleStateRef.current = 'regular';
      repStartTimeRef.current = Date.now();

      // Register rep bottom on transition from the relaxed to regular state
      if (currentRepBottomRef.current !== null) {
        repBottomsRef.current = [...repBottomsRef.current, currentRepBottomRef.current];
        currentRepBottomRef.current = null;
      }
    }

    // Register the start & time of effective a zone
    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value > sessionBase * effectiveMultiplier &&
      muscleStateRef.current === 'regular'
    ) {
      muscleStateRef.current = 'effective';
      effectiveStartTimeRef.current = Date.now();
    }

    // Register the end time of effective zone
    if (
      sessionBase &&
      effectiveStartTimeRef.current &&
      envelope?.[envelope.length - 1]?.value < sessionBase * effectiveMultiplier &&
      muscleStateRef.current === 'effective'
    ) {
      effectiveZoneDurationRef.current = Date.now() - effectiveStartTimeRef.current;
    }

    // Register the end time of regular zone
    if (
      sessionBase &&
      repStartTimeRef.current &&
      envelope?.[envelope.length - 1]?.value < sessionBase * repMultiplier &&
      (muscleStateRef.current === 'regular' || muscleStateRef.current === 'effective')
    ) {
      regularZoneDurationRef.current = Date.now() - repStartTimeRef.current;
    }

    // Register a completed rep data
    if (
      sessionBase &&
      envelope?.[envelope.length - 1]?.value < sessionBase * relaxedMultiplier &&
      (muscleStateRef.current === 'regular' || muscleStateRef.current === 'effective')
    ) {
      // Register rep as regular
      if (regularZoneDurationRef.current! >= repDuration * 1000) {
        setTotalReps(totalReps + 1);

        // Register rep peak on transition from the regular/effective to relaxed state
        if (currentRepPeakRef.current !== null) {
          repPeaksRef.current = [...repPeaksRef.current, currentRepPeakRef.current];
        }
      }

      // Register rep as effective
      if (muscleStateRef.current === 'effective' && effectiveZoneDurationRef.current! >= effectiveDuration * 1000) {
        setEffectiveReps(effectiveReps + 1);
      }

      // Restart rep data
      muscleStateRef.current = 'relaxed';
      repStartTimeRef.current = null;
      effectiveZoneDurationRef.current = null;
      currentRepPeakRef.current = null;
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

  if (!permission || !micPermission) {
    return <View />;
  }

  if (!permission.granted || !micPermission?.granted) {
    return (
      <View className="h-screen flex justify-center items-center">
        <Text>We need your permission to show the camera</Text>
        <Button
          onPress={() => {
            requestPermission();
            requestMicPermission();
          }}
          title="grant permission"
        />
      </View>
    );
  }

  const graphOffset = sessionBase && sessionBase - sessionBase / 2;
  const graphMaxValue = sessionBase && sessionBase * 50;

  return (
    <Pressable onPress={handleOutsidePress}>
      <View className="w-full h-full bg-black">
        <View className="h-2/3 w-full top-0">
          <CameraView ref={cameraRef} style={{ flex: 1 }} mode="video" facing="front">
            <View className="h-full flex items-end flex-row w-full justify-center">
              <View className={clsx('absolute top-24 flex flex-row items-center gap-2', !isTracking && 'hidden')}>
                <View className="bg-red-500 w-4 h-4 rounded-full"></View>
                <Text className="text-black font-semibold text-lg">Tap anywhere to stop</Text>
              </View>
              {isRecorded && (
                <Text className="absolute top-64 text-black text-4xl text-center font-bold">
                  Set ready to be saved!
                </Text>
              )}
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
        {!isRecorded ? (
          isTracking ? (
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
                'flex flex-row justify-between items-center mb-12 px-8 py-2 w-full h-1/3',
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
          )
        ) : (
          <View className="w-full px-5">
            <TextInput
              className="bg-white/10 w-full rounded-xl p-3 text-white text-wrap h-[128px] mt-8 mb-6"
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

export default VisualTracker;
