import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

import clsx from 'clsx';
import { CallibriSensor, SensorCommand, SensorState } from 'react-native-neurosdk2';
import useSWR from 'swr';
import { ConnectedSensorIcon, DisconnectedSensorIcon } from '@/components/Icons';
import { BackendPaths } from '@/enums/Paths';
import { scanner } from '@/infrastructure/clients';
import { UserApi } from '@/infrastructure/services/User';
import { SensorList, useAuthStore, useGlobalStore } from '@/store';
import { getBatteryTimeRemaining } from '@/utils';

export default function Profile() {
  const { setAuthenticated, setAccessToken, setRefreshToken } = useAuthStore();

  const { sensorList, setActiveSensor, setSensorList } = useGlobalStore();

  const [isConnecting, setIsConnecting] = React.useState(false);

  const { data: userInfo } = useSWR(BackendPaths.UserInfo, async () => {
    const response = await UserApi.getUserInfo();
    return response.data;
  });

  const scan = async () => {
    await scanner.start();
    const sensors = await scanner.sensors();

    const sensorListingMapping: SensorList = sensors.reduce((acc, sensor) => {
      acc[sensor.Address] = {
        info: sensor,
        sensor: undefined,
        connected: false,
      };
      return acc;
    }, {} as SensorList);

    console.log('oldList', sensorList);
    console.log('newList', sensorListingMapping);

    setSensorList({ ...sensorList, ...sensorListingMapping });
    await scanner.stop();
  };

  const connect = async (sensorAddress: string) => {
    setIsConnecting(true);

    try {
      const sensorInfo = sensorList[sensorAddress].info;

      const sensorToConnect = (await scanner.createSensor(sensorInfo!)) as CallibriSensor;
      console.log('connect', sensorToConnect);
      const isSensorFound = await sensorToConnect.execute(SensorCommand.FindMe);

      console.log('l', isSensorFound);

      if (isSensorFound !== 'success') return setIsConnecting(false);

      setSensorList({
        ...sensorList,
        [sensorAddress]: {
          ...sensorList?.[sensorAddress],
          sensor: sensorToConnect,
          connected: true,
        },
      });
      setActiveSensor(sensorAddress);

      sensorToConnect.AddConnectionChanged((state) => {
        if (state === SensorState.OutOfRange) {
          setSensorList({
            ...sensorList,
            [sensorAddress]: {
              ...sensorList?.[sensorAddress],
              connected: false,
            },
          });
          setActiveSensor(undefined);
        }
      });

      setIsConnecting(false);
    } catch (e) {
      setSensorList({
        ...sensorList,
        [sensorAddress]: {
          ...sensorList?.[sensorAddress],
          connected: false,
        },
      });
      setActiveSensor(undefined);
      setIsConnecting(false);
      console.log('Failed to connect', e);
    }
  };

  const disconnect = async (sensorAddress: string) => {
    console.log('disconnect');
    const sensorToDisconnect = sensorList?.[sensorAddress].sensor;
    const isDisconnected = await sensorToDisconnect?.disconnect();
    console.log('Is disconnected', isDisconnected, sensorAddress);

    if (isDisconnected === 'success') {
      setSensorList({
        ...sensorList,
        [sensorAddress]: {
          ...sensorList?.[sensorAddress],
          connected: false,
        },
      });
      setActiveSensor(undefined);
    }
  };

  const logout = async () => {
    setAuthenticated(false);
    setAccessToken('');
    setRefreshToken('');

    Object.values(sensorList).forEach(async (sensorData) => {
      sensorData.sensor?.RemoveConnectionChanged();
    });
  };

  const sensorListArray = React.useMemo(
    () =>
      Object.entries(sensorList || {}).map(([address, sensorData]) => ({
        address,
        ...sensorData,
      })),
    [sensorList],
  );

  return (
    <SafeAreaView className="w-full h-full bg-black">
      <View className="p-6 flex gap-8 h-full">
        <View className="flex flex-row justify-between items-center">
          <View className="flex flex-row gap-7">
            <View className="bg-white/50 flex items-center justify-center w-[54px] h-[54px] rounded-full">
              <Text className="text-4xl font-extrabold">{userInfo?.username[0].toUpperCase()}</Text>
            </View>
            <View className="gap-2 flex justify-center">
              <Text className="text-white text-base font-semibold">{userInfo?.username}</Text>
              <Text className="text-white text-sm font-semibold">{userInfo?.email}</Text>
            </View>
          </View>
          <Ionicons name="log-out-outline" size={24} color="white" onPress={logout} />
        </View>
        <View>
          <Text className="text-white text-lg font-semibold ">Sensors</Text>
          <FlatList
            data={sensorListArray}
            renderItem={({ item: sensorData }) => (
              <Pressable onPress={() => connect(sensorData.address)}>
                <View
                  className={clsx(
                    'px-3 py-10 shadow-sm border-b-[0.5px] border-solid border-gray-500 flex flex-row gap-8 w-full h-[152px]',
                    sensorData.address === sensorListArray?.[sensorListArray?.length - 1]?.address && '!border-black',
                  )}>
                  <View className="pt-6">
                    {sensorData.connected ? <ConnectedSensorIcon /> : <DisconnectedSensorIcon />}
                  </View>
                  <View className="flex flex-1 h-full justify-between">
                    <View className="flex flex-row justify-between items-center">
                      <Text className="text-lg font-extrabold mb-1 text-white">{sensorData.info?.Name}</Text>
                      <Ionicons
                        name="trash-outline"
                        color="white"
                        size={20}
                        onPress={() => disconnect(sensorData.address)}
                      />
                    </View>
                    {sensorData.connected && sensorData.sensor ? (
                      <View className="flex flex-row items-center gap-3 w-full">
                        <View className="flex-row items-center">
                          <View className="w-[80px] h-[36px] border-2 border-white/50 rounded-lg overflow-hidden p-1">
                            <View
                              className="h-full bg-white rounded-sm"
                              style={{
                                width: `${sensorData?.sensor?.getBattPower()}%`,
                              }}
                            />
                          </View>
                          <View className="w-[4px] h-6 rounded-r-md bg-white/50" />
                        </View>
                        <View className="flex flex-row gap-1">
                          <Text className="text-sm text-white font-extrabold">
                            {sensorData.sensor?.getBattPower()}%
                          </Text>
                          <Text className="text-sm text-white/50 font-extrabold">
                            {getBatteryTimeRemaining(sensorData.sensor.getBattPower())}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View>
                        <Text className="text-white/50 font-semibold text-sm -mt-[32px]">
                          {isConnecting ? 'Connecting...' : 'Not connected'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={<Text className="text-center py-5 text-base text-gray-600">No presets available</Text>}
            className="w-full px-3"
            showsVerticalScrollIndicator={false}
          />
        </View>
        <Pressable
          onPress={scan}
          className="bg-white p-4 rounded-full absolute bottom-8 right-8 w-[60px] h-[60px] flex items-center justify-center">
          <Ionicons size={32} color="black" name="add" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
