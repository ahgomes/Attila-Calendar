const mongoConnection = require('../config/mongoConnection');

const data = require('../data');
const eventsApi = data.eventsApi;
const convertApi = data.convertApi;
const validateApi = data.validateApi;

async function main() {
    const db = await mongoConnection.connectToDb();
    await db.dropDatabase();

    // do something with the database here
    try {
        const date_str = '02/29/2020';
        const time_str = '00:51';

        const dateObj = convertApi.stringToDate(date_str, time_str);
        validateApi.isValidDate(dateObj);

        console.log(
            dateObj.toLocaleString('en-US', {
                timeZone: 'America/New_York',
            })
        );
    } catch (e) {
        console.log(e);
    }

    await db.dropDatabase();
    await mongoConnection.closeConnection();
}

main();
