const mongoConnection = require('../config/mongoConnection');

const data = require('../data');
const validate = data.validate;

async function main() {
    const db = await mongoConnection.connectToDb();
    await db.dropDatabase();

    // do something with the database here

    await db.dropDatabase();
    await mongoConnection.closeConnection();
}

main();
