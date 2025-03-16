import { Scanner, SensorFamily } from 'react-native-neurosdk2';

export const scanner = new Scanner();

const init = async () => {
  await scanner.init([SensorFamily.LECallibri]);
  //   scanner.start();

  //   const sensors = await scanner.sensors();

  //   const sensor: CallibriSensor = (await scanner.createSensor(
  //     sensors[0]
  //   )) as CallibriSensor;

  //   const state = sensor.getState();

  //   sensor.isSupportedParameter(SensorParameter.BattPower);
};

init();
