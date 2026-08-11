const Restaurant = require("../models/restaurant");
const UserPreference = require("../models/UserPreference");
const Order = require("../models/order");

/**
 * Update user preference profile after an order is created
 */
async function updateUserPreferenceAfterOrder(userId, restaurantId, cuisineList = []) {
  try {
    let pref = await UserPreference.findOne({ user: userId });
    if (!pref) {
      pref = new UserPreference({
        user: userId,
        preferredCuisines: [],
        frequentlyOrderedRestaurants: [],
        totalOrdersCount: 0,
      });
    }

    pref.totalOrdersCount += 1;

    // Update cuisine counts
    cuisineList.forEach((cuisine) => {
      const existing = pref.preferredCuisines.find((c) => c.cuisine.toLowerCase() === cuisine.toLowerCase());
      if (existing) {
        existing.count += 1;
      } else {
        pref.preferredCuisines.push({ cuisine, count: 1 });
      }
    });

    // Update restaurant counts
    const restExisting = pref.frequentlyOrderedRestaurants.find(
      (r) => r.restaurant && r.restaurant.toString() === restaurantId.toString()
    );
    if (restExisting) {
      restExisting.count += 1;
    } else {
      pref.frequentlyOrderedRestaurants.push({ restaurant: restaurantId, count: 1 });
    }

    await pref.save();
  } catch (err) {
    console.error("[RecommendationService] Error updating user preference:", err.message);
  }
}

/**
 * Get personalized recommendations for a user.
 */
async function getPersonalizedRecommendations(userId, limit = 6) {
  const allRestaurants = await Restaurant.find({ isActive: true });

  const pref = await UserPreference.findOne({ user: userId });

  // Fallback for new users or missing profile
  if (!pref || pref.preferredCuisines.length === 0) {
    const sortedFallback = allRestaurants
      .sort((a, b) => b.rating * b.popularityScore - a.rating * a.popularityScore)
      .slice(0, limit);

    return sortedFallback.map((r) => ({
      restaurant: r,
      recommendationScore: 85,
      recommendationReason: "Popular & Top Rated Near You",
    }));
  }

  // Find top preferred cuisines
  const sortedCuisines = [...pref.preferredCuisines].sort((a, b) => b.count - a.count);
  const topCuisines = sortedCuisines.slice(0, 3).map((c) => c.cuisine.toLowerCase());
  const topCuisineName = sortedCuisines[0] ? sortedCuisines[0].cuisine : "Popular";

  const scored = allRestaurants.map((restaurant) => {
    let score = 0;

    // 1. Cuisine Similarity (30%)
    const hasMatchingCuisine = restaurant.cuisine.some((c) => topCuisines.includes(c.toLowerCase()));
    if (hasMatchingCuisine) score += 30;

    // 2. Past Orders (25%)
    const pastOrderMatch = pref.frequentlyOrderedRestaurants.find(
      (r) => r.restaurant && r.restaurant.toString() === restaurant._id.toString()
    );
    if (pastOrderMatch) {
      score += Math.min(pastOrderMatch.count * 8, 25);
    }

    // 3. Restaurant Rating (20%)
    score += (restaurant.rating / 5) * 20;

    // 4. Popularity (15%)
    score += (restaurant.popularityScore / 100) * 15;

    // 5. Delivery Time Bonus (10%)
    if (restaurant.deliveryTime <= 30) score += 10;
    else if (restaurant.deliveryTime <= 45) score += 5;

    const roundScore = Math.round(score);

    let reason = `Recommended because you order ${topCuisineName} cuisine`;
    if (pastOrderMatch) {
      reason = `Based on your ${pastOrderMatch.count} previous orders here`;
    } else if (hasMatchingCuisine) {
      reason = `Matches your preference for ${restaurant.cuisine[0]}`;
    }

    return {
      restaurant,
      recommendationScore: roundScore,
      recommendationReason: reason,
    };
  });

  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
  return scored.slice(0, limit);
}

module.exports = {
  updateUserPreferenceAfterOrder,
  getPersonalizedRecommendations,
};
