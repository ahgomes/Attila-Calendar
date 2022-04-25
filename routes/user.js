const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;
const validate = data.validate;

router
  .route('/signup')
  .get(async (req, res) => {
    if(req.session.user){
        res.redirect('/private');
        return;
    }else{
        res.render('users/signup', {title: 'signup'});
        return;
    }
  })
  .post(async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    try {
        validate.isValidArrayOfStrings(username, true, true);
        validate.isValidArrayOfStrings(password, true, true);
        username = username.toLowerCase();
        username = username.trim();
        validate.checkUsername(username);
        validate.checkPassword(password);
    }catch (e) {
        res.render('users/signup', {title: 'signup', error: `Error: ${e}`});
        return;
    }
    try{
        let inserted = await usersData.createUser(username, password);
        if (inserted.userInserted == true){
            res.redirect('/user/login');
            return;
        }else{
            res.status(500).render('users/e500', {title: 'Error',e: `Error: ${e}`});
            return;
        }
    }catch(e){
        res.status(400).render('users/signup', {title: 'signup', error: `Error: ${e}`});
        return;
    }
  });

router
  .route('/login')
  .post(async (req, res) => {
    let { username, password } = req.body;
    try {
        validate.isValidArrayOfStrings(username, true, true);
        validate.isValidArrayOfStrings(password, true, true);
        username = username.toLowerCase();
        username = username.trim();
        validate.checkUsername(username);
        validate.checkPassword(password);
        let check = await usersData.checkUser(username, password);
        if (check.authenticated == true){
            req.session.user = username;
            res.redirect('/');
            return;
        }else{
            
            res.status(400).render('users/login', {title: 'signup',error: `Error: ${e}`});
            return;
        }
        
    } catch (e) {
        res.status(400).render('users/login', {title: 'signup',error: `Error: ${e}`});
        return;
    }
  });
router
  .route('/logout')
  .get(async (req,res) => {
    if(req.session.user){
        res.redirect('/');
        return;
    }else{
        req.session.destroy();
        res.status(200).sendFile(path.resolve('public/logout.html'));
        return;
    }
  });
router
  .route('/')
  .get(async (req,res) => {
      if(req.session.user){
          //res.redirect('/');
          return res.render('other/user', {
                    title: 'User Page',
                });
      }else{
        res.status(200).render('users/login', {title: 'login'});
        return;
      }
      
  });

// router.route('/').get((req, res) => {
//     return res.render('other/user', {
//         title: 'User Page',
//     });
// });

module.exports = router;
