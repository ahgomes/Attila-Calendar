const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const bcrypt = require('bcrypt');
const saltRounds = 16;

const validate = require('./validate');

module.exports = {
    /**
     * Creates the user and adds it to the user database.
     *
     * @returns {Object} Returns the whether the user was created in the form {userInserted: true}
     *
     * @throws Errors when the the username or password fails the validation
     *
     * @todo IMPLEMENT FUNCTION
     */
    async createUser(username,password,first_name,last_name) {  
        validate.isValidString(username, true);
        validate.isValidString(password, true);
        validate.isValidString(first_name, true);
        validate.isValidString(last_name, true);
        username = username.toLowerCase();
        username = username.trim();
        validate.checkUsername(username);
        validate.checkPassword(password);
        
        let hash = await bcrypt.hash(password, saltRounds);

        const userCollection = await users();
        const existingUser = await userCollection.findOne({'username': username});
        if (existingUser != null) throw new Error('A user with that username already exists');

        let newUser = {
            username: username,
            first_name: first_name,
            last_name: last_name,
            hashed_password: hash,
            calendars: []
            
        };

        const insertUser = await userCollection.insertOne(newUser);
        if (insertUser.insertedCount == 0) throw new Error('Could not create user');
        return {userInserted: true};
        

    },
    /**
     * Changes the to the new username for the user with the given old username.
     *
     * @returns {Object} Returns the whether the username was updated in the form {usernameChanged: true}
     *
     * @throws Errors when the the username fails the validation
     *
     * @todo IMPLEMENT FUNCTION
     */
     async changeUsername(old_username, new_username) {  
        validate.isValidString(old_username, true);
        validate.isValidString(new_username, true);
        new_username = new_username.toLowerCase();
        new_username = new_username.trim();
        validate.checkUsername(new_username);

        const userCollection = await users();
        const user = await userCollection.findOne({'username': old_username});
        if (user == null) throw new Error('No user with that username exists');
        
        let newUser = {
            username: new_username,
            first_name: user.first_name,
            last_name: user.last_name,
            hashed_password: user.hashed_password,
            calendars: user.calendars
            
        };

        const insertUser = await userCollection.updateOne({'username': old_username},{$set: newUser});
        if (insertUser.modifiedCount == 0) throw new Error('Could not change username');
        return {usernameChanged: true};
    },
    /**
     * Changes the password for the user with the given username.
     *
     * @returns {Object} Returns the whether the password was updated in the form {passwordChanged: true}
     *
     * @throws Errors when the the password fails the validation
     *
     * @todo IMPLEMENT FUNCTION
     */
     async changePassword(username, password) {  
        validate.isValidString(username, true);
        validate.isValidString(password, true);
        validate.checkPassword(password);

        const userCollection = await users();
        const user = await userCollection.findOne({'username': username});
        if (user == null) throw new Error('No user with that username exists');
        
        let hash = await bcrypt.hash(password, saltRounds);

        let newUser = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            hashed_password: hash,
            calendars: user.calendars
            
        };

        const insertUser = await userCollection.updateOne({'username': username},{$set: newUser});
        if (insertUser.modifiedCount == 0) throw new Error('Could not change password');
        return {passwordChanged: true};
    },
    /**
     * Changes the first and last name for the user with the given username.
     *
     * @returns {Object} Returns the whether the name was updated in the form {nameChanged: true}
     *
     * @throws Errors when the the password fails the validation
     *
     * @todo IMPLEMENT FUNCTION
     */
     async changeName(username, first_name, last_name) {  
        validate.isValidString(first_name, true);
        validate.isValidString(last_name, true);

        const userCollection = await users();
        const user = await userCollection.findOne({'username': username});
        if (user == null) throw new Error('No user with that username exists');

        let newUser = {
            username: user.username,
            first_name: first_name,
            last_name: last_name,
            hashed_password: user.hashed_password,
            calendars: user.calendars
            
        };

        const insertUser = await userCollection.updateOne({'username': username},{$set: newUser});
        if (insertUser.modifiedCount == 0) throw new Error('Could not change first and last names');
        return {nameChanged: true};
    },
    /**
     * Gets the logged-in user.
     *
     * @returns {Object} Returns the user in the form {username: 'string', first_name: 'string', last_name: 'string'} if the user is currently logged-in
     *
     * @throws Errors when the there is no user logged-in
     *
     * @todo IMPLEMENT FUNCTION
     */
    async checkUser(username,password) {
        validate.isValidString(username, true);
        validate.isValidString(password, true);
        username = username.toLowerCase();
        username = username.trim();
        validate.checkUsername(username);
        validate.checkPassword(password);
        
        //query db for username, if not found, throw "Either the username or password is invalid"
        const userCollection = await users();
        const user =  await userCollection.findOne({'username': username});
        if (user == null) throw new Error("Either the username or password is invalid");
        //bcrypt to compare hashed password from db and given db
        try {
            comparePasswords = await bcrypt.compare(password, user.password);
          } catch (e) {
            throw new Error('bcrypt failed');
          }
        //if no match, throw "Either the username or password is invalid"
        if (!comparePasswords) throw "Either the username or password is invalid";
        return {authenticated: true};
    },
    /**
     * Gets the logged-in user.
     *
     * @returns {Object} Returns the user in the form {username: 'string', first_name: 'string', last_name: 'string'} if the user is currently logged-in
     *
     * @throws Errors when the there is no user logged-in
     *
     * @todo IMPLEMENT FUNCTION
     */
    getLoggedinUser() {
        // TODO
        return { username: 'foobar', first_name: 'Foo', last_name: 'Bar' };
    },
};
