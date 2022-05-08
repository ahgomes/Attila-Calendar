const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.usersApi;
const validate = data.validateApi;
const xss = require('xss');
const { getLoggedinUser } = require('../data/users');

router
  .route('/signup')
  .get(async (req, res) => {
    if(req.session.user){
        res.redirect('/user');
        return;
    }else{
        res.render('other/signup', {title: 'signup', scriptSource: '/public/js/user/signup.js'});
        return;
    }
  })
  .post(async (req, res) => {
    if(!req.session.user){
        let username = xss(req.body.username);
        let password = xss(req.body.password);
        let first_name = xss(req.body.first_name);
        let last_name = xss(req.body.last_name);
        try {
            validate.isValidString(username, false);
            validate.isValidString(password, false);
            validate.isValidString(first_name, true);
            validate.isValidString(last_name, true);
            username = username.toLowerCase();
            validate.checkUsername(username);
            validate.checkPassword(password);
            validate.checkName(first_name);
            validate.checkName(last_name);
        }catch (e) {
            res.render('other/signup', {title: 'signup', scriptSource: '/public/js/user/signup.js', errorMsg: e});
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
            res.status(400).render('other/signup', {title: 'signup', scriptSource: '/public/js/user/signup.js', errorMsg: e});
            return;
        }
    }else{
        res.redirect('/user');
        return;
    }
  });

router
  .route('/login')
  .post(async (req, res) => {
    if(!req.session.user){
        let username = xss(req.body.username);
        let password = xss(req.body.password);
        try {
            validate.isValidString(username, false);
            validate.isValidString(password, false);
            username = username.toLowerCase();
            validate.checkUsername(username);
            validate.checkPassword(password);
            let check = await usersData.checkUser(username, password);
            if (check.authenticated == true){
                req.session.user = username;
                res.redirect('/calendar');
                return;
            }else{
                res.status(400).render('other/login', {title: 'login', scriptSource: '/public/js/user/login.js', errorMsg: e});
                return;
            } 
        } catch (e) {
            res.status(400).render('other/login', {title: 'login', scriptSource: '/public/js/user/login.js', errorMsg: e});
            return;
        }
    }else{
        res.redirect('/');
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
        user = await usersData.getLoggedinUser(req);
        res.render('other/changeName', {title: 'Change Name', first_name: user.first_name, last_name: user.last_name, scriptSource: '/public/js/user/changeName.js'});
        return;
    }else{
        res.redirect('/user');
        return;
    }
  })
  .post(async (req, res) => {
    if(req.session.user){
        let first_name = xss(req.body.first_name);
        let last_name = xss(req.body.last_name);
        validate.checkName(first_name);
        validate.checkName(last_name);
        try {
            validate.isValidString(first_name, true);
            validate.isValidString(last_name, true);
        }catch (e) {
            res.render('other/changeName', {title: 'Change Name', scriptSource: '/public/js/user/changeName.js', errorMsg: e});
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
            res.status(400).render('other/changeName', {title: 'Change Name', scriptSource: '/public/js/user/changeName.js', errorMsg: e});
            return;
        }
    }else{
        res.redirect('/user');
        return;
    }
  });

  router
  .route('/changePassword')
  .get(async (req, res) => {
    if(req.session.user){
        res.render('other/changePassword', {title: 'Change Password', scriptSource: '/public/js/user/changePassword.js'});
        return;
    }else{
        res.redirect('/user');
        return;
    }
  })
  .post(async (req, res) => {
    if(req.session.user){
        let password = xss(req.body.password);
        try {
            validate.isValidString(password, false);
            validate.checkPassword(password);
        }catch (e) {
            res.render('other/changePassword', {title: 'Change Password', scriptSource: '/public/js/user/changePassword.js', errorMsg: e});
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
            res.status(400).render('other/changePassword', {title: 'Change Password', scriptSource: '/public/js/user/changePassword.js', errorMsg: e});
            return;
        }
    }else{
        res.redirect('/user');
        return;
    }
  });
router
  .route('/')
  .get(async (req,res) => {
      if(req.session.user){
          //res.redirect('/');
          user = await usersData.getLoggedinUser(req);
          return res.render('other/user', {title: 'User Page', first_name: user.first_name, last_name: user.last_name, username: req.session.user});
      }else{
        //res.redirect('/user/login');
        res.status(200).render('other/login', {title: 'login', scriptSource: '/public/js/user/login.js'});
        return;
      }
      
  });


module.exports = router;
