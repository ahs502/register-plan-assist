const xmlJs = require('xml-js');
const xmlToJsonStream = require('xml-to-json-stream');

const data1 = {
  blockTime: 4,
  originPermission: true,
  destinationPermission: true,
  required: true,
  rsx: 'REAL',
  times: [{ stdLowerBound: 0, stdUpperBound: 1 }, { stdLowerBound: 8, stdUpperBound: 18 }],
  allowedIdentities: [{ type: 'TYPE_EXISTING', entityId: 1 }, { type: 'TYPE_DUMMY', entityId: 3 }],
  forbiddenIdentities: [{ type: 'REGISTER', entityId: 5 }, { type: 'GROUP', entityId: 7 }]
};

const WeekdayFlightRequirementEntity = [
  {
    Scope: data1,
    Notes: 'fffffffffffffffff',
    Freezed: true,
    Day: 1,
    Flight: {
      Std: 700,
      Id_SircraftRegister: 1
    }
  },
  {
    Scope: data1,
    Notes: 'dffsdfsdfsf',
    Freezed: true,
    Day: 2,
    Flight: {
      Std: 700,
      Id_SircraftRegister: 1
    }
  }
];
//----------------------------------------
function fightScopeEntityToXml(data) {
  const FightScopeXml = {
    Scope: {
      _attributes: { BlockTime: data.blockTime, OriginPermission: data.originPermission, DestinationPermission: data.destinationPermission, Required: data.require, Rsx: data.rsx },
      Times: {
        Time: data.times.map(t => {
          return {
            _attributes: {
              StdLowerBound: t.stdLowerBound,
              StdUpperBound: t.stdUpperBound
            }
          };
        })
      },
      AllowedIdentities: {
        AllowedIdentitie: data.allowedIdentities.map(t => {
          return {
            _attributes: {
              Type: t.type,
              Id_Entity: t.entityId
            }
          };
        })
      },
      ForbiddenIdentities: {
        ForbiddenIdentitie: data.forbiddenIdentities.map(t => {
          return {
            _attributes: {
              Type: t.type,
              Id_Entity: t.entityId
            }
          };
        })
      }
    }
  };
  const xml = xmlJs.json2xml(FightScopeXml, { compact: true });
  return xml;
}

function weekdayFlightRequirementEntityToXml(data) {
  const weekdayFlightRequirementXml = {
    weekdayFlightRequirement: {
      _attributes: {
        Notes: data.Notes,
        Freezed: data.Freezed,
        Day: data.Day
      },
      Scopes: '@scope',
      Flight: {
        _attributes: {
          Std: data.Flight.Std,
          Id_SircraftRegister: data.Flight.Id_SircraftRegister
        }
      }
    }
  };
  let xml = xmlJs.json2xml(JSON.stringify(weekdayFlightRequirementXml), { compact: true });
  let scope = fightScopeEntityToXml(data.Scope);
  xml = xml.replace('<Scopes>@scope</Scopes>', scope);

  return xml;
}

let xml = '<weekdayFlightRequirements>' + WeekdayFlightRequirementEntity.map(c => weekdayFlightRequirementEntityToXml(c)).join('') + '</weekdayFlightRequirements>';
console.log('>> XML = ', xml);
//-----------------------------------------

function weekdayFlightRequirementXmlToJson(xml) {
  const json = JSON.parse(xmlJs.xml2json(xml, { compact: true }));
  const jResult = json.weekdayFlightRequirements.map(t => {
    return {
      Scope: {
        BlockTime: Number(t.Scope._attributes.BlockTime),
        OriginPermission: Boolean(t.Scope._attributes.OriginPermission),
        DestinationPermission: t.Scope._attributes.DestinationPermission,
        Required: t.Scope._attributes.Required,
        Rsx: t.Scope._attributes.Rsx,
        Times: t.Scope.Times.Time.map(t => {
          return {
            stdLowerBound: Number(t._attributes.StdLowerBound),
            stdUpperBound: Number(t._attributes.StdUpperBound)
          };
        }),
        AllowedIdentities: t.Scope.AllowedIdentities.AllowedIdentitie.map(t => {
          return {
            type: t._attributes.Type,
            entityId: t._attributes.Id_Entity
          };
        }),
        ForbiddenIdentities: t.Scope.ForbiddenIdentities.ForbiddenIdentitie.map(t => {
          return {
            type: t._attributes.Type,
            entityId: t._attributes.Id_Entity
          };
        })
      },
      Notes: t._attributes.Notes,
      Freezed: Boolean(t._attributes.Freezed),
      Day: Number(t._attributes.Day),
      Flight: {
        Std: Number(t.Flight._attributes.Std),
        Id_SircraftRegister: t.Flight._attributes.Id_SircraftRegister
      }
    };
  });
  return json;
}
const json = weekdayFlightRequirementXmlToJson(xml);
console.log('>> json = ', json);
//-----------------------------------------
// Scope: fightScopeEntityToXml(data.Scope),
//   Flight: {
//     _attributes: {
//       Std: data.Flight.Std,
//       Id_SircraftRegister: data.Flight.Id_SircraftRegister
//     }
//   }
