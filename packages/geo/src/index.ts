export const COUNTRY_BOUNDARIES_URL = new URL(
  "../data/ne_110m_admin_0_countries.geojson",
  import.meta.url,
).href;

export const COUNTRY_BOUNDARIES_ATTRIBUTION =
  "Made with Natural Earth · Public domain";

export const COUNTRY_ISO3_PROPERTY = "iso3";

export type CountryBoundaryProperties = {
  iso3: string;
  name: string;
  continent: string;
};
