import { createClient } from "./supabase";

export type Currency = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  conversion_rate: number;
};

/**
 * Fetch all available currencies from the database
 */
export async function fetchCurrencies(): Promise<Currency[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .order('code');
    
  if (error) {
    console.error('Error fetching currencies:', error);
    throw new Error('Failed to fetch currencies');
  }
  
  return data as Currency[];
}

/**
 * Get a single currency by its code
 */
export async function getCurrencyByCode(code: string): Promise<Currency> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .eq('code', code)
    .single();
    
  if (error) {
    console.error(`Error fetching currency with code ${code}:`, error);
    throw new Error(`Failed to fetch currency with code ${code}`);
  }
  
  return data as Currency;
}

/**
 * Convert an amount from one currency to another using stored conversion rates
 * @param amount The amount to convert
 * @param fromCurrency The source currency code
 * @param toCurrency The target currency code
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const supabase = createClient();
    
    // Fetch both currencies to get their conversion rates
    const { data, error } = await supabase
      .from('currencies')
      .select('code, conversion_rate')
      .in('code', [fromCurrency, toCurrency]);
      
    if (error) throw error;
    
    if (!data || data.length !== 2) {
      throw new Error(`Could not find conversion rates for ${fromCurrency} and ${toCurrency}`);
    }
    
    // Find the from and to currencies in the result
    const fromCurrencyData = data.find((c) => c.code === fromCurrency);
    const toCurrencyData = data.find((c) => c.code === toCurrency);
    
    if (!fromCurrencyData || !toCurrencyData) {
      throw new Error(`Missing conversion rate for ${!fromCurrencyData ? fromCurrency : toCurrency}`);
    }
    
    // Convert via INR as the base currency
    // First convert to INR, then to target currency
    const amountInINR = amount * fromCurrencyData.conversion_rate;
    const convertedAmount = amountInINR / toCurrencyData.conversion_rate;
    
    // Round to 2 decimal places
    return Math.round(convertedAmount * 100) / 100;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw new Error(`Failed to convert from ${fromCurrency} to ${toCurrency}`);
  }
}

/**
 * Format an amount with currency symbol
 * @param amount The amount to format
 * @param currencyCode The currency code
 */
export async function formatAmountWithCurrency(
  amount: number | null,
  currencyCode: string
): Promise<string> {
  if (amount === null || amount === undefined) {
    return '-';
  }
  
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('currencies')
      .select('symbol')
      .eq('code', currencyCode)
      .single();
      
    if (error) throw error;
    
    return `${data.symbol} ${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  } catch (error) {
    console.error('Error formatting amount with currency:', error);
    // Fallback to just the amount with currency code
    return `${currencyCode} ${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}

/**
 * Get the exchange rate between two currencies using stored conversion rates
 * @param fromCurrency The source currency code
 * @param toCurrency The target currency code
 */
export function calculateExchangeRate(
  fromCurrencyRate: number,
  toCurrencyRate: number
): number {
  // Calculate exchange rate based on the stored INR conversion rates
  const exchangeRate = fromCurrencyRate / toCurrencyRate;
  
  // Round to 4 decimal places
  return Math.round(exchangeRate * 10000) / 10000;
} 