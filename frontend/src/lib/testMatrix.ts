/**
 * v3.5.35: Test matrix generator for one-click automated testing.
 *
 * Generates a matrix of test cases covering:
 *   - 16 keywords (8 with location, 8 without)
 *   - 5 platform groups
 *   - 4 toggle combinations (dorking/direct scraping)
 *   = 320 full-matrix test cases
 */

export const TEST_KEYWORDS = {
  with_location: [
    'Plumbers in Mumbai',
    'Dentists in Delhi',
    'Software Companies in Bangalore',
    'Real Estate Agents in Pune',
    'CA Firms in Chennai',
    'Marketing Agency in Hyderabad',
    'Restaurants in Kolkata',
    'Interior Designers in Ahmedabad',
  ],
  without_location: [
    'Plumbers',
    'Dentists',
    'Software Companies',
    'Real Estate Agents',
    'Marketing Agency',
    'CA Firms',
    'Restaurants',
    'Interior Designers',
  ],
};

export const ALL_PLATFORMS = [
  'linkedin', 'instagram', 'facebook', 'twitter', 'reddit',
  'google_maps', 'youtube', 'pinterest', 'tumblr', 'tiktok',
] as const;

export const TOGGLE_COMBOS = [
  { use_google_dorking: false, use_direct_scraping: false, label: 'Base' },
  { use_google_dorking: true,  use_direct_scraping: false, label: 'Dorking' },
  { use_google_dorking: false, use_direct_scraping: true,  label: 'Direct' },
  { use_google_dorking: true,  use_direct_scraping: true,  label: 'Full' },
] as const;

export const PLATFORM_GROUPS: Record<string, string[]> = {
  B2B: ['linkedin', 'facebook', 'twitter'],
  LOCAL: ['google_maps', 'instagram'],
  SOCIAL: ['instagram', 'facebook', 'twitter'],
  MEDIA: ['youtube', 'pinterest', 'tumblr', 'tiktok'],
  COMMUNITY: ['reddit'],
};

export interface TestCase {
  id: string;
  keyword: string;
  hasLocation: boolean;
  platforms: string[];
  platformGroup: string;
  use_google_dorking: boolean;
  use_direct_scraping: boolean;
  toggleLabel: string;
}

export function generateTestMatrix(options?: {
  keywordSubset?: number;
  platformGroups?: string[];
  toggleCombos?: readonly { use_google_dorking: boolean; use_direct_scraping: boolean; label: string }[];
}): TestCase[] {
  const kwSubset = options?.keywordSubset ?? 8;
  const keywords = [
    ...TEST_KEYWORDS.with_location.slice(0, kwSubset),
    ...TEST_KEYWORDS.without_location.slice(0, kwSubset),
  ];
  const groupsToTest = options?.platformGroups ?? Object.keys(PLATFORM_GROUPS);
  const combos = options?.toggleCombos ?? TOGGLE_COMBOS;
  const cases: TestCase[] = [];

  for (const keyword of keywords) {
    const hasLocation = keyword.includes(' in ');
    for (const groupName of groupsToTest) {
      const platforms = PLATFORM_GROUPS[groupName];
      if (!platforms) continue;
      for (const combo of combos) {
        cases.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          keyword,
          hasLocation,
          platforms,
          platformGroup: groupName,
          use_google_dorking: combo.use_google_dorking,
          use_direct_scraping: combo.use_direct_scraping,
          toggleLabel: combo.label,
        });
      }
    }
  }
  return cases;
}
