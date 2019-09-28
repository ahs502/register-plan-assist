export const ConstraintTemplateDataFieldTypes = <const>[
  'CHECK_BOX',
  'SELECT',
  'TIME_SPAN',
  'AIRPORT',
  'AIRPORT_LIST',
  'AIRCRAFT_REGISTER',
  'AIRCRAFT_REGISTER_LIST',
  'AIRCRAFT_SELECTION'
];

type ConstraintTemplateDataFieldType = typeof ConstraintTemplateDataFieldTypes[number];

export default ConstraintTemplateDataFieldType;
