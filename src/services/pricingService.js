const SurgeSettings = require("../models/SurgeSettings");
const Order = require("../models/order");

async function getOrInitSurgeSettings() {
  let settings = await SurgeSettings.findOne();
  if (!settings) {
    settings = await SurgeSettings.create({
      region: "Central City",
      isSurgeActive: true,
      baseDeliveryFee: 40,
      surgeMultiplier: 1.5,
      demandThreshold: 5,
      peakHours: {
        lunchStart: "12:00",
        lunchEnd: "15:00",
        dinnerStart: "19:30",
        dinnerEnd: "22:30",
      },
    });
  }
  return settings;
}

/**
 * Calculates delivery fee incorporating demand levels and peak hour surge pricing.
 */
async function calculateDeliveryFee() {
  const settings = await getOrInitSurgeSettings();

  const baseDeliveryFee = settings.baseDeliveryFee || 40;

  if (!settings.isSurgeActive) {
    return {
      baseDeliveryFee,
      surgeMultiplier: 1.0,
      surgeFee: 0,
      finalDeliveryFee: baseDeliveryFee,
      isSurgeActive: false,
      demandLevel: "NORMAL",
      peakNotice: "Standard delivery rates apply",
    };
  }

  // Calculate current order demand (orders in last 15 minutes)
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const activeOrderVolume = await Order.countDocuments({
    createdAt: { $gte: fifteenMinsAgo },
  });

  // Check peak hours (Local time)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const lunchStart = parseTime(settings.peakHours.lunchStart);
  const lunchEnd = parseTime(settings.peakHours.lunchEnd);
  const dinnerStart = parseTime(settings.peakHours.dinnerStart);
  const dinnerEnd = parseTime(settings.peakHours.dinnerEnd);

  const isLunchPeak = currentMinutes >= lunchStart && currentMinutes <= lunchEnd;
  const isDinnerPeak = currentMinutes >= dinnerStart && currentMinutes <= dinnerEnd;
  const isPeakHour = isLunchPeak || isDinnerPeak;

  let multiplier = 1.0;
  let demandLevel = "NORMAL";
  let peakNotice = "Standard delivery fee";

  if (activeOrderVolume >= settings.demandThreshold * 2 || (isPeakHour && activeOrderVolume >= settings.demandThreshold)) {
    multiplier = settings.surgeMultiplier; // e.g. 1.5x or 2.0x
    demandLevel = "VERY_HIGH";
    peakNotice = "High demand in your area. Surge pricing applies to deliver your food quickly.";
  } else if (isPeakHour || activeOrderVolume >= settings.demandThreshold) {
    multiplier = Math.min(settings.surgeMultiplier, 1.3);
    demandLevel = "HIGH";
    peakNotice = "Peak hour surge fee applied.";
  }

  const surgeFee = Math.round(baseDeliveryFee * (multiplier - 1.0));
  const finalDeliveryFee = baseDeliveryFee + surgeFee;

  return {
    baseDeliveryFee,
    surgeMultiplier: Number(multiplier.toFixed(2)),
    surgeFee,
    finalDeliveryFee,
    isSurgeActive: multiplier > 1.0,
    demandLevel,
    peakNotice,
  };
}

module.exports = {
  calculateDeliveryFee,
  getOrInitSurgeSettings,
};
