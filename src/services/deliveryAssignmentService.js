const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/order");

/**
 * Calculate Haversine distance in KM between two [lng, lat] points
 */
function calculateDistanceKM(coords1, coords2) {
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Assigns the optimal available delivery partner to an order.
 * @param {String} orderId
 * @param {Array} restaurantCoords [longitude, latitude]
 */
async function autoAssignDeliveryPartner(orderId, restaurantCoords = [77.5946, 12.9716]) {
  const order = await Order.findById(orderId);
  if (!order) return null;

  // Find active partners with status AVAILABLE or BUSY but workload < 3
  const availablePartners = await DeliveryPartner.find({
    status: { $in: ["AVAILABLE", "BUSY"] },
    activeOrdersCount: { $lt: 3 },
  });

  if (!availablePartners || availablePartners.length === 0) {
    console.log(`[DeliveryAssignment] No available delivery partners for order ${orderId}`);
    return null;
  }

  // Rank partners by distance and current workload score
  const rankedPartners = availablePartners.map((partner) => {
    const coords = partner.currentLocation?.coordinates || [77.5946, 12.9716];
    const distanceKM = calculateDistanceKM(restaurantCoords, coords);

    // Score formula: distance (70% weight) + active workload penalty (30% weight)
    const score = distanceKM * 0.7 + partner.activeOrdersCount * 2.0;

    return { partner, distanceKM, score };
  });

  rankedPartners.sort((a, b) => a.score - b.score);

  const selectedPartner = rankedPartners[0].partner;

  // Update Order
  order.assignedDeliveryPartner = selectedPartner._id;
  await order.save();

  // Update DeliveryPartner stats
  selectedPartner.activeOrdersCount += 1;
  selectedPartner.status = selectedPartner.activeOrdersCount >= 3 ? "BUSY" : "AVAILABLE";
  await selectedPartner.save();

  console.log(
    `[DeliveryAssignment] Assigned partner ${selectedPartner.name} to order ${orderId} (Distance: ${rankedPartners[0].distanceKM.toFixed(
      2
    )} km)`
  );

  return selectedPartner;
}

/**
 * Reassign order when current partner declines.
 */
async function reassignDeliveryPartner(orderId, decliningPartnerId) {
  const order = await Order.findById(orderId);
  if (!order) return null;

  // Find partner excluding the declining one
  const availablePartners = await DeliveryPartner.find({
    _id: { $ne: decliningPartnerId },
    status: { $in: ["AVAILABLE", "BUSY"] },
    activeOrdersCount: { $lt: 3 },
  });

  if (!availablePartners || availablePartners.length === 0) {
    order.assignedDeliveryPartner = null;
    await order.save();
    return null;
  }

  const newPartner = availablePartners[0];
  order.assignedDeliveryPartner = newPartner._id;
  await order.save();

  newPartner.activeOrdersCount += 1;
  await newPartner.save();

  return newPartner;
}

module.exports = {
  autoAssignDeliveryPartner,
  reassignDeliveryPartner,
  calculateDistanceKM,
};
