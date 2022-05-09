const mongoCollections = require('../config/mongoCollections');
const events = mongoCollections.events;

const { ObjectId } = require('mongodb');
const validateApi = require('./validate');
const convertApi = require('./convert');

const getEventById = async function getEventById(id) {
    id = validateApi.isValidObjectId(id)

    const eventCollection = await events();
    const event = await eventCollection.findOne({ _id: ObjectId(id) });
    
    if (event) {
        return event;
    } else {
        throw 'Error: No events found.';
    }
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
        throw "Sorry, no events could be found."
    }
}

const searchEvents = async function searchEvents(text, username) {
    text = validateApi.isValidString(text, true)
    username = validateApi.isValidString(username, true).toLowerCase()

    const eventsCollection = await events()
    findEvents = await eventsCollection.find({$or: [{title: {$regex: text, $options: 'i'}}, {description: {$regex: text, $options: 'i'}}]}).toArray()
    findEvents = findEvents.filter(event => event.owners.includes(username))
    
    if (findEvents.length > 0) {
        // console.log(findEvents)
        return findEvents
    }
    else {
        throw "Sorry, no events could be found."
    }
}

const filterEventDate = async function filterEventDate(month, day, year, username) {
    username = validateApi.isValidString(username, true).toLowerCase()
    const validDays = [
        31, // Jan
        new Date(year, 1, 29).getUTCMonth() === 1 ? 29 : 28, // Feb
        31, // Mar
        30, // Apr
        31, // May
        30, // Jun
        31, // Jul
        31, // Aug
        30, // Sep
        31, // Oct
        30, // Nob
        31, // Dec
    ];
    
    const eventsCollection = await events()

    findEvents = null;
    if (month) {
        if (day) {
            if (year) {
                //find month, day and year of deadline
                month = validateApi.isValidNumber(month, true)
                day = validateApi.isValidNumber(day, true)
                year = validateApi.isValidNumber(year, true)

                if (month < 1 || month > 12) {
                    throw `Error: Month '${month}' must be in the range 1-12 inclusive.`;
                }
                if (day < 1 || day > validDays[month - 1]) {
                    throw `Error: Day '${day}' is invalid for the given month.`
                }
                if (year < 1000) {
                    throw `Error: Year '${year}' must be greater than or equal to 1000.`;
                }
                findEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, month]}, {$eq: [{"$dayOfMonth": "$deadline"}, day]}, {$eq: [{"$year": "$deadline"}, year]}]}}).toArray()
            }
            else {
                //find month and day of deadline
                month = validateApi.isValidNumber(month, true)
                day = validateApi.isValidNumber(day, true)

                if (month < 1 || month > 12) {
                    throw `Error: Month '${month}' must be in the range 1-12 inclusive.`;
                }
                if (day < 1 || day > validDays[month - 1]) {
                    throw `Error: Day '${day}' must be between 1 and 31.`
                }
                findEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, month]}, {$eq: [{"$dayOfMonth": "$deadline"}, day]}]}}).toArray()
            }
        }
        else {
            if (year) {
                //find month and year of deadline
                month = validateApi.isValidNumber(month, true)
                year = validateApi.isValidNumber(year, true)

                if (month < 1 || month > 12) {
                    throw `Error: Month '${month}' must be in the range 1-12 inclusive.`;
                }
                if (year < 1000) {
                    throw `Error: Year '${year}' must be greater than or equal to 1000.`;
                }
                findEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, month]}, {$eq: [{"$year": "$deadline"}, year]}]}}).toArray()
            }
            else {
                //find month of deadline
                month = validateApi.isValidNumber(month, true)
                if (month < 1 || month > 12) {
                    throw `Error: Month '${month}' must be in the range 1-12 inclusive.`;
                }
                findEvents = await eventsCollection.find({"$expr": {$eq: [{"$month": "$deadline"}, month]}}).toArray()
            }
        }
    }
    else {
        if (day) {
            if (year) {
                //find day and year of deadline
                day = validateApi.isValidNumber(day, true)
                year = validateApi.isValidNumber(year, true)

                if (day < 1 || day > validDays[month - 1]) {
                    throw `Error: Day '${day}' must be between 1 and 31.`
                }
                if (year < 1000) {
                    throw `Error: Year '${year}' must be greater than or equal to 1000.`;
                }
                findEvents = await eventsCollection.find({"$expr": {$and: [{$eq: ["$dayOfMonth", day]}, {$eq: ["$year", year]}]}}).toArray()
            }
            else {
                //find day of deadline
                day = validateApi.isValidNumber(day, true)
                if (day < 1 || day > validDays[month - 1]) {
                    throw `Error: Day '${day}' must be between 1 and 31.`
                }
                findEvents = await eventsCollection.find({"$expr": {$eq: [{"$dayOfMonth": "$deadline"}, day]}}).toArray()
            }
        }
        else {
            //find year of deadline
            year = validateApi.isValidNumber(year, true)
            if (year < 1000) {
                throw `Error: Year '${year}' must be greater than or equal to 1000.`;
            }
            findEvents = await eventsCollection.find({"$expr": {$eq: [{"$year": "$deadline"}, year]}}).toArray()
        }
    }
    findEvents = findEvents.filter(event => event.owners.includes(username))
    if (findEvents.length > 0) {
        // console.log(findEvents)
        return findEvents
    } else {
        throw "Sorry, no events could be found."
    }
}

const searchEventPriority = async function searchEventPriority(priority, username) {
    priority = validateApi.isValidNumber(priority, true)
    username = validateApi.isValidString(username, true).toLowerCase()

    if (priority < 1 || priority > 5) {
        throw `Error: '${priority}' should be a valid integer between 1 to 5 (inclusive)`
    }

    const eventsCollection = await events()
    // find events where username is in owners and priority matches priority
    findPriorityEvents = await eventsCollection.find({"$expr": {$and: [{$eq: ["$priority", priority]}, {$in: [username, "$owners"]}]}}).toArray()


    // console.log(findPriorityEvents)
    if (findPriorityEvents.length > 0) {
        return findPriorityEvents
    }
    else {
        throw "Sorry, no events could be found."
    }
}

const filterEventPriority = async function filterEventPriority(searchType, searchTerm, order, username) {
    searchType = validateApi.isValidString(searchType, true)
    if (searchType !== "User" && searchType !== "Title/Description" && searchType !== "Date" && searchType !== "Priority") {
        throw `Error: '${searchType}' is not a valid search type.`
    }

    order = validateApi.isValidString(order, true)
    if (order != "asc" && order != "desc") {
        throw "Error: sort/filter order should be 'asc' or 'desc'"
    }
    
    const eventsCollection = await events()
    filterEvents = null;
    
    if (order === "asc") {
        order = 1
    } else {
        order = -1
    }

    username = validateApi.isValidString(username, true).toLowerCase()
    // console.log("Database Query:", searchType, searchTerm, order)

    if (searchType === "User") {
        searchTerm = validateApi.isValidString(searchTerm, true)
        filterEvents = await eventsCollection.find({owners: {$in: [searchTerm]}}).sort({priority: order}).toArray()
    }
    else if (searchType === "Title/Description") {
        searchTerm = validateApi.isValidString(searchTerm, true)
        filterEvents = await eventsCollection.find({$or: [{title: {$regex: searchTerm, $options: 'i'}}, {description: {$regex: searchTerm, $options: 'i'}}]}).sort({priority: order}).toArray()
    }
    else if (searchType === "Date") {
        searchTerm = validateApi.isValidString(searchTerm, true)

        month = searchTerm.substring(0,2)
        day = searchTerm.substring(3,5)
        year = searchTerm.substring(6,12)

        month == "XX" ? monthValue = false : monthValue = Number(month)
        day == "XX" ? dayValue = false : dayValue = Number(day)
        year == "XXXX" ? yearValue = false: yearValue = Number(year)

        filterEvents = null;
        if (monthValue) {
            if (dayValue) {
                if (yearValue) {
                    //find month, day and year of deadline
                    // console.log("a")
                    filterEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, monthValue]}, {$eq: [{"$dayOfMonth": "$deadline"}, dayValue]}, {$eq: [{"$year": "$deadline"}, yearValue]}]}}).sort({priority: order}).toArray()
                }
                else {
                    // console.log("b")
                    //find month and day of deadline
                    filterEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, monthValue]}, {$eq: [{"$dayOfMonth": "$deadline"}, dayValue]}]}}).sort({priority: order}).toArray()
                }
            }
            else {
                if (yearValue) {
                    //find month and year of deadline
                    // console.log("I have arrived")
                    filterEvents = await eventsCollection.find({"$expr": {$and: [{$eq: [{"$month": "$deadline"}, monthValue]}, {$eq: [{"$year": "$deadline"}, yearValue]}]}}).sort({priority: order}).sort({priority: order}).toArray()
                    // console.log(filterEvents)
                }
                else {
                    //find month of deadline
                    // console.log("c")
                    filterEvents = await eventsCollection.find({"$expr": {$eq: [{"$month": "$deadline"}, monthValue]}}).sort({priority: order}).toArray()
                }
            }
        }
        else {
            if (dayValue) {
                if (yearValue) {
                    //find day and year of deadline
                    // console.log("d")
                    filterEvents = await eventsCollection.find({"$expr": {$and: [{$eq: ["$dayOfMonth", dayValue]}, {$eq: ["$year", yearValue]}]}}).sort({priority: order}).toArray()
                }
                else {
                    //find day of deadline
                    // console.log("e")
                    filterEvents = await eventsCollection.find({"$expr": {$eq: [{"$dayOfMonth": "$deadline"}, dayValue]}}).sort({priority: order}).toArray()
                }
            }
            else {
                //find year of deadline
                // console.log("f")
                filterEvents = await eventsCollection.find({"$expr": {$eq: [{"$year": "$deadline"}, yearValue]}}).sort({priority: order}).toArray()
            }
        }
    }
    else if (searchType === "Priority") {
        searchTerm = validateApi.isValidNumber(searchTerm, true)
        filterEvents = await searchEventPriority(searchTerm, username)
    }

    filterEvents = filterEvents.filter(event => event.owners.includes(username))
    if (filterEvents.length > 0) {
        return filterEvents
    }
    else {
        throw "Sorry, no events could be found."
    }
}

module.exports = {
    getEventById,
    listUserEvents,
    searchEvents,
    filterEventDate,
    searchEventPriority,
    filterEventPriority
};