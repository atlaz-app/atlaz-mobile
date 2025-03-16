export const getBatteryTimeRemaining = (batteryCharge: number, maxBatteryLifeHours: number = 6): string => {
  // Input validation
  if (!Number.isFinite(batteryCharge) || batteryCharge < 0 || batteryCharge > 100) {
    throw new Error('Battery charge must be a number between 0 and 100');
  }
  if (!Number.isFinite(maxBatteryLifeHours) || maxBatteryLifeHours <= 0) {
    throw new Error('Maximum battery life must be a positive number');
  }

  // Calculate remaining hours based on percentage
  const remainingHours = (batteryCharge / 100) * maxBatteryLifeHours;

  // If less than 1 hour, convert to minutes
  if (remainingHours < 1) {
    const remainingMinutes = Math.round(remainingHours * 60);
    return `${remainingMinutes}min`;
  }

  // Round to nearest integer for hours
  const roundedHours = Math.round(remainingHours);
  return `${roundedHours}h`;
};
