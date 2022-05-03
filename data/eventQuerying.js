const mongoCollections = require('../config/mongoCollections');
const events = mongoCollections.events;

const { ObjectId } = require('mongodb');
const validateApi = require('./validate');

// TODO: make docstrings 
// TODO: do TODO's 

const listUserEvents = async function listUserEvents(username) {
    username = validateApi.isValidString(username, true).toLowerCase();
    
    const eventsCollection = await events()
    const listEvents = await eventsCollection.find({owners: {$in: [username]}}).toArray()

    console.log(listEvents)
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
    
    // case sensitive mongodb query for title and description
    const findEvents = await eventsCollection.find({$or: [{title: {$regex: text, $options: 'i'}}, {description: {$regex: text, $options: 'i'}}]}).toArray()

    // textIndex = await eventsCollection.createIndex({title: "text", description: "text"})
    // const findEvents = await eventsCollection.find({$text: {$search: text}}).toArray()

    // textIndex = await eventsCollection.createIndex({title: 1, description: 1}, {collation: {locale: 'en', strength: 2}})
    // const findEvents = await eventsCollection.find({$text: {$search: text}}).collation({locale: 'en', strength: 2}).toArray()

    console.log(findEvents)
    if (findEvents.length > 0) {
        return findEvents
    }
    else {
        return "Sorry, no events could be found."
    }
}

// Need to find a way to format the date properly
const filterEventDate = async function filterEventDate(deadline) {
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

const filterEventPriority = async function filterEventPriority(priority) {
    priority = validateApi.isValidNumber(priority, true)

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

searchEvents("programm")

module.exports = {
    listUserEvents,
    searchEvents,
    filterEventDate,
    filterEventPriority
};