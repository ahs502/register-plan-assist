export default interface FlightScopeEntity {
  readonly BlockTime: string;
  readonly Times: string;
  readonly Slot: boolean;
  readonly SlotComment: string;
  readonly Required: boolean;
  readonly AllowedIdentities: string;
  readonly ForbiddenIdentities: string;
}
