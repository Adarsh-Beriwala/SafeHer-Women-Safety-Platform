const ML_BACKEND = import.meta.env.VITE_ML_BACKEND_URL || 'http://localhost:5000';

export const getSafetyScore = async (lat, lng) => {
  try {
    const response = await fetch(`${ML_BACKEND}/api/safety-score?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error('Failed to fetch safety score');
    return await response.json();
  } catch (error) {
    console.error('Safety score error:', error);
    // Fallback with mock data if backend is unavailable
    return generateFallbackScore(lat, lng);
  }
};

export const getAreaSafetyScore = async (areaName) => {
  try {
    const response = await fetch(`${ML_BACKEND}/api/safety-score/area?name=${encodeURIComponent(areaName)}`);
    if (!response.ok) throw new Error('Failed to fetch area safety score');
    return await response.json();
  } catch (error) {
    console.error('Area safety score error:', error);
    return generateFallbackScore(18.52, 73.85);
  }
};

// Fallback scoring when ML backend is unavailable
const generateFallbackScore = (lat, lng) => {
  // Generate a deterministic-looking score based on coordinates
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1;
  const score = Math.round((seed * 6 + 2) * 10) / 10; // Range: 2.0 - 8.0

  let level, color;
  if (score >= 7) {
    level = 'Safe';
    color = '#10b981';
  } else if (score >= 4) {
    level = 'Moderate';
    color = '#f59e0b';
  } else {
    level = 'Unsafe';
    color = '#ef4444';
  }

  return {
    safetyScore: score,
    level,
    color,
    crimeBreakdown: {
      theft: Math.round(seed * 30),
      assault: Math.round(seed * 15),
      harassment: Math.round(seed * 20),
      robbery: Math.round(seed * 10),
    },
    source: 'fallback',
  };
};
