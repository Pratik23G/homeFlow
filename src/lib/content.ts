export const CITIES = [
  "San Francisco",
  "Daly City",
  "Colma",
  "Brisbane",
  "South San Francisco",
  "San Bruno",
  "Millbrae",
  "Burlingame",
  "San Mateo",
  "Foster City",
  "Belmont",
  "San Carlos",
  "Redwood City",
  "Atherton",
  "Menlo Park",
  "East Palo Alto",
  "Palo Alto",
] as const;

export const DEPOSIT = 80;
export const CANCEL_HOURS = 24;
export const BOOKING_WINDOW_DAYS = 90;

// Displayed service area (matches the approved brief).
export const SERVICE_AREA_CITIES = [
  "San Francisco",
  "Daly City",
  "South San Francisco",
  "San Bruno",
  "Millbrae",
  "Burlingame",
  "San Mateo",
  "Foster City",
  "Belmont",
  "San Carlos",
  "Redwood City",
  "Menlo Park",
  "Palo Alto",
] as const;

// Business contact details.
export const INSTAGRAM_URL = "https://www.instagram.com/homeflowpeninsula";
export const BUSINESS_PHONE = "+1-650-222-1911";
export const BUSINESS_EMAIL = "homeflowpeninsula@gmail.com";

// Payment handles shown to clients. A blank one is hidden.
export const PAY_ZELLE = "+1-650-222-1911"; // email or phone registered with Zelle
export const PAY_VENMO = "@HomeFlowPeninsula";
export const PAY_APPLE_PAY = "+1-650-222-1911"; // Apple Cash phone number or email, sent via Messages
