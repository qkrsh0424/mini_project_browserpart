const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 4000;
const app = express();
const mysql = require('mysql');
const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
const dbinfo = fs.readFileSync('./databasepublic.json');
const conf = JSON.parse(dbinfo);
const conn = mysql.createConnection({
    host:conf.host,
    user:conf.user,
    password:conf.password,
    port:conf.port,
    database:conf.database
});

conn.connect(function(){
    console.log("db connected");
});

app.get('/api/user_m',function(req,res){
    var sql = 'SELECT * FROM user_manager';
    conn.query(sql,(err,rows,fields)=>{
        res.send(rows);
    });
});

app.get('/api/profile/:userid',function(req,res){
    var userid = req.params.userid;
    var sql = "SELECT * FROM user_manager";
    var params = [userid];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows[0]);
    })
});

app.get('/api/class/:classid',function(req,res){
    var classid = req.params.classid;
    var sql = 'SELECT * FROM class WHERE id=?';
    var params = [classid];
    conn.query(sql,params,function(err, rows, fields){
        res.send(rows[0]);
    })
});

app.get('/api/classlist/:userid',function(req,res){
    var sql = 'SELECT * FROM class WHERE author_id=?';
    var userid = req.params.userid;
    var param = [userid];
    conn.query(sql,param,function(err, rows, fields){
        res.send(rows);
    })
    // res.send('hihi');
});

app.post('/api/authsignin',function(req,res){
    var sql = 'SELECT * FROM user_manager WHERE email=? and password=?';
    var email = req.body.email;
    var password = req.body.password;
    var params = [email,password];
    conn.query(sql,params,function(err,rows,fields){
        if(rows[0]==null){
            res.send(null);
        }else{
            res.send(rows[0]);
        }
    });
});

app.post('/api/signup',function(req,res){
    var sql = 'SELECT * FROM user_manager where email=?';
    var email = req.body.email;
    var params = [email]
    conn.query(sql,params,function(err,rows,fields){
        if(rows[0]!=null){
            res.send(rows);
        }else{
            var sql = 'INSERT INTO user_manager(email, name, password, gender) VALUES(?,?,?,?)';
            var name = req.body.username;
            var password = req.body.password;
            var gender = req.body.gender;
            var params = [email, name, password, gender];

            conn.query(sql, params, function(err, rows, fields){
                res.send(rows);
            });
        }
    });
});

app.post('/api/createclass',function(req,res){
    var sql = 'INSERT INTO class(classname,classdesc,classtype,author_id,author_name) VALUES(?,?,?,?,?)';
    var classname = req.body.classname;
    var classdesc = req.body.classdesc;
    var classtype = req.body.classtype;
    var author_id = req.body.author_id;
    var author_name = req.body.author_name;
    var params = [classname,classdesc,classtype,author_id,author_name];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows);
    });
});

app.listen(port, function(){
    console.log('server is running on 4000port');
});