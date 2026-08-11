const recommendationService = require("../services/recommendationService");

exports.getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit || 6, 10);

    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
