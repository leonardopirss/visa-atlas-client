import type {
  ApiError,
  CountriesResponse,
  CountryDetail,
  FilterDefaults,
  MapStatisticsResponse,
  TimeseriesResponse,
} from '@visa-atlas/contracts';

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasString(value: JsonObject, key: string): boolean {
  return typeof value[key] === 'string';
}

function hasArray(value: JsonObject, key: string): boolean {
  return Array.isArray(value[key]);
}

function hasNumber(value: JsonObject, key: string): boolean {
  return typeof value[key] === 'number' && Number.isFinite(value[key]);
}

function isHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function hasPurpose(value: JsonObject): boolean {
  return value.purpose === 'WORK' || value.purpose === 'STUDY';
}

function invalidPayload(endpoint: string): never {
  throw new Error(`A API retornou um payload inválido para ${endpoint}.`);
}

function hasValidPopulationEnvelope(value: JsonObject): boolean {
  if (!('populationBasis' in value)) return hasString(value, 'citizenship');
  if (!hasString(value, 'programKey')) return false;
  if (value.populationBasis === 'NATIONAL') return value.citizenship === null;
  return (
    value.populationBasis === 'CITIZENSHIP' && hasString(value, 'citizenship')
  );
}

function isSourceRef(value: unknown, releaseRequired = false): boolean {
  if (
    !isObject(value) ||
    !hasString(value, 'organization') ||
    !hasString(value, 'datasetCode') ||
    !isHttpUrl(value.url)
  ) {
    return false;
  }
  if (releaseRequired && !hasString(value, 'releaseId')) return false;
  if (value.methodologyUrl !== undefined && value.methodologyUrl !== null) {
    if (!isHttpUrl(value.methodologyUrl)) return false;
  }
  return true;
}

function isPopulationScope(value: unknown): boolean {
  if (
    !isObject(value) ||
    !hasString(value, 'populationKey') ||
    !hasString(value, 'programKey') ||
    !hasString(value, 'label')
  ) {
    return false;
  }
  if (value.basis === 'NATIONAL') {
    return value.populationKey === 'ALL' && !('citizenshipIso3' in value);
  }
  return (
    value.basis === 'CITIZENSHIP' &&
    hasString(value, 'citizenshipIso3') &&
    value.populationKey === value.citizenshipIso3
  );
}

function isDerivationOperand(value: unknown): boolean {
  return (
    isObject(value) &&
    hasString(value, 'observationId') &&
    hasString(value, 'metricType') &&
    typeof value.value === 'number' &&
    Number.isFinite(value.value) &&
    value.value >= 0 &&
    value.unit === 'COUNT' &&
    hasString(value, 'period') &&
    hasString(value, 'releaseId') &&
    hasString(value, 'comparisonGroupId') &&
    hasString(value, 'sourceCategoryCode') &&
    value.coefficient === 1
  );
}

function isMetricDerivation(value: unknown): boolean {
  if (
    !isObject(value) ||
    (value.formula !== 'APPROVAL_RATE' && value.formula !== 'REFUSAL_RATE') ||
    value.precision !== 2 ||
    !Array.isArray(value.numerator) ||
    value.numerator.length === 0 ||
    !Array.isArray(value.denominator) ||
    value.denominator.length === 0
  ) {
    return false;
  }
  return (
    value.numerator.every(isDerivationOperand) &&
    value.denominator.every(isDerivationOperand)
  );
}

function isMeasurement(value: unknown): boolean {
  if (!isObject(value) || typeof value.approximate !== 'boolean') return false;
  if (
    value.roundingIncrement !== undefined &&
    value.roundingIncrement !== null &&
    (typeof value.roundingIncrement !== 'number' ||
      !Number.isInteger(value.roundingIncrement) ||
      value.roundingIncrement <= 0)
  ) {
    return false;
  }
  return (
    value.precision === undefined ||
    value.precision === null ||
    (typeof value.precision === 'number' &&
      Number.isInteger(value.precision) &&
      value.precision >= 0)
  );
}

function isRequirementCondition(value: unknown): boolean {
  if (!isObject(value) || typeof value.kind !== 'string') return false;
  const numericKinds = new Set([
    'FAMILY_SIZE',
    'DURATION_MONTHS',
    'FUNDS_HOLDING_DAYS',
  ]);
  if (numericKinds.has(value.kind)) {
    return (
      ['EQ', 'GTE', 'LTE', 'GT'].includes(String(value.operator)) &&
      typeof value.value === 'number' &&
      Number.isInteger(value.value) &&
      value.value >= 0
    );
  }
  if (value.kind === 'PROGRAM_LEVEL' || value.kind === 'OCCUPATION_CLASS') {
    return (
      (value.operator === 'EQ' && typeof value.value === 'string') ||
      (value.operator === 'IN' &&
        Array.isArray(value.value) &&
        value.value.length > 0 &&
        value.value.every((entry) => typeof entry === 'string'))
    );
  }
  if (
    [
      'GEOGRAPHIC_SCOPE',
      'APPLICATION_LOCATION',
      'APPLICATION_CONTEXT',
      'PERSON_ROLE',
    ].includes(value.kind)
  ) {
    return (
      (value.operator === 'EQ' || value.operator === 'NOT_EQ') &&
      typeof value.value === 'string'
    );
  }
  return false;
}

function hasRequirementCommon(value: JsonObject): boolean {
  return (
    Array.isArray(value.conditions) &&
    value.conditions.every(isRequirementCondition) &&
    typeof value.conditionSchemaVersion === 'string' &&
    /^v\d+$/.test(value.conditionSchemaVersion) &&
    typeof value.effectiveAt === 'string' &&
    typeof value.verifiedAt === 'string' &&
    isHttpUrl(value.officialUrl) &&
    isSourceRef(value.source, true)
  );
}

function isVisaProgramRequirement(value: unknown): boolean {
  if (
    !isObject(value) ||
    !isObject(value.value) ||
    !hasRequirementCommon(value)
  ) {
    return false;
  }
  if (value.type === 'APPLICATION_FEE' || value.type === 'PROOF_OF_FUNDS') {
    return (
      value.value.kind === 'MONEY' &&
      typeof value.value.amount === 'string' &&
      /^\d+(\.\d+)?$/.test(value.value.amount) &&
      typeof value.value.currency === 'string' &&
      /^[A-Z]{3}$/.test(value.value.currency) &&
      [
        'PER_APPLICATION',
        'PER_PERSON',
        'PER_MONTH',
        'PER_YEAR',
        'TOTAL',
      ].includes(String(value.value.basis))
    );
  }
  if (
    value.type === 'DEPENDANTS_ALLOWED' ||
    value.type === 'SPOUSE_WORK_RIGHT' ||
    value.type === 'RENEWABLE'
  ) {
    return (
      value.value.kind === 'STATE' &&
      ['YES', 'NO', 'DEPENDS', 'UNKNOWN'].includes(String(value.value.state)) &&
      (value.value.state !== 'DEPENDS' ||
        (Array.isArray(value.conditions) && value.conditions.length > 0))
    );
  }
  return (
    value.type === 'PROCESSING_TIME_TARGET' &&
    value.value.kind === 'DURATION' &&
    typeof value.value.amount === 'number' &&
    Number.isInteger(value.value.amount) &&
    value.value.amount > 0 &&
    ['DAYS_CALENDAR', 'DAYS_BUSINESS', 'WEEKS', 'MONTHS', 'YEARS'].includes(
      String(value.value.unit),
    )
  );
}

function isVisaProgramPathway(value: unknown): boolean {
  return (
    isObject(value) &&
    hasString(value, 'targetRouteCode') &&
    (value.pathwayType === 'POST_STUDY_WORK' ||
      value.pathwayType === 'PERMANENT_RESIDENCE') &&
    ['YES', 'DEPENDS', 'UNKNOWN'].includes(String(value.state)) &&
    Array.isArray(value.conditions) &&
    value.conditions.every(isRequirementCondition) &&
    typeof value.conditionSchemaVersion === 'string' &&
    /^v\d+$/.test(value.conditionSchemaVersion) &&
    typeof value.effectiveAt === 'string' &&
    typeof value.verifiedAt === 'string' &&
    isHttpUrl(value.officialUrl) &&
    isSourceRef(value.source, true)
  );
}

function isStatistic(value: unknown): boolean {
  if (
    !isObject(value) ||
    !hasString(value, 'metricType') ||
    !(typeof value.value === 'number' || value.value === null) ||
    !hasString(value, 'dataStatus') ||
    !hasString(value, 'freshness') ||
    !hasString(value, 'unit') ||
    !hasString(value, 'period') ||
    !('comparisonGroupId' in value) ||
    !('source' in value) ||
    !(value.source === null || isSourceRef(value.source))
  ) {
    return false;
  }
  if (
    value.populationScope !== undefined &&
    !isPopulationScope(value.populationScope)
  ) {
    return false;
  }
  if (value.derivation !== undefined && !isMetricDerivation(value.derivation))
    return false;
  return value.measurement === undefined || isMeasurement(value.measurement);
}

function isVisaProgram(value: unknown): boolean {
  if (!isObject(value)) return false;
  if (
    value.requirements !== undefined &&
    (!Array.isArray(value.requirements) ||
      !value.requirements.every(isVisaProgramRequirement))
  ) {
    return false;
  }
  return (
    value.pathways === undefined ||
    (Array.isArray(value.pathways) &&
      value.pathways.every(isVisaProgramPathway))
  );
}

export function parseApiError(value: unknown): ApiError | null {
  if (
    !isObject(value) ||
    !hasString(value, 'code') ||
    !hasString(value, 'message') ||
    !hasString(value, 'correlationId')
  ) {
    return null;
  }
  return value as ApiError;
}

export function parseFilterDefaults(value: unknown): FilterDefaults {
  if (
    !isObject(value) ||
    !hasValidPopulationEnvelope(value) ||
    !hasPurpose(value) ||
    !hasString(value, 'metricType') ||
    !('year' in value) ||
    !('comparisonGroupId' in value)
  ) {
    return invalidPayload('/filters/defaults');
  }
  return value as FilterDefaults;
}

export function parseCountries(value: unknown): CountriesResponse {
  if (
    !isObject(value) ||
    !hasArray(value, 'data') ||
    typeof value.page !== 'number' ||
    typeof value.pageSize !== 'number' ||
    typeof value.total !== 'number'
  ) {
    return invalidPayload('/countries');
  }
  return value as CountriesResponse;
}

export function parseMapStatistics(value: unknown): MapStatisticsResponse {
  if (
    !isObject(value) ||
    !hasValidPopulationEnvelope(value) ||
    !hasPurpose(value) ||
    !hasArray(value, 'countries') ||
    !('year' in value)
  ) {
    return invalidPayload('/stats/map');
  }
  return value as MapStatisticsResponse;
}

export function parseCountryDetail(value: unknown): CountryDetail {
  if (
    !isObject(value) ||
    !isObject(value.country) ||
    !hasString(value.country, 'iso3') ||
    !isStatistic(value.statistics) ||
    !hasArray(value, 'classifications') ||
    !hasArray(value, 'visaPrograms') ||
    !hasArray(value, 'sources')
  ) {
    return invalidPayload('/countries/{iso3}');
  }
  const visaPrograms = value.visaPrograms;
  if (!Array.isArray(visaPrograms) || !visaPrograms.every(isVisaProgram)) {
    return invalidPayload('/countries/{iso3}');
  }
  return value as CountryDetail;
}

export function parseTimeseries(value: unknown): TimeseriesResponse {
  if (
    !isObject(value) ||
    !hasString(value, 'iso3') ||
    !hasValidPopulationEnvelope(value) ||
    !hasPurpose(value) ||
    !hasString(value, 'metricType') ||
    !hasArray(value, 'points')
  ) {
    return invalidPayload('/countries/{iso3}/timeseries');
  }
  const points = value.points;
  if (
    !Array.isArray(points) ||
    !points.every((point: unknown) => {
      return (
        isObject(point) &&
        hasNumber(point, 'year') &&
        isStatistic(point.statistic)
      );
    })
  ) {
    return invalidPayload('/countries/{iso3}/timeseries');
  }
  return value as TimeseriesResponse;
}
