/* Here are all the dummy user accounts. Users 3-5 might be of interest because they have randomly generated event data.
 * thanks to https://github.com/marcoagpinto/aoo-mozilla-en-dict for the word dictionary list
 *
 * |----------|----------|--------------------------------------------------------------------|
 * | USERNAME | PASSWORD | NOTES                                                              |
 * |----------|----------|--------------------------------------------------------------------|
 * | venkat   | abc123   | Contains 5 events with unique titles, descriptions, and priorities |
 * |----------|----------|--------------------------------------------------------------------|
 * | antonio  | abc123   | Contains 1 event with 5 unique user comments                       |
 * |----------|----------|--------------------------------------------------------------------|
 * | adrian   | abc123   | Contains randomly generated event and comment data                 |
 * |----------|----------|--------------------------------------------------------------------|
 * | jason    | abc123   | Contains randomly generated event and comment data                 |
 * |----------|----------|--------------------------------------------------------------------|
 * | jacob    | abc123   | Contains randomly generated event and comment data                 |
 * |----------|----------|--------------------------------------------------------------------|
 */

const mongoConnection = require('../config/mongoConnection');
const fileSys = require('fs');

const data = require('../data');
const usersApi = data.usersApi;
const eventsApi = data.eventsApi;

let words = null;
fileSys.readFile('./tasks/wordlist.txt', 'utf-8', (err, data) => {
    if (data.includes('\r\n')) {
        words = data.split('\r\n');
    } else if (data.includes('\n')) {
        words = data.split('\n');
    } else if (data.includes('\r')) {
        words = data.split('\r');
    } else {
        words = [data];
    }
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomWords(numWords) {
    result = '';
    for (let i = 0; i < numWords; i++) {
        result += `${words[randomInt(0, words.length - 1)]} `;
    }
    return result.substring(0, result.length - 1);
}

async function main() {
    const db = await mongoConnection.connectToDb();
    await db.dropDatabase();

    let user = null,
        calendarId = null,
        eventId = null;

    // create user1
    try {
        console.log('Creating user1...');
        await usersApi.createUser('venkat', 'abc123', 'Venkat', 'Anna');
        user = await usersApi.getLoggedinUser({ session: { user: 'venkat' } });
        calendarId = user.calendars[0]._id.toString();
        console.log('Successfully created user1');
    } catch (e) {
        console.log('Failed to create user1:');
        console.log(e);
    }

    // create events for user1
    try {
        if (user && calendarId) {
            console.log('Creating events for user1...');
            for (let i = 1; i <= 5; i++) {
                await eventsApi.createNewEvent(
                    user.username,
                    calendarId,
                    `Title ${i}`,
                    `Description ${i}`,
                    i,
                    new Date()
                );
            }
            user = null;
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
        await usersApi.createUser('antonio', 'abc123', 'Antonio', 'Cardona');
        user = await usersApi.getLoggedinUser({
            session: { user: 'antonio' },
        });
        calendarId = user.calendars[0]._id.toString();
        console.log('Successfully created user2');
    } catch (e) {
        console.log('Failed to create user2:');
        console.log(e);
    }

    // create events for user2
    try {
        if (user && calendarId) {
            console.log('Creating events for user2...');
            eventId = (
                await eventsApi.createNewEvent(
                    user.username,
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
                    user.username,
                    `Uh oh ${5 * i} minutes until the deadline!!!`,
                    new Date(2022, 4, 8, 23, 59 - 5 * i)
                );
            }
            user = null;
            calendarId = null;
            eventId = null;
            console.log('Successfully created events for user2');
        }
    } catch (e) {
        console.log('Failed to create events user2:');
        console.log(e);
    }

    console.log();

    if (words) {
        const users = [
            ['user3', 'adrian', 'abc123', 'Adrian', 'Gomes'],
            ['user4', 'jason', 'abc123', 'Jason', 'Ruan'],
            ['user5', 'jacob', 'abc123', 'Jacob', 'Wood'],
        ];
        for (let i = 0; i < users.length; i++) {
            // create users 3-5
            try {
                console.log(`Creating ${users[i][0]}...`);
                await usersApi.createUser(
                    users[i][1],
                    users[i][2],
                    users[i][3],
                    users[i][4]
                );
                user = await usersApi.getLoggedinUser({
                    session: { user: users[i][1] },
                });
                calendarId = user.calendars[0]._id.toString();
                console.log(`Successfully created ${users[i][0]}`);
            } catch (e) {
                console.log(`Failed to create ${users[i][0]}:`);
                console.log(e);
            }

            // create events for users 3-5
            try {
                if (user && calendarId) {
                    console.log(`Creating events for ${users[i][0]}...`);
                    for (let j = 0; j < randomInt(8, 10); j++) {
                        eventId = (
                            await eventsApi.createNewEvent(
                                user.username,
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
                        for (let k = 0; k < randomInt(0, 5); k++) {
                            await eventsApi.addCommentById(
                                eventId,
                                user.username,
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
                    }
                    user = null;
                    calendarId = null;
                    eventId = null;
                    console.log(
                        `Successfully created events for ${users[i][0]}`
                    );
                }
            } catch (e) {
                console.log(`Failed to create events ${users[i][0]}:`);
                console.log(e);
            }

            console.log();
        }
    }

    console.log('Done');

    await mongoConnection.closeConnection();
}

main();
