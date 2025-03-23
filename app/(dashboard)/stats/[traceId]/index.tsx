import React from 'react';
import { Dimensions, SafeAreaView, Text } from 'react-native';
import useSWR from 'swr';
import { useLocalSearchParams } from 'expo-router';
import { BarChart } from 'react-native-gifted-charts';
import { TraceApi } from '@/infrastructure/services/Trace';
import { BackendPaths } from '@/enums/Paths';

const screenWidth = Dimensions.get('window').width;

export default function Stats() {
  const { traceId } = useLocalSearchParams<{ traceId: string }>();

  const { data } = useSWR(BackendPaths.TraceById(traceId), async () => {
    const response = await TraceApi.getTraceById(traceId);
    return response.data;
  });

  const repPeakData = React.useMemo(
    () =>
      data?.repPeaks &&
      JSON.parse(data.repPeaks).map((value: number) => ({
        value,
      })),
    [data],
  );

  return (
    <SafeAreaView className="justify-center w-full h-full bg-black flex items-center gap-16">
      <Text className="text-white">TRACE PAGE</Text>
      <Text className="text-white">{data?.totalReps}</Text>
      <BarChart
        barWidth={18}
        spacing={7}
        barBorderRadius={4}
        frontColor="lightgray"
        data={repPeakData}
        yAxisThickness={0}
        xAxisThickness={0}
        hideAxesAndRules
        width={screenWidth - 40}
        yAxisLabelWidth={20}
      />
    </SafeAreaView>
  );
}
