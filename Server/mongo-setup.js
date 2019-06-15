// The MongoDB script to create the initial database structure from scratch.
// Use something like this on a fresh database:
//     $ .\mongo.exe mongodb://localhost:27017/planassist-dev 'C:\Users\951136\Desktop\PlanAssist\Server\mongo-setup.js'

db.createCollection('preplans');
db.getCollection('preplans').ensureIndex({ _id: 1, userId: 1, published: 1 });

db.createCollection('flightRequirements');
db.getCollection('flightRequirements').ensureIndex({ _id: 1, preplanId: 1 });

db.createCollection('masterDataAircraftGroups');
db.getCollection('masterDataAircraftGroups').ensureIndex({ _id: 1 });

db.createCollection('masterDataConstraints');
db.getCollection('masterDataConstraints').ensureIndex({ _id: 1 });
