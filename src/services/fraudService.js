const Order = require("../models/order");
const User = require("../models/User");
const FraudLog = require("../models/FraudLog");

/**
 * Evaluate order for suspicious activity and return risk assessment.
 * @param {Object} param0 { userId, restaurantId, totalAmount, couponCode, items }
 */
async function evaluateOrderRisk({ userId, totalAmount, couponCode }) {
  let riskScore = 0;
  const reasons = [];

  const user = await User.findById(userId);
  if (!user) {
    return { riskScore: 0, riskLevel: "LOW", isSuspicious: false, reasons: [] };
  }

  // 1. Rapid Orders Check: Multiple orders within last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentOrdersCount = await Order.countDocuments({
    user: userId,
    createdAt: { $gte: tenMinutesAgo },
  });

  if (recentOrdersCount >= 3) {
    riskScore += 35;
    reasons.push(`Multiple orders (${recentOrdersCount}) placed within 10 minutes`);
  } else if (recentOrdersCount >= 2) {
    riskScore += 25;
    reasons.push("Multiple orders placed in short timeframe");
  }

  // 2. Cancellation history check
  if (user.cancellationCount >= 5) {
    riskScore += 25;
    reasons.push(`High cancellation history (${user.cancellationCount} past cancellations)`);
  } else if (user.cancellationCount >= 3) {
    riskScore += 15;
    reasons.push(`Repeated cancellations (${user.cancellationCount} past cancellations)`);
  }

  // 3. Refund requests check
  if (user.refundCount >= 3) {
    riskScore += 25;
    reasons.push(`Excessive refund requests (${user.refundCount} past refunds)`);
  }

  // 4. Coupon Abuse Check
  if (couponCode) {
    const couponOrdersCount = await Order.countDocuments({
      user: userId,
      couponCode: couponCode.toUpperCase(),
    });
    if (couponOrdersCount >= 3) {
      riskScore += 20;
      reasons.push(`Abnormal coupon reuse for '${couponCode}'`);
    }
  }

  // 5. Unusually High Order Value Check
  if (totalAmount > 5000) {
    riskScore += 15;
    reasons.push(`Unusually high order value (₹${totalAmount})`);
  }

  // 6. User Restriction state
  if (user.isRestricted) {
    riskScore += 40;
    reasons.push("User account is under administrative restriction");
  }

  // Cap risk score between 0 and 100
  riskScore = Math.min(Math.max(riskScore, 0), 100);

  let riskLevel = "LOW";
  if (riskScore >= 80) riskLevel = "CRITICAL";
  else if (riskScore >= 60) riskLevel = "HIGH";
  else if (riskScore >= 30) riskLevel = "MEDIUM";

  const isSuspicious = riskScore >= 60;

  return {
    riskScore,
    riskLevel,
    isSuspicious,
    reasons,
  };
}

/**
 * Log fraud evaluation to database if order is suspicious or flagged.
 */
async function logFraudEvent(orderId, userId, riskEvaluation) {
  if (riskEvaluation.isSuspicious || riskEvaluation.riskScore >= 30) {
    await FraudLog.create({
      order: orderId,
      user: userId,
      riskScore: riskEvaluation.riskScore,
      riskLevel: riskEvaluation.riskLevel,
      reasons: riskEvaluation.reasons,
      status: "FLAGGED",
    });
  }
}

module.exports = {
  evaluateOrderRisk,
  logFraudEvent,
};
