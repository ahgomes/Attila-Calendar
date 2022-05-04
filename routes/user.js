const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.usersApi;
const validate = data.validateApi;


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
    console.log("POST: SIGNUP");
    let username = req.body.username;
    let password = req.body.password;
    try {
        validate.isValidString(username, true);
        validate.isValidString(password, true);
        username = username.toLowerCase();
        username = username.trim();
        validate.checkUsername(username);
        validate.checkPassword(password);
    }catch (e) {
        res.render('other/signup', {title: 'signup', errorMsg: `Error: ${e}`});
        return;
    }
    try{
        console.log("CREATING");
        let inserted = await usersData.createUser(username, password);
        if (inserted.userInserted == true){
            res.redirect('/user');
            return;
        }else{
            console.log("CREATING FAILED " + e);
            res.status(500).render('other/error', {title: 'Error',errorMsg: `Error: ${e}`});
            return;
        }
    }catch(e){
        console.log("CREATING FAILED " + e);
        res.status(400).render('users/signup', {title: 'signup', errorMsg: `Error: ${e}`});
        return;
    }
  });

router
  .route('/login')
  .post(async (req, res) => {
    let { username, password } = req.body;
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
            res.status(400).render('other/login', {title: 'signup',errorMsg: `Error: ${e}`});
            return;
        }
        
    } catch (e) {
        res.status(400).render('other/login', {title: 'signup',errorMsg: `Error: ${e}`});
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
