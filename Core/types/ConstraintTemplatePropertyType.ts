export const ConstraintTemplatePropertyTypes = <const>[
  'CHECK_BOX',
  'SELECT',
  'TIME_SPAN',
  'AIRPORT',
  'AIRPORT_LIST',
  'AIRCRAFT_REGISTER',
  'AIRCRAFT_REGISTER_LIST',
  'AIRCRAFT_SELECTION'
];

type ConstraintTemplatePropertyType = typeof ConstraintTemplatePropertyTypes[number];

export default ConstraintTemplatePropertyType;
