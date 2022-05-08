/* Here are all the dummy user accounts. Users 3-5 might be of interest because they have randomly generated event data
 * |----------|----------|
 * | USERNAME | PASSWORD |
 * |----------|----------|
 * | user1    | abc123   |
 * |----------|----------|
 * | user2    | abc123   |
 * |----------|----------|
 * | user3    | abc123   |
 * |----------|----------|
 * | user4    | abc123   |
 * |----------|----------|
 * | user5    | abc123   |
 * |----------|----------|
 */

const mongoConnection = require('../config/mongoConnection');

const data = require('../data');
const usersApi = data.usersApi;
const eventsApi = data.eventsApi;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomWords(numWords) {
    let result = '';
    const letters =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (let i = 0; i < numWords; i++) {
        let word = '';
        for (let j = 0; j <= randomInt(3, 8); j++) {
            word += letters[randomInt(0, letters.length - 1)];
        }
        result += i === 0 ? word : ` ${word}`;
    }
    return result;
}

async function main() {
    const db = await mongoConnection.connectToDb();
    await db.dropDatabase();

    let user1 = null,
        user2 = null,
        user3 = null,
        user4 = null,
        user5 = null;

    let calendarId = null,
        eventId = null;

    // create user1
    try {
        console.log('Creating user1...');
        await usersApi.createUser('user1', 'abc123', 'John', 'Smith');
        user1 = await usersApi.getLoggedinUser({ session: { user: 'user1' } });
        calendarId = user1.calendars[0]._id.toString();
        console.log('Successfully created user1');
    } catch (e) {
        console.log('Failed to create user1:');
        console.log(e);
    }

    // create events for user1
    try {
        if (user1 && calendarId) {
            console.log('Creating events for user1...');
            for (let i = 1; i <= 5; i++) {
                await eventsApi.createNewEvent(
                    user1.username,
                    calendarId,
                    `Title ${i}`,
                    `Description ${i}`,
                    i,
                    new Date()
                );
            }
            calendarId = null;
            console.log('Successfully created events for user1');
        }
    } catch (e) {
        console.log('Failed to create events user1:');
        console.log(e);
    }

    console.log();

    // create user2
    try {
        console.log('Creating user2...');
        await usersApi.createUser('user2', 'abc123', 'Adam', 'Miller');
        user2 = await usersApi.getLoggedinUser({ session: { user: 'user2' } });
        calendarId = user2.calendars[0]._id.toString();
        console.log('Successfully created user2');
    } catch (e) {
        console.log('Failed to create user2:');
        console.log(e);
    }

    // create events for user2
    try {
        if (user2 && calendarId) {
            console.log('Creating events for user2...');
            eventId = (
                await eventsApi.createNewEvent(
                    user2.username,
                    calendarId,
                    'CS-546 Final Project',
                    'Must complete the project code and presentation by May 8, 11:59 PM',
                    1,
                    new Date(2022, 4, 8, 23, 59)
                )
            )._id.toString();
            for (let i = 4; i >= 0; i--) {
                await eventsApi.addCommentById(
                    eventId,
                    user2.username,
                    `Uh oh ${5 * i} minutes until the deadline!!!`,
                    new Date(2022, 4, 8, 23, 59 - 5 * i)
                );
            }
            calendarId = null;
            eventId = null;
            console.log('Successfully created events for user2');
        }
    } catch (e) {
        console.log('Failed to create events user2:');
        console.log(e);
    }

    console.log();

    // create user3
    try {
        console.log('Creating user3...');
        await usersApi.createUser('user3', 'abc123', 'Mary', 'Lopez');
        user3 = await usersApi.getLoggedinUser({ session: { user: 'user3' } });
        calendarId = user3.calendars[0]._id.toString();
        console.log('Successfully created user3');
    } catch (e) {
        console.log('Failed to create user3:');
        console.log(e);
    }

    // create events for user3
    try {
        if (user3 && calendarId) {
            console.log('Creating events for user3...');
            for (let i = 0; i < randomInt(8, 10); i++) {
                eventId = (
                    await eventsApi.createNewEvent(
                        user3.username,
                        calendarId,
                        randomWords(20),
                        randomWords(100),
                        randomInt(1, 5),
                        new Date(
                            randomInt(2000, 2030),
                            randomInt(0, 11),
                            randomInt(0, 25),
                            randomInt(0, 23),
                            randomInt(0, 59)
                        )
                    )
                )._id.toString();
            }
            for (let i = 0; i < randomInt(0, 5); i++) {
                await eventsApi.addCommentById(
                    eventId,
                    user3.username,
                    randomWords(20),
                    new Date(
                        randomInt(2000, 2030),
                        randomInt(0, 11),
                        randomInt(0, 25),
                        randomInt(0, 23),
                        randomInt(0, 59)
                    )
                );
            }
            calendarId = null;
            eventId = null;
            console.log('Successfully created events for user3');
        }
    } catch (e) {
        console.log('Failed to create events user3:');
        console.log(e);
    }

    console.log();

    // create user4
    try {
        console.log('Creating user4...');
        await usersApi.createUser('user4', 'abc123', 'Thomas', 'Anderson');
        user4 = await usersApi.getLoggedinUser({ session: { user: 'user4' } });
        calendarId = user4.calendars[0]._id.toString();
        console.log('Successfully created user4');
    } catch (e) {
        console.log('Failed to create user4:');
        console.log(e);
    }

    // create events for user4
    try {
        if (user4 && calendarId) {
            console.log('Creating events for user4...');
            for (let i = 0; i < randomInt(8, 10); i++) {
                eventId = (
                    await eventsApi.createNewEvent(
                        user4.username,
                        calendarId,
                        randomWords(20),
                        randomWords(100),
                        randomInt(1, 5),
                        new Date(
                            randomInt(2000, 2030),
                            randomInt(0, 11),
                            randomInt(0, 25),
                            randomInt(0, 23),
                            randomInt(0, 59)
                        )
                    )
                )._id.toString();
            }
            for (let i = 0; i < randomInt(0, 5); i++) {
                await eventsApi.addCommentById(
                    eventId,
                    user4.username,
                    randomWords(20),
                    new Date(
                        randomInt(2000, 2030),
                        randomInt(0, 11),
                        randomInt(0, 25),
                        randomInt(0, 23),
                        randomInt(0, 59)
                    )
                );
            }
            calendarId = null;
            eventId = null;
            console.log('Successfully created events for user4');
        }
    } catch (e) {
        console.log('Failed to create events user4:');
        console.log(e);
    }

    console.log();

    // create user5
    try {
        console.log('Creating user5...');
        await usersApi.createUser('user5', 'abc123', 'Harris', 'Perez');
        user5 = await usersApi.getLoggedinUser({ session: { user: 'user5' } });
        calendarId = user5.calendars[0]._id.toString();
        console.log('Successfully created user5');
    } catch (e) {
        console.log('Failed to create user5:');
        console.log(e);
    }

    // create events for user4
    try {
        if (user5 && calendarId) {
            console.log('Creating events for user5...');
            for (let i = 0; i < randomInt(8, 10); i++) {
                eventId = (
                    await eventsApi.createNewEvent(
                        user5.username,
                        calendarId,
                        randomWords(20),
                        randomWords(100),
                        randomInt(1, 5),
                        new Date(
                            randomInt(2000, 2030),
                            randomInt(0, 11),
                            randomInt(0, 25),
                            randomInt(0, 23),
                            randomInt(0, 59)
                        )
                    )
                )._id.toString();
            }
            for (let i = 0; i < randomInt(0, 5); i++) {
                await eventsApi.addCommentById(
                    eventId,
                    user5.username,
                    randomWords(20),
                    new Date(
                        randomInt(2000, 2030),
                        randomInt(0, 11),
                        randomInt(0, 25),
                        randomInt(0, 23),
                        randomInt(0, 59)
                    )
                );
            }
            calendarId = null;
            eventId = null;
            console.log('Successfully created events for user5');
        }
    } catch (e) {
        console.log('Failed to create events user5:');
        console.log(e);
    }

    console.log('Done');

    await mongoConnection.closeConnection();
}

main();
