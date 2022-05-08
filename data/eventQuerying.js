const mongoCollections = require('../config/mongoCollections');
const events = mongoCollections.events;

const { ObjectId } = require('mongodb');
const validateApi = require('./validate');
const convertApi = require('./convert');

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

    // console.log(findEvents)
    if (findEvents.length > 0) {
        return findEvents
    }
    else {
        return "Sorry, no events could be found."
    }
}

const filterEventDate = async function filterEventDate(month, day, year) {
    const eventsCollection = await events()
    
    findEvents = null;
    if (month) {
        if (day) {
            if (year) {
                //find month, day and year of deadline
                findEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, month]}, {$eq: [{"$dayOfMonth": "$deadline"}, day]}, {$eq: [{"$year": "$deadline"}, year]}]}}).toArray()
            }
            else {
                //find month and day of deadline
                findEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, month]}, {$eq: [{"$dayOfMonth": "$deadline"}, day]}]}}).toArray()
            }
        }
        else {
            if (year) {
                //find month and year of deadline
                findEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, month]}, {$eq: [{"$year": "$deadline"}, year]}]}}).toArray()
            }
            else {
                //find month of deadline
                findEvents = await eventsCollection.find({"$expr": {$eq: [{"$month": "$deadline"}, month]}}).toArray()
            }
        }
    }
    else {
        if (day) {
            if (year) {
                //find day and year of deadline
                findEvents = await eventsCollection.find({"$expr": {$and: [{$eq: ["$dayOfMonth", day]}, {$eq: ["$year", year]}]}}).toArray()
            }
            else {
                //find day of deadline
                findEvents = await eventsCollection.find({"$expr": {$eq: [{"$dayOfMonth": "$deadline"}, day]}}).toArray()
            }
        }
        else {
            //find year of deadline
            findEvents = await eventsCollection.find({"$expr": {$eq: [{"$year": "$deadline"}, year]}}).toArray()
        }
    }

    console.log(findEvents)
    return findEvents    
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

    // console.log("Database Query:", searchType, searchTerm, order)

    if (searchType === "User") {
        filterEvents = await eventsCollection.find({owners: {$in: [searchTerm]}}).sort({priority: order}).toArray()
    }
    else if (searchType === "Title/Description") {
        filterEvents = await eventsCollection.find({$or: [{title: {$regex: searchTerm, $options: 'i'}}, {description: {$regex: searchTerm, $options: 'i'}}]}).sort({priority: order}).toArray()
    }
    
    else if (searchType === "Date") {
        // TODO
    }
    else if (searchType === "Priority") {
        searchTerm = Number(searchTerm)
        filterEvents = this.searchEventPriority(searchTerm)
    }

    // console.log(filterEvents)
    return filterEvents
}

// newDate = new Date(2022,5,9,3,59)
// console.log(newDate.getMonth())
// console.log(newDate.getDate())
// console.log(newDate.getFullYear()) 
// console.log(newDate.getHours())
// console.log(newDate.getMinutes())
// console.log(newDate.getSeconds())
// console.log(newDate.getMilliseconds())

filterEventDate(5, false, 2022)


module.exports = {
    getEventById,
    listUserEvents,
    searchEvents,
    filterEventDate,
    searchEventPriority,
    filterEventPriority
};