import React from 'react';

import Svg, { Circle } from 'react-native-svg';
import { Pressable, Text, View } from 'react-native';
import { SensorCommand, SensorFilter } from 'react-native-neurosdk2';
import { router, useFocusEffect } from 'expo-router';
import { useTrackerStore } from '@/store/trackerStore';
import { useGlobalStore } from '@/store';
import { calcAvg } from '@/utils';
import { ScreenPath } from '@/enums/Paths';

export const Calibrator = () => {
  const { sessionBase, setSessionBase } = useTrackerStore();
  const { activeSensor, sensorList, setDashboardTabBar } = useGlobalStore();
  const [isConnected, setIsConnected] = React.useState(!!activeSensor);

  const sampleCountRef = React.useRef(0);
  const envelopeRef = React.useRef<number[]>([]);
  const [envelope, setEnvelope] = React.useState<number[]>([]);
  const [isTracking, setTracking] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setIsConnected(true);
        setDashboardTabBar(true);
      };
    }, []),
  );

  const MAX_DATA_POINTS = 100;
  const CIRCLE_RADIUS = 45;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  const calibrateSensor = async () => {
    if (sensorList?.[activeSensor!]?.connected) {
      const sensor = sensorList?.[activeSensor!].sensor;

      if (isTracking) return;
      envelopeRef.current = [];
      setEnvelope([]);
      sampleCountRef.current = 0;

      sensor?.AddEnvelopeDataChanged((data) => {
        if (data !== null && sampleCountRef.current > 5) {
          console.log(envelopeRef.current, envelope, sampleCountRef.current);

          const newEntry = data[0].Sample;

          envelopeRef.current = [...envelopeRef.current, newEntry];

          if (envelopeRef.current.length > MAX_DATA_POINTS) {
            sensor?.RemoveEnvelopeDataChanged();
            sensor?.execute(SensorCommand.StopEnvelope);

            const base = calcAvg(envelopeRef.current);
            setSessionBase(base);
            setTracking(false);
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
    } else {
      setIsConnected(false);
      router.push(ScreenPath.DashboardProfile);
    }
  };

  // Calculate progress (0 to 1) based on envelope length
  const progress = envelope.length / MAX_DATA_POINTS;
  // Calculate the stroke offset to animate the fill
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  console.log('base', sessionBase);

  return (
    <Pressable onPress={calibrateSensor}>
      <View className="w-full h-full pt-[180px] flex items-center bg-black">
        <Svg height="50%" width="50%" viewBox="0 0 100 100">
          {/* Background circle (gray outline) */}
          <Circle cx="50" cy="50" r={CIRCLE_RADIUS} stroke="gray" opacity={0.5} strokeWidth="10" fill="transparent" />
          {/* Progress circle (white, fills as calibration progresses) */}
          <Circle
            cx="50"
            cy="50"
            r={CIRCLE_RADIUS}
            stroke="white"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={isTracking ? strokeDashoffset : CIRCLE_CIRCUMFERENCE}
            rotation="-90" // Start from the top
            origin="50, 50" // Rotate around the center
          />
        </Svg>
        {isConnected ? (
          <>
            <Text className="text-white text-center text-4xl font-bold w-3/4">
              {isTracking ? 'Calibrating...' : 'Calibrate device before starting'}
            </Text>
            <Text className="text-white/50 text-base mt-3">Keep muscle still & relaxed</Text>
            {!isTracking && <Text className="text-white text-lg mt-20">Tap anywhere to start</Text>}
          </>
        ) : (
          <>
            <Text className="text-white text-center text-4xl font-bold w-full">No sensors connected</Text>
            <Text className="text-white/50 text-base mt-3">Go to Profile and connect sensors</Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

export default Calibrator;
