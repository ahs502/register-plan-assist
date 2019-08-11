export default interface WeekdayFlightRequirementEntity {
  readonly Scope: string;
  readonly Notes: string;
  readonly Day: number;
  readonly FlightStd: number;
  readonly Id_FlightAircraftRegister: string;
}

// export function convertWeekdayFlightRequirementEntityToModel(data: WeekdayFlightRequirementEntity): WeekdayFlightRequirementModel {
//   return {
//     scope: convertFlightScopeEntityToModel(data.scope),
//     notes: data.notes,
//     day: data.day,
//     flight: convertFlightEntityToModel(data.flight)
//   };
// }
