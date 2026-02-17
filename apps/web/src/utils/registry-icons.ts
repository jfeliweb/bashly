type RegistryIcon = { emoji: string; label: string };

const domainIconMap: Record<string, RegistryIcon> = {
  'amazon.com': { emoji: '📦', label: 'Amazon' },
  'walmart.com': { emoji: '🔵', label: 'Walmart' },
  'target.com': { emoji: '🎯', label: 'Target' },
  'bestbuy.com': { emoji: '💙', label: 'Best Buy' },
  'etsy.com': { emoji: '🧶', label: 'Etsy' },
  'babiesrus.com': { emoji: '🍼', label: 'Babies R Us' },
  'buybuybaby.com': { emoji: '🍼', label: 'buybuy BABY' },
  'crateandbarrel.com': { emoji: '🏠', label: 'Crate & Barrel' },
  'williamssonoma.com': { emoji: '🍳', label: 'Williams Sonoma' },
};

export function getRegistryIcon(domain: string): RegistryIcon {
  return domainIconMap[domain] ?? { emoji: '🔗', label: 'Registry' };
}
