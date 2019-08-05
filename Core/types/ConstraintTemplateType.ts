export const ConstraintTemplateTypes = <const>[
  'AIRCRAFT_RESTRICTION_ON_AIRPORTS', // Lema & Bizu
  'BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS', // Hana
  'ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS', // Kanju
  'AIRPORT_RESTRICTION_ON_AIRCRAFTS', // Bartok
  'AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS', // Aliso
  'FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS', // Gimaru
  'AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS', // Eldora
  'NO_CONFLICTION_IN_FLIGHTS', // Zeus
  'MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS', // Marraul
  'VALID_PERIOD_CHECK_ON_AIRCRAFTS' // Dora
];

type ConstraintTemplateType = typeof ConstraintTemplateTypes[number];

export default ConstraintTemplateType;