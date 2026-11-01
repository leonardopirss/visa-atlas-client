export const COUNTRY_BOUNDARIES_URL = new URL(
  "../data/ne_110m_admin_0_countries.geojson",
  import.meta.url,
).href;

export const COUNTRY_ISO3_PROPERTY = "iso3";

export const COUNTRY_BOUNDARY_ISO3_ALIASES: Readonly<
  Record<string, string | null>
> = {
  SAH: "ESH",
  PSX: "PSE",
  SDS: "SSD",
  CYN: "CYP",
  SOL: "SOM",
  KOS: null,
};

export type CountryBoundaryProperties = {
  iso3: string;
  name: string;
  continent: string;
};
