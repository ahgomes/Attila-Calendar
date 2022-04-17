const mongoConnection = require('../config/mongoConnection');

const data = require('../data');
const eventsApi = data.eventsApi;
const validateApi = data.validateApi;

async function main() {
    const db = await mongoConnection.connectToDb();
    await db.dropDatabase();

    // do something with the database here
    try {
        console.log('Something');
    } catch (e) {
        console.log(e);
    }

    await db.dropDatabase();
    await mongoConnection.closeConnection();
}

main();
