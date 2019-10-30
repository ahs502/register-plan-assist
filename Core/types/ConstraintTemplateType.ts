export const ConstraintTemplateTypes = <const>[
  // Non instantiable constraint types:
  'NO_CONFLICTION_IN_FLIGHTS', // [Zeus] No aircraft can be assigned to more than one flight at any moment.
  'AIRPORT_SEQUENCE_RESTRICTION_ON_FLIGHTS', // [Eldora] Every flight should take off exactly from the same airport as its previous flight lands.
  'MINIMUM_GROUND_TIME_BETWEEN_FLIGHTS', // [Marraul] Every aircraft should rest for at least its required minimum grount time before any of its flights.
  'VALID_PERIOD_CHECK_ON_AIRCRAFTS', // [Dora] No aircraft may be out of its valid period during the preplan date interval.
  'FLIGHT_REQUIREMENT_RESTRICTION_ON_FLIGHTS', // [Gimaru] Every flight should fit in its corresponding flight requirement.

  // Instantiable constraint types:
  'AIRCRAFT_RESTRICTION_ON_AIRPORTS', // [Lema & Bizu] When planning the flights of (some airports), it is (allowed/forbidden) to use (some aircrafts).
  'AIRPORT_RESTRICTION_ON_AIRCRAFTS', // [Bartok] Never assign (some aircraft register) to the flights of any airport, except for (some airport).
  'BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS', // [Hana] When planning flights longer than (some block time), never use (some aircrafts).
  'ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS', // [Kanju] Never plan the flights of (some airport) right after the flights of (some other airport).
  'AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS' // [Aliso] Assign (some aircrafts) to the flights of (some airports), prioritized by order, as much as possible.
];

type ConstraintTemplateType = typeof ConstraintTemplateTypes[number];

export default ConstraintTemplateType;
