/**
 * ============================================================
 * Regional Risk Data
 * 
 * Defines regional risk factors that impact supplier risk scores:
 * - geopolitical: Political instability, sanctions, tensions
 * - weather: Hurricane, flooding, monsoon, drought risk
 * - logistics: Transportation disruption, port congestion
 * 
 * Each metric is scored 0-100
 * ============================================================
 */

export interface RegionalRiskProfile {
  geopolitical: number;
  weather: number;
  logistics: number;
}

export type RegionKey = 
  | "Asia"
  | "Europe"
  | "Africa"
  | "North America"
  | "South America"
  | "Middle East"
  | "Central America"
  | "Oceania";

export const regionRiskData: Record<RegionKey, RegionalRiskProfile> = {
  Asia: {
    geopolitical: 60,    // Taiwan tensions, China trade
    weather: 65,         // Typhoons, monsoons
    logistics: 50,       // Maritime congestion
  },
  Europe: {
    geopolitical: 25,    // Ukraine conflict, NATO
    weather: 30,         // Moderate seasonal
    logistics: 28,       // Well-maintained infrastructure
  },
  Africa: {
    geopolitical: 75,    // Instability, conflicts in multiple regions
    weather: 50,         // Droughts, flooding seasonal
    logistics: 65,       // Limited infrastructure, piracy
  },
  "North America": {
    geopolitical: 15,    // Stable, low direct risk
    weather: 35,         // Hurricanes, tornadoes seasonal
    logistics: 20,       // Excellent infrastructure
  },
  "South America": {
    geopolitical: 45,    // Political instability some nations
    weather: 55,         // Flooding, landslides
    logistics: 40,       // Growing infrastructure
  },
  "Middle East": {
    geopolitical: 70,    // Regional conflicts, sanctions
    weather: 25,         // Desert conditions but stable
    logistics: 45,       // Strategic chokepoints (Strait of Hormuz)
  },
  "Central America": {
    geopolitical: 50,    // Gang violence, political instability
    weather: 60,         // Hurricanes, tropical storms
    logistics: 35,       // Limited but improving
  },
  Oceania: {
    geopolitical: 15,    // Stable
    weather: 45,         // Cyclones seasonal
    logistics: 30,       // Remote, maritime dependent
  },
};

/**
 * Get regional risk profile for a region
 * Returns default neutral profile if region not found
 */
export function getRegionalRiskProfile(region: string): RegionalRiskProfile {
  const profile = regionRiskData[region as RegionKey];
  if (!profile) {
    // Default neutral profile for unmapped regions
    return { geopolitical: 35, weather: 35, logistics: 35 };
  }
  return profile;
}
