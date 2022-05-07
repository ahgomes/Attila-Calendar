const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.usersApi;
const validate = data.validateApi;
const xss = require('xss');

router
  .route('/signup')
  .get(async (req, res) => {
    if(req.session.user){
        res.redirect('/user');
        return;
    }else{
        res.render('other/signup', {title: 'signup'});
        return;
    }
  })
  .post(async (req, res) => {
    let username = xss(req.body.username);
    let password = xss(req.body.password);
    let first_name = xss(req.body.first_name);
    let last_name = xss(req.body.last_name);
    try {
        validate.isValidString(username, true);
        validate.isValidString(password, true);
        validate.isValidString(first_name, true);
        validate.isValidString(last_name, true);
        username = username.toLowerCase();
        username = username.trim();
        validate.checkUsername(username);
        validate.checkPassword(password);
    }catch (e) {
        res.render('other/signup', {title: 'signup', errorMsg: e});
        return;
    }
    try{
        let inserted = await usersData.createUser(username, password, first_name, last_name);
        if (inserted.userInserted == true){
            res.redirect('/user');
            return;
        }else{
            res.status(500).render('other/error', {title: 'Error',errorMsg: e});
            return;
        }
    }catch(e){
        res.status(400).render('other/signup', {title: 'signup', errorMsg: e});
        return;
    }
  });

router
  .route('/login')
  .post(async (req, res) => {
    let username = xss(req.body.username);
    let password = xss(req.body.password);
    console.log(username);
    try {
        validate.isValidString(username, true);
        validate.isValidString(password, true);
        username = username.toLowerCase();
        username = username.trim();
        validate.checkUsername(username);
        validate.checkPassword(password);
        let check = await usersData.checkUser(username, password);
        if (check.authenticated == true){
            req.session.user = username;
            res.redirect('/user');
            return;
        }else{
            res.status(400).render('other/login', {title: 'signup',errorMsg: e});
            return;
        }
        
    } catch (e) {
        res.status(400).render('other/login', {title: 'signup',errorMsg: e});
        return;
    }
  });
router
  .route('/logout')
  .get(async (req,res) => {
    if(req.session.user){
        req.session.destroy();
        res.redirect('/');
        return; //res.render('other/user', {title: 'user'});
    }else{
        res.redirect('/');
        return;
    }
  });
  router
  .route('/changeName')
  .get(async (req, res) => {
    if(req.session.user){
        res.render('other/changeName', {title: 'Change Name'});
        return;
    }else{
        res.redirect('/user/login');
        return;
    }
  })
  .post(async (req, res) => {
    let first_name = xss(req.body.first_name);
    let last_name = xss(req.body.last_name);
    try {
        validate.isValidString(first_name, true);
        validate.isValidString(last_name, true);
    }catch (e) {
        res.render('other/changeName', {title: 'Change Name', errorMsg: e});
        return;
    }
    try{
        let updated = await usersData.changeName(req.session.user, first_name, last_name);
        if (updated.nameChanged == true){
            res.redirect('/user');
            return;
        }else{
            res.status(500).render('other/error', {title: 'Error',errorMsg: e});
            return;
        }
    }catch(e){
        res.status(400).render('other/changeName', {title: 'Change Name', errorMsg: e});
        return;
    }
  });
  
  router
  .route('/changeUsername')
  .get(async (req, res) => {
    if(req.session.user){
        res.render('other/changeUsername', {title: 'Change Username'});
        return;
    }else{
        res.redirect('/user/login');
        return;
    }
  })
  .post(async (req, res) => {
    let new_username = xss(req.body.username);
    try {
        validate.isValidString(new_username, true);
        new_username = new_username.toLowerCase();
        new_username = new_username.trim();
        validate.checkUsername(new_username);
    }catch (e) {
        res.render('other/changeUsername', {title: 'Change Username', errorMsg: e});
        return;
    }
    try{
        let updated = await usersData.changeUsername(req.session.user, new_username);
        if (updated.usernameChanged == true){
            res.redirect('/user');
            return;
        }else{
            res.status(500).render('other/error', {title: 'Error',errorMsg: e});
            return;
        }
    }catch(e){
        res.status(400).render('other/changeUsername', {title: 'Change Username', errorMsg: e});
        return;
    }
  });

  router
  .route('/changePassword')
  .get(async (req, res) => {
    if(req.session.user){
        res.render('other/changePassword', {title: 'Change Password'});
        return;
    }else{
        res.redirect('/user/login');
        return;
    }
  })
  .post(async (req, res) => {
    let password = xss(req.body.password);
    try {
        validate.isValidString(password, true);
        validate.checkPassword(password);
    }catch (e) {
        res.render('other/changePassword', {title: 'Change Password', errorMsg: e});
        return;
    }
    try{
        let updated = await usersData.changePassword(req.session.user, password);
        if (updated.passwordChanged == true){
            res.redirect('/user');
            return;
        }else{
            res.status(500).render('other/error', {title: 'Error', errorMsg: e});
            return;
        }
    }catch(e){
        res.status(400).render('other/changePassword', {title: 'Change Password', errorMsg: e});
        return;
    }
  });
router
  .route('/')
  .get(async (req,res) => {
      if(req.session.user){
          //res.redirect('/');
          return res.render('other/user', {title: 'User Page',username: req.session.user});
      }else{
        //res.redirect('/user/login');
        res.status(200).render('other/login', {title: 'login'});
        return;
      }
      
  });

// router.route('/').get((req, res) => {
//     return res.render('other/user', {
//         title: 'User Page',
//     });
// });

module.exports = router;
