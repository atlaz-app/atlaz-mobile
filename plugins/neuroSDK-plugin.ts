const { withInfoPlist } = require('@expo/config-plugins');

// Define the function to modify the iOS config
const withNeuroSDK = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSBluetoothAlwaysUsageDescription = 'This app requires Bluetooth to connect to external devices.';

    return config;
  });
};

// Export the plugin
module.exports = withNeuroSDK;
