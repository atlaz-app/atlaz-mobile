import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import useSWR from 'swr';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLine, VictoryZoomContainer } from 'victory-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import { ZoomDomain } from 'victory-zoom-container';
import { TraceApi } from '@/infrastructure/services/Trace';
import { BackendPaths } from '@/enums/Paths';

type EnvelopeData = {
  x: number;
  y: number;
};

type RepData = {
  repNumber: number;
  startTimestamp: number;
  peakTimestamp: number;
  endTimestamp: number;
  contraction: number;
  extension: number;
  duration: number;
  peakValue: number;
  peakMultiplier: number;
};

const screenWidth = Dimensions.get('window').width;

export default function TraceRecording() {
  const [zoomDomain, setZoomDomain] = React.useState<Partial<ZoomDomain>>({ x: [-2500, 2500] });
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentRep, setCurrentRep] = React.useState<RepData>();

  const { traceId } = useLocalSearchParams<{ traceId: string }>();

  const { data } = useSWR(BackendPaths.TraceById(traceId), async () => {
    const response = await TraceApi.getTraceById(traceId);
    return response.data;
  });

  const player = useVideoPlayer(data?.videoPath!, (player) => {
    player.timeUpdateEventInterval = 0.09;
  });

  useEventListener(player, 'timeUpdate', (payload) => {
    setZoomDomain({
      x: [Math.floor(payload.currentTime * 1000 - 2500), Math.floor(payload.currentTime * 1000 + 2500)],
    });

    if (repData) {
      const lastRepNumber = repData.find((rep) => rep.startTimestamp > player.currentTime * 1000)?.repNumber;
      const updatedRep = lastRepNumber
        ? repData[lastRepNumber === 1 ? 1 : lastRepNumber - 2]
        : repData[repData.length - 1];

      if (currentRep?.repNumber !== updatedRep.repNumber) {
        setCurrentRep(updatedRep);
      }
    }
  });

  useEventListener(player, 'playingChange', (state) => {
    setIsPlaying(state.isPlaying);
  });

  const handleDomainChange = (domain: ZoomDomain) => {
    if (!isPlaying) {
      player.currentTime = ((domain.x[0] as number) + 2500) / 1000;
    }
  };

  const envelopeData: EnvelopeData[] =
    (data?.envelopeData && JSON.parse(data.envelopeData))?.map((point: any) => ({
      x: point.timestamp,
      y: point.y || point.value || 0,
    })) || [];

  const paddedEnvelopeData = [
    { x: envelopeData[0]?.x - 2500, y: 0 }, // Left padding
    ...envelopeData,
    { x: envelopeData[envelopeData.length - 1]?.x + 2500, y: 0 }, // Right padding
  ];

  const repData = (data?.repData && JSON.parse(data?.repData)) as RepData[];

  React.useEffect(() => {
    if (!currentRep) {
      setCurrentRep(repData[0]);
    }
  }, [repData, currentRep]);

  const maxY = Math.max(...envelopeData.map((d) => d.y));

  const playheadX = zoomDomain?.x?.[0] + 2500;
  const closestPoint = envelopeData.find((point) => point.x > playheadX);
  const playheadY = closestPoint?.y || 0;

  // Calculate multiplier
  const multiplier = data?.envelopeBase ? Math.floor(playheadY / data.envelopeBase) : 0;
  // const seconds = (playheadX / 1000).toFixed(2);

  return (
    <View className="flex-1 bg-black p-4">
      <View className="rounded-lg overflow-hidden mb-4">
        <VideoView player={player} nativeControls style={{ height: 425, borderRadius: 16 }} contentFit="cover" />
      </View>
      {data && (
        <View>
          <VictoryChart
            height={170}
            width={screenWidth - 30}
            padding={{
              left: 0,
              right: 0,
              top: 25,
              bottom: 30,
            }}
            containerComponent={
              <VictoryZoomContainer
                allowZoom={false}
                allowPan={true}
                zoomDomain={zoomDomain}
                onZoomDomainChange={handleDomainChange}
              />
            }>
            {repData?.map((rep, index) => {
              const isCurrent = rep.repNumber === currentRep?.repNumber;
              return (
                <VictoryArea
                  key={rep.repNumber}
                  data={[
                    { x: rep.startTimestamp, y: 0 },
                    { x: rep.startTimestamp, y: maxY },
                    { x: rep.endTimestamp, y: maxY },
                    { x: rep.endTimestamp, y: 0 },
                  ]}
                  style={{
                    data: {
                      fill: isCurrent ? 'rgba(255, 255, 255, 0.15)' : index % 2 === 0 ? '#121212' : '#000000',
                      stroke: 'transparent',
                    },
                  }}
                />
              );
            })}
            <VictoryLine
              data={paddedEnvelopeData}
              interpolation="monotoneX"
              style={{ data: { stroke: '#FFFFFF', strokeWidth: 2, zIndex: 1000 } }}
            />
            <VictoryAxis
              style={{
                tickLabels: {
                  fill: 'white',
                  fontSize: 12,
                  padding: 5,
                },
                ticks: { stroke: 'white' },
              }}
              tickFormat={(t) => `${Math.floor(t / 1000)}s`}
            />
          </VictoryChart>
          <View
            style={{ position: 'absolute', left: 158, alignItems: 'center', width: 50, top: 0 }}
            pointerEvents="none">
            <Text style={{ color: 'white', marginBottom: 8, fontWeight: 'bold' }}>{multiplier}X</Text>
            <View style={{ height: 115, width: 2, backgroundColor: 'red' }} />
          </View>
        </View>
      )}
      <View className="flex flex-row gap-4 justify-between mt-1 px-2">
        <View className="flex flex-row gap-6 justify-between">
          <View className="flex gap-1">
            <Text className="text-white text-sm font-bold">Extension</Text>
            <Text className="text-white text-sm font-bold">{currentRep && currentRep?.extension / 1000}s</Text>
          </View>
          <View className="flex gap-1">
            <Text className="text-white text-sm font-bold">Contraction</Text>
            <Text className="text-white text-sm font-bold">{currentRep && currentRep?.contraction / 1000}s</Text>
          </View>
        </View>
        <View className="flex flex-row gap-6 justify-between">
          <View className="flex items-center gap-1">
            <Text className="text-white text-sm font-bold">Peak</Text>
            <Text className="text-white text-sm font-bold">{Math.floor(currentRep?.peakMultiplier!)}X</Text>
          </View>
          <View className="flex items-center gap-1">
            <Text className="text-white text-sm font-bold">Count</Text>
            <Text className="text-white text-sm font-bold">{currentRep?.repNumber || 0}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
