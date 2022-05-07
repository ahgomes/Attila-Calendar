const mongoCollections = require('../config/mongoCollections');
const events = mongoCollections.events;

const { ObjectId } = require('mongodb');
const validateApi = require('./validate');

// TODO: make docstrings 
// TODO: do TODO's 

const getEventById = async function getEventById(id) {
    id = validateApi.isValidObjectId(id)

    const eventCollection = await events();
    const event = await eventCollection.findOne({ _id: ObjectId(id) });
    // console.log(event)
    return event
}

const listUserEvents = async function listUserEvents(username) {
    username = validateApi.isValidString(username, true).toLowerCase();
    
    const eventsCollection = await events()
    const listEvents = await eventsCollection.find({owners: {$in: [username]}}).toArray()

    // console.log(listEvents)
    if (listEvents.length > 0) {
        return listEvents
    }
    else {
        return "Sorry, no events could be found."
    }
}

const searchEvents = async function searchEvents(text) {
    text = validateApi.isValidString(text, true)
    const eventsCollection = await events()
    
    const findEvents = await eventsCollection.find({$or: [{title: {$regex: text, $options: 'i'}}, {description: {$regex: text, $options: 'i'}}]}).toArray()

    // textIndex = await eventsCollection.createIndex({title: "text", description: "text"})
    // const findEvents = await eventsCollection.find({$text: {$search: text}}).toArray()

    // textIndex = await eventsCollection.createIndex({title: 1, description: 1}, {collation: {locale: 'en', strength: 2}})
    // const findEvents = await eventsCollection.find({$text: {$search: text}}).collation({locale: 'en', strength: 2}).toArray()

    // console.log(findEvents)
    if (findEvents.length > 0) {
        return findEvents
    }
    else {
        return "Sorry, no events could be found."
    }
}

// Need to find a way to format the date properly
const searchByEventDate = async function searchByEventDate(deadline) {
    deadline = validateApi.isValidDate(deadline)
    
    const eventsCollection = await events()
    const findEvents = await eventsCollection.find({deadline: {$eq: deadline}}).toArray()

    console.log(findEvents)
    if (findEvents.length > 0) {
        return findEvents
    }
    else {
        return "Sorry, no events could be found."
    }
}

const filterEventDate = async function filterEventDate(date) {

}

const searchEventPriority = async function searchEventPriority(priority) {
    // priority = validateApi.isValidNumber(priority, true)

    const eventsCollection = await events()
    const findPriorityEvents = await eventsCollection.find({priority: {$eq: priority}}).toArray()

    console.log(findPriorityEvents)
    if (findPriorityEvents.length > 0) {
        return findPriorityEvents
    }
    else {
        return "Sorry, no events could be found."
    }
}

const filterEventPriority = async function filterEventPriority(searchType, searchTerm, order) {
    const eventsCollection = await events()
    filterEvents = null;
    // returns events in sorted order by priority
    if (order === "asc") {
        order = 1
    } else {
        order = -1
    }
    console.log(searchType, searchTerm, order)
    console.log("before")
    if (searchType === "User") {
        filterEvents = await eventsCollection.find({owners: {$in: [searchTerm]}}).sort({priority: order}).toArray()
    }
    console.log("after")
    console.log(filterEvents)
    return filterEvents
}

// const filterEventPriorityAsc = async function filterEventPriorityAsc(priority) {
//     const eventsCollection = await events()
//     // return events in sorted order by ascending priority
//     const sortedEvents = await eventsCollection.find({priority: {$eq: priority}}).sort({priority: 1}).toArray()
//     return sortedEvents
// }

// const filterEventPriorityDesc = async function filterEventPriorityDesc(priority) {
//     const eventsCollection = await events()
//     // return events in sorted order by descending priority
//     const sortedEvents = await eventsCollection.find({priority: {$eq: priority}}).sort({priority: -1}).toArray()
//     return sortedEvents
// }

filterEventPriority("User", "adrian", "asc")

module.exports = {
    getEventById,
    listUserEvents,
    searchEvents,
    searchByEventDate,
    filterEventDate,
    searchEventPriority,
    filterEventPriority
    // filterEventPriorityAsc,
    // filterEventPriorityDesc
};