const Restaurant = require("../models/restaurant");
const Menu = require("../models/Menu");

/**
 * Advanced Restaurant Search with Fuzzy Matching and Multi-filtering
 */
exports.searchRestaurants = async (req, res) => {
  try {
    const {
      query,
      cuisine,
      rating,
      maxDeliveryTime,
      vegetarian,
      priceRange,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filterObj = { isActive: true };

    // 1. Text / Fuzzy Search Filter
    if (query && query.trim() !== "") {
      const q = query.trim();

      // Create fuzzy regex pattern for spelling variation (e.g. "piza" matches "Pizza")
      const fuzzyRegexPattern = q
        .split("")
        .map((char) => `${char}+`)
        .join(".*");

      const regexFilter = new RegExp(fuzzyRegexPattern, "i");

      // Search matching menu items to also find restaurants offering matching food
      const matchingMenuItems = await Menu.find({ name: { $regex: regexFilter } }).distinct("restaurant");

      filterObj.$or = [
        { name: { $regex: regexFilter } },
        { cuisine: { $regex: regexFilter } },
        { description: { $regex: regexFilter } },
        { _id: { $in: matchingMenuItems } },
      ];
    }

    // 2. Cuisine Filter
    if (cuisine) {
      const cuisinesArray = cuisine.split(",").map((c) => c.trim());
      filterObj.cuisine = { $in: cuisinesArray.map((c) => new RegExp(c, "i")) };
    }

    // 3. Minimum Rating Filter
    if (rating) {
      filterObj.rating = { $gte: Number(rating) };
    }

    // 4. Maximum Delivery Time Filter
    if (maxDeliveryTime) {
      filterObj.deliveryTime = { $lte: Number(maxDeliveryTime) };
    }

    // 5. Vegetarian Filter
    if (vegetarian === "true" || vegetarian === true) {
      filterObj.isVegetarian = true;
    }

    // 6. Price Range Filter (1 to 4)
    if (priceRange) {
      filterObj.priceCategory = Number(priceRange);
    }

    // 7. Sorting
    let sortOptions = {};
    if (sort === "rating") {
      sortOptions = { rating: -1, numRatings: -1 };
    } else if (sort === "deliveryTime") {
      sortOptions = { deliveryTime: 1 };
    } else if (sort === "priceAsc") {
      sortOptions = { priceCategory: 1 };
    } else if (sort === "priceDesc") {
      sortOptions = { priceCategory: -1 };
    } else if (sort === "popularity") {
      sortOptions = { popularityScore: -1, rating: -1 };
    } else {
      // Default: Recommended mix of rating & popularity
      sortOptions = { rating: -1, popularityScore: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Restaurant.countDocuments(filterObj);
    const restaurants = await Restaurant.find(filterObj)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: {
        restaurants,
        pagination: {
          totalCount,
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          limit: limitNum,
        },
        appliedFilters: {
          query: query || null,
          cuisine: cuisine || null,
          rating: rating || null,
          maxDeliveryTime: maxDeliveryTime || null,
          vegetarian: vegetarian === "true",
          priceRange: priceRange || null,
          sort: sort || "recommended",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get All Active Restaurants
 */
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true }).sort({ rating: -1, popularityScore: -1 });
    return res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Single Restaurant Details by ID
 */
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const menuItems = await Menu.find({ restaurant: restaurant._id, isAvailable: true });

    return res.status(200).json({
      success: true,
      data: {
        restaurant,
        menuItems,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Create Restaurant
 */
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    return res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Update Restaurant
 */
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    return res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete Restaurant
 */
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    return res.status(200).json({ success: true, message: "Restaurant deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
