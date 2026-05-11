export interface CryptoToken {
  id: string;
  symbol: string;
  name: string;
  color: string;
}

export interface FiatCurrency {
  symbol: string;
  name: string;
  countryCode: string;
  sign: string;
}

export const CRYPTO_TOKENS: CryptoToken[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'tether', symbol: 'USDT', name: 'Tether', color: '#26A17B' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', color: '#F3BA2F' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#9945FF' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', color: '#2775CA' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', color: '#00AAE4' },
  { id: 'staked-ether', symbol: 'STETH', name: 'Lido Staked ETH', color: '#4A90D9' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633' },
  { id: 'tron', symbol: 'TRX', name: 'TRON', color: '#EB0029' },
  { id: 'the-open-network', symbol: 'TON', name: 'Toncoin', color: '#0088CC' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', color: '#FFA409' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash', color: '#8DC351' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', color: '#BFBBBB' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', color: '#FF007A' },
  { id: 'pepe', symbol: 'PEPE', name: 'Pepe', color: '#479E45' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar', color: '#14B6E7' },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer', color: '#29ABE2' },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic', color: '#328332' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin', color: '#0090FF' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos', color: '#00D4FF' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', color: '#28A0F0' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism', color: '#FF0420' },
  { id: 'injective-protocol', symbol: 'INJ', name: 'Injective', color: '#00B4D8' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', color: '#6F4E7C' },
  { id: 'sui', symbol: 'SUI', name: 'Sui', color: '#6FBCF0' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', color: '#00C08B' },
  { id: 'thorchain', symbol: 'RUNE', name: 'THORChain', color: '#00CCFF' },
  { id: 'the-graph', symbol: 'GRT', name: 'The Graph', color: '#6747ED' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave', color: '#B6509E' },
  { id: 'maker', symbol: 'MKR', name: 'Maker', color: '#1AAB9B' },
  { id: 'kaspa', symbol: 'KAS', name: 'Kaspa', color: '#70C7BA' },
  { id: 'fantom', symbol: 'FTM', name: 'Fantom', color: '#1969FF' },
  { id: 'sei-network', symbol: 'SEI', name: 'Sei', color: '#9D1BDF' },
  { id: 'floki', symbol: 'FLOKI', name: 'FLOKI', color: '#FF8C00' },
  { id: 'bonk', symbol: 'BONK', name: 'Bonk', color: '#F7931A' },
  { id: 'dogwifcoin', symbol: 'WIF', name: 'dogwifhat', color: '#9945FF' },
  { id: 'celestia', symbol: 'TIA', name: 'Celestia', color: '#7B2FBE' },
  { id: 'crypto-com-chain', symbol: 'CRO', name: 'Cronos', color: '#002D74' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain', color: '#15BDFF' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera', color: '#00ABAB' },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand', color: '#00B4D8' },
  { id: 'render-token', symbol: 'RNDR', name: 'Render', color: '#FF4B36' },
  { id: 'immutable-x', symbol: 'IMX', name: 'Immutable', color: '#00C4FF' },
  { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox', color: '#04ADEF' },
  { id: 'decentraland', symbol: 'MANA', name: 'Decentraland', color: '#FF2D55' },
  { id: 'axie-infinity', symbol: 'AXS', name: 'Axie Infinity', color: '#0055D5' },
  { id: 'lido-dao', symbol: 'LDO', name: 'Lido DAO', color: '#00A3FF' },
  { id: 'curve-dao-token', symbol: 'CRV', name: 'Curve DAO', color: '#FF0000' },
  { id: 'compound-governance-token', symbol: 'COMP', name: 'Compound', color: '#00D395' },
  { id: 'dydx', symbol: 'DYDX', name: 'dYdX', color: '#6966FF' },
  { id: 'stepn', symbol: 'GMT', name: 'STEPN', color: '#FF8A00' },
  { id: 'gala', symbol: 'GALA', name: 'Gala', color: '#00C2FF' },
  { id: 'blur', symbol: 'BLUR', name: 'Blur', color: '#FF7602' },
  { id: 'pendle', symbol: 'PENDLE', name: 'Pendle', color: '#4AEBA5' },
  { id: 'monero', symbol: 'XMR', name: 'Monero', color: '#FF6600' },
  { id: 'bittensor', symbol: 'TAO', name: 'Bittensor', color: '#818CF8' },
  { id: 'elrond-erd-2', symbol: 'EGLD', name: 'MultiversX', color: '#1A6BF4' },
  { id: 'dai', symbol: 'DAI', name: 'Dai', color: '#F5AC37' },
  { id: 'book-of-meme', symbol: 'BOME', name: 'BOOK OF MEME', color: '#FF6B35' },
  { id: 'turbo', symbol: 'TURBO', name: 'Turbo', color: '#FF4500' },
  { id: 'jupiter-exchange-solana', symbol: 'JUP', name: 'Jupiter', color: '#C7B06D' },
];

export const FIAT_CURRENCIES: FiatCurrency[] = [
  { symbol: 'USD', name: 'US Dollar', countryCode: 'US', sign: '$' },
  { symbol: 'INR', name: 'Indian Rupee', countryCode: 'IN', sign: '₹' },
  { symbol: 'EUR', name: 'Euro', countryCode: 'EU', sign: '€' },
  { symbol: 'GBP', name: 'British Pound', countryCode: 'GB', sign: '£' },
  { symbol: 'AED', name: 'UAE Dirham', countryCode: 'AE', sign: 'د.إ' },
  { symbol: 'SAR', name: 'Saudi Riyal', countryCode: 'SA', sign: '﷼' },
  { symbol: 'PKR', name: 'Pakistani Rupee', countryCode: 'PK', sign: '₨' },
  { symbol: 'BDT', name: 'Bangladeshi Taka', countryCode: 'BD', sign: '৳' },
  { symbol: 'JPY', name: 'Japanese Yen', countryCode: 'JP', sign: '¥' },
  { symbol: 'CNY', name: 'Chinese Yuan', countryCode: 'CN', sign: '¥' },
  { symbol: 'RUB', name: 'Russian Ruble', countryCode: 'RU', sign: '₽' },
  { symbol: 'AUD', name: 'Australian Dollar', countryCode: 'AU', sign: 'A$' },
  { symbol: 'CAD', name: 'Canadian Dollar', countryCode: 'CA', sign: 'C$' },
  { symbol: 'SGD', name: 'Singapore Dollar', countryCode: 'SG', sign: 'S$' },
  { symbol: 'HKD', name: 'Hong Kong Dollar', countryCode: 'HK', sign: 'HK$' },
  { symbol: 'THB', name: 'Thai Baht', countryCode: 'TH', sign: '฿' },
  { symbol: 'MYR', name: 'Malaysian Ringgit', countryCode: 'MY', sign: 'RM' },
  { symbol: 'ZAR', name: 'South African Rand', countryCode: 'ZA', sign: 'R' },
  { symbol: 'CHF', name: 'Swiss Franc', countryCode: 'CH', sign: 'Fr' },
  { symbol: 'SEK', name: 'Swedish Krona', countryCode: 'SE', sign: 'kr' },
  { symbol: 'NOK', name: 'Norwegian Krone', countryCode: 'NO', sign: 'kr' },
  { symbol: 'DKK', name: 'Danish Krone', countryCode: 'DK', sign: 'kr' },
  { symbol: 'TRY', name: 'Turkish Lira', countryCode: 'TR', sign: '₺' },
  { symbol: 'BRL', name: 'Brazilian Real', countryCode: 'BR', sign: 'R$' },
  { symbol: 'MXN', name: 'Mexican Peso', countryCode: 'MX', sign: '$' },
  { symbol: 'IDR', name: 'Indonesian Rupiah', countryCode: 'ID', sign: 'Rp' },
  { symbol: 'KRW', name: 'South Korean Won', countryCode: 'KR', sign: '₩' },
  { symbol: 'PHP', name: 'Philippine Peso', countryCode: 'PH', sign: '₱' },
  { symbol: 'NGN', name: 'Nigerian Naira', countryCode: 'NG', sign: '₦' },
  { symbol: 'PLN', name: 'Polish Zloty', countryCode: 'PL', sign: 'zł' },
];

export const POPULAR_PAIRS = [
  { from: 'bitcoin', fromSymbol: 'BTC', to: 'inr', toDisplay: 'INR' },
  { from: 'bitcoin', fromSymbol: 'BTC', to: 'usd', toDisplay: 'USD' },
  { from: 'ethereum', fromSymbol: 'ETH', to: 'inr', toDisplay: 'INR' },
  { from: 'ethereum', fromSymbol: 'ETH', to: 'usd', toDisplay: 'USD' },
  { from: 'dogecoin', fromSymbol: 'DOGE', to: 'inr', toDisplay: 'INR' },
  { from: 'dogecoin', fromSymbol: 'DOGE', to: 'usd', toDisplay: 'USD' },
  { from: 'solana', fromSymbol: 'SOL', to: 'usd', toDisplay: 'USD' },
  { from: 'solana', fromSymbol: 'SOL', to: 'inr', toDisplay: 'INR' },
  { from: 'ripple', fromSymbol: 'XRP', to: 'usd', toDisplay: 'USD' },
  { from: 'shiba-inu', fromSymbol: 'SHIB', to: 'inr', toDisplay: 'INR' },
  { from: 'pepe', fromSymbol: 'PEPE', to: 'usd', toDisplay: 'USD' },
  { from: 'binancecoin', fromSymbol: 'BNB', to: 'usd', toDisplay: 'USD' },
];

export const CONVERSION_TABLE_AMOUNTS = [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10, 25, 50, 100];

export const FAQ_ITEMS = [
  {
    q: 'How does the crypto converter work?',
    a: 'Our converter fetches live prices from CoinGecko API and calculates conversions in real time. Prices auto-refresh every 5 seconds to ensure accuracy.',
  },
  {
    q: 'Which cryptocurrencies are supported?',
    a: 'We support 65+ major cryptocurrencies including BTC, ETH, BNB, SOL, XRP, DOGE, SHIB, PEPE, and thousands more fetched dynamically from CoinGecko.',
  },
  {
    q: 'Which fiat currencies are supported?',
    a: 'We support 30+ fiat currencies including USD, INR, EUR, GBP, AED, SAR, JPY, CNY, AUD, CAD, and many more.',
  },
  {
    q: 'How accurate are the conversion rates?',
    a: 'Rates are sourced from CoinGecko which aggregates prices from hundreds of exchanges. Prices refresh every 5 seconds and reflect global market averages.',
  },
  {
    q: 'Can I convert crypto to crypto?',
    a: 'Yes! Our converter supports crypto-to-crypto conversions. Select any cryptocurrency as both the source and destination to see the cross-rate.',
  },
  {
    q: 'Is this converter free to use?',
    a: 'Absolutely. The TheMarketStories crypto converter is completely free with no registration required.',
  },
];
