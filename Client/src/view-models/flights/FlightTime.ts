import Daytime from '@core/types/Daytime';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';

export default class FlightTime {
  /** In minutes. */ readonly stdLowerBound: Daytime;
  /** In minutes. */ readonly stdUpperBound: Daytime;

  constructor(raw: FlightTimeModel) {
    this.stdLowerBound = new Daytime(raw.stdLowerBound);
    this.stdUpperBound = new Daytime(raw.stdUpperBound);
  }
}
