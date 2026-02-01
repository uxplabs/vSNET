/**
 * North American regions for the account.
 */
export const NORTH_AMERICAN_REGIONS = [
  'Pacific Northwest',
  'Northern California',
  'Southern California',
  'Desert Southwest',
  'Mountain West',
  'Great Plains',
  'Texas',
  'Gulf Coast',
  'Southeast',
  'Florida',
  'Midwest',
  'Great Lakes',
  'Northeast',
  'New England',
  'Mid-Atlantic',
  'Eastern Canada',
] as const;

export type NorthAmericanRegion = (typeof NORTH_AMERICAN_REGIONS)[number];
