require('dotenv').config();
const express = require('express')
const ejs     = require('ejs')
const bodyparser = require('body-parser')
const mongoose   = require('mongoose');
const session    = require('express-session');
const passport   = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();

mongoose.set('strictQuery',true);
mongoose.connect('mongodb://localhost:27017/UserDB');

app.use(session({
    secret : "Our little secret",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User',userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home")
});

app.get("/login",function(req,res){
    res.render("login")
});

app.get("/register",function(req,res){
    res.render('register');
})
app.get("/submit",function(req,res){
    res.render("submit")
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login")
    }
})
app.post("/register",function(req,res){
   User.register({username : req.body.username},req.body.password,function(err,user){
   if(err){
    console.log(err)
   }else{
    passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
    })
   }
   })
});

app.post("/login",function(req,res){
    const user = new User({
     email : req.body.username,
     password : req.body.password
    });
    req.logIn(user,function(err){
    if(err){
        res.redirect("/");
    }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        })
    }

    })
});

app.listen("3000",function(){
        console.log("server is running on port 3000")
});
