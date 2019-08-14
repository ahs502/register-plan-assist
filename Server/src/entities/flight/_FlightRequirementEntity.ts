export default interface FlightRequirementEntity {
  readonly id: string;
  readonly preplanId: string;
  readonly scope: string;
  readonly days: string;
  readonly ignored: boolean;
  readonly label: string;
  readonly stcId: string;
  readonly flightNumber: string;
  readonly departureAirportId: string;
  readonly arrivalAirportId: string;
}

// export function convertFlightRequirementEntityToModel(data: FlightRequirementEntity): FlightRequirementModel {
//   return {
//     id: data._id!.toHexString(),
//     definition: convertFlightDefinitionEntityToModel(data.definition),
//     scope: convertFlightScopeEntityToModel(data.scope),
//     days: data.days.map(convertWeekdayFlightRequirementEntityToModel),
//     ignored: data.ignored
//   };
// }
