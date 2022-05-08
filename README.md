# CS546-Final-Project

Attila Calendar is a general-purpose calendar application that allows users to schedule and manage their own events. The user may get a general overview of their workflow by viewing the simple and interactive calendar GUI on the main page. A finer and more comprehensive view of the user’s events can be achieved through accessing the events page.

## Setup & Running
1. Install the required dependencies.  
   ```
   npm install
   ```
2. Seed the database. Before running this, make sure to have MongoDB running in the background. See [MongoDB Manual](https://www.mongodb.com/docs/manual/) for more specifics.
   ```
   npm run seed
   ```
3. Start the web application.
   ```
   npm start
   ```
4. Open in http://localhost:3000

## Core Features
Core features are divided into 3 pages:
<details>
  <summary>Calendar</summary>
  <ul>
    <li>Display a calendar with the current month and year</li>
    <li>Navigation to change the displayed month and year</li>
    <li>Ability to create a new event for a selected date</li>
    <li>Sidebar showing past and upcoming events</li>
    <li>Selecting a day on the calendar displays all events on that date</li>
  </ul>
</details>
<details>
  <summary>Events</summary>
  <ul>
    <li>List all events created by the user</li>
    <li>Create, edit, and delete events</li>
    <li>Search events by their title or description</li>
    <li>Filter events by day, month, and/or year</li>
    <li>Filter events by their priority (i.e., most important to least important)</li>
    <li>Add comments to each event</li>
  </ul>
</details>
<details>
  <summary>User</summary>
  <ul>
    <li>View current username and first and last name</li>
    <li>Change first and last name</li>
    <li>Change password</li>
    <li>Loggout</li>
  </ul>
</details>

## Extra Features
Some features that we would like to implement in the future. ***We will check them off as added.***

- [ ] Event sharing between users
- [ ] Add or remove multiple calendar instances
- [ ] Merge multiple calendars into one
- [ ] Make events periodic
- [ ] Display U.S federal holidays
- [ ] Automatically delete overdue events with user consent

## Contributors

  - [View Contributors](https://github.com/ahgomes/Attila-Calendar/graphs/contributors)

## Github Repository
- [View Repository](https://github.com/ahgomes/Attila-Calendar)
