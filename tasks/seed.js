const mongoConnection = require('../config/mongoConnection');

const data = require('../data');
const eventsApi = data.eventsApi;

async function main() {
    const db = await mongoConnection.connectToDb();
    await db.dropDatabase();

    // do something with the database here
    const user1 = 'venkat',
        user2 = 'antonio',
        user3 = 'adrian',
        user4 = 'jason',
        user5 = 'jacob';

    let eventId = null;

    // 1st event
    console.log('Creating 1st event');
    try {
        eventId = (
            await eventsApi.createNewEvent(
                user1,
                'Hello World!',
                'This is event was created on 4/25/2022 at 11:09PM.',
                5,
                new Date(2022, 3, 25, 23, 9)
            )
        )._id.toString();
    } catch (e) {
        console.log(e);
    }

    try {
        for (let i = 1; i <= 5; i++) {
            await eventsApi.addCommentById(
                eventId,
                user1,
                `Comment ${i}`,
                new Date()
            );
            setTimeout(() => {}, 5 * 1000);
        }
    } catch (e) {
        console.log(e);
    }

    // 2nd event
    console.log('Creating 2nd event');
    try {
        eventId = (
            await eventsApi.createNewEvent(
                user2,
                'CS-546 Final Project Deadline',
                'The final project is due on May 8 at 11:59PM.',
                1,
                new Date(2022, 4, 8, 23, 59)
            )
        )._id.toString();
    } catch (e) {
        console.log(e);
    }

    try {
        for (let i = 3; i >= 0; i--) {
            const date = new Date(2022, 4, 8, 23, 59 - 5 * i);

            await eventsApi.addCommentById(
                eventId,
                user2,
                `Uh oh ${5 * i} minutes until the deadline!!!`,
                date
            );
        }
    } catch (e) {
        console.log(e);
    }

    // 3nd event
    console.log('Creating 3rd event');
    try {
        await eventsApi.createNewEvent(
            user3,
            'Empty Event',
            ' ',
            3,
            new Date()
        );
    } catch (e) {
        console.log(e);
    }

    // 4th event
    console.log('Creating 4th event');
    try {
        const date = new Date();
        date.setHours = 12;

        await eventsApi.createNewEvent(
            user4,
            'This event is due today at noon',
            ' ',
            2,
            date
        );
    } catch (e) {
        console.log(e);
    }

    // 5th event
    console.log('Creating 5th event');
    try {
        eventId = (
            await eventsApi.createNewEvent(
                user1,
                'Authors of Attila Calendar',
                ' ',
                1,
                new Date()
            )
        )._id.toString();
    } catch (e) {
        console.log(e);
    }

    try {
        await eventsApi.addUserToEvent(eventId, user5, user1);
    } catch (e) {
        console.log(e);
    }
    try {
        await eventsApi.addUserToEvent(eventId, user4, user1);
    } catch (e) {
        console.log(e);
    }
    try {
        await eventsApi.addUserToEvent(eventId, user3, user1);
    } catch (e) {
        console.log(e);
    }
    try {
        await eventsApi.addUserToEvent(eventId, user2, user1);
    } catch (e) {
        console.log(e);
    }

    try {
        await eventsApi.addCommentById(
            eventId,
            user1,
            'Venkat Anna',
            new Date()
        );
    } catch (e) {
        console.log(e);
    }
    try {
        await eventsApi.addCommentById(
            eventId,
            user2,
            'Antonio Cardona',
            new Date()
        );
    } catch (e) {
        console.log(e);
    }
    try {
        await eventsApi.addCommentById(
            eventId,
            user3,
            'Adrian Gomes',
            new Date()
        );
    } catch (e) {
        console.log(e);
    }
    try {
        await eventsApi.addCommentById(
            eventId,
            user4,
            'Jason Ruan',
            new Date()
        );
    } catch (e) {
        console.log(e);
    }
    try {
        await eventsApi.addCommentById(
            eventId,
            user5,
            'Jacob Wood',
            new Date()
        );
    } catch (e) {
        console.log(e);
    }

    try {
        await eventsApi.addUserToEvent(eventId, 'Bob', user1);
    } catch (e) {
        console.log(e);
    }
    try {
        await eventsApi.removeUserFromEvent(eventId, 'Bob', user1);
    } catch (e) {
        console.log(e);
    }

    console.log('Done');

    await mongoConnection.closeConnection();
}

main();
