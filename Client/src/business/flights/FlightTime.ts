import Daytime from '@core/types/Daytime';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import ModelConvertable, { getOverrided } from 'src/business/ModelConvertable';
import DeepWritablePartial from '@core/types/DeepWritablePartial';

export default class FlightTime implements ModelConvertable<FlightTimeModel> {
  /** In minutes. */ readonly stdLowerBound: Daytime;
  /** In minutes. */ readonly stdUpperBound: Daytime;

  constructor(raw: FlightTimeModel) {
    this.stdLowerBound = new Daytime(raw.stdLowerBound);
    this.stdUpperBound = new Daytime(raw.stdUpperBound);
  }

  extractModel(overrides?: DeepWritablePartial<FlightTimeModel>): FlightTimeModel {
    return {
      stdLowerBound: getOverrided(this.stdLowerBound.minutes, overrides, 'stdLowerBound'),
      stdUpperBound: getOverrided(this.stdUpperBound.minutes, overrides, 'stdUpperBound')
    };
  }
}
