export type { components, operations, paths } from "./generated/api";

import type { components } from "./generated/api";

export type ApiError = components["schemas"]["ApiError"];
export type Classification = components["schemas"]["Classification"];
export type CountriesResponse = components["schemas"]["CountriesResponse"];
export type Country = components["schemas"]["Country"];
export type CountryDetail = components["schemas"]["CountryDetail"];
export type DataStatus = components["schemas"]["DataStatus"];
export type FilterDefaults = components["schemas"]["FilterDefaults"];
export type Freshness = components["schemas"]["Freshness"];
export type MapStatisticsResponse =
  components["schemas"]["MapStatisticsResponse"];
export type MetricType = components["schemas"]["MetricType"];
export type SourceRef = components["schemas"]["SourceRef"];
export type Statistic = components["schemas"]["Statistic"];
export type TimeseriesResponse = components["schemas"]["TimeseriesResponse"];
export type VisaProgram = components["schemas"]["VisaProgram"];
