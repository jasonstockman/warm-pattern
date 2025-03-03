/**
 * Represents a financial institution available through Plaid
 */
export interface Institution {
  /** Unique identifier for the institution */
  institution_id: string;
  /** Name of the institution */
  name: string;
  /** Plaid products supported by the institution */
  products: string[];
  /** Country codes where the institution operates */
  country_codes: string[];
  /** URL to the institution's logo */
  logo?: string;
  /** Primary color of the institution */
  primary_color?: string;
  /** URL to the institution's website */
  url?: string;
}

/**
 * Parameters for fetching institutions
 */
export interface GetInstitutionsParams {
  /** Number of institutions to return */
  count?: number;
  /** Number of institutions to skip */
  offset?: number;
} 