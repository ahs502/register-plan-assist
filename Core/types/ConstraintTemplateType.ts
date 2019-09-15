export const ConstraintTemplateTypes = <const>[
  // Non instantiable constraint types:
  'NO_CONFLICTION_IN_FLIGHTS', // Zeus
  'AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS', // Eldora
  'MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS', // Marraul
  'VALID_PERIOD_CHECK_ON_AIRCRAFTS', // Dora
  'FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS', // Gimaru

  // Instantiable constraint types:
  'AIRCRAFT_RESTRICTION_ON_AIRPORTS', // Lema & Bizu
  'AIRPORT_RESTRICTION_ON_AIRCRAFTS', // Bartok
  'BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS', // Hana
  'ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS', // Kanju
  'AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS' // Aliso
];

type ConstraintTemplateType = typeof ConstraintTemplateTypes[number];

export default ConstraintTemplateType;
