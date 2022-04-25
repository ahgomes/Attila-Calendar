const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const bcrypt = require('bcrypt');
const saltRounds = 16;

const validate = require('./validate');

module.exports = {
    /**
     * Creates the user and adds it tothe user database.
     *
     * @returns {Object} Returns the whether the user was created in the form {userInserted: true}
     *
     * @throws Errors when the the username or password fails the validation
     *
     * @todo IMPLEMENT FUNCTION
     */
    async createUser(username,password) {  
        validate.isValidArrayOfStrings(username, true, true);
        validate.isValidArrayOfStrings(password, true, true);
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
            password: hash
            
        };

        const insertUser = await userCollection.insertOne(newUser);
        if (insertUser.insertedCount == 0) throw new Error('Could not create user');
        return {userInserted: true};
        

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
        validate.isValidArrayOfStrings(username, true, true);
        validate.isValidArrayOfStrings(password, true, true);
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
