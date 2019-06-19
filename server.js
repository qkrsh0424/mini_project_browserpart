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

conn.connect(function(err){
    if(err){
        console.log('error connect');
    }
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
    var sql = 'SELECT * FROM class WHERE author_id=? and isDeleted=0';
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

app.delete('/api/deleteclass/:id',function(req,res){
    var classid = req.params.id;
    var sql = 'UPDATE class SET isDeleted=1 WHERE id=?';
    var params = [classid];
    conn.query(sql,params,function(err,rows,fields){
        if(err){
            console.log(err);
        }else{
            res.send(rows);
        }
    });
});

app.get('/api/lecturebig/:classid',function(req,res){
    var classid = req.params.classid;
    var sql = 'SELECT * FROM lecture_big WHERE class_id=? AND isDeleted=0';
    var params = [classid];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows);
    });
});

app.get('/api/lecturebig/:classid/:lecture_b_id',function(req,res){
    var classid = req.params.classid;
    var lecture_b_id = req.params.lecture_b_id;
    var sql = 'SELECT * FROM lecture_big WHERE class_id=? AND lecture_b_id=? AND isDeleted=0';
    var params = [classid,lecture_b_id];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows[0]);
    });
});

app.get('/api/lecturesmall/:lecture_b_id',function(req,res){
    var lecture_b_id = req.params.lecture_b_id;
    var sql = 'SELECT * FROM lecture_small WHERE lecture_b_id = ? AND isDeleted=0';
    var params = [lecture_b_id];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows);
    });
});

app.get('/api/lecturesmall/:lecture_b_id/:lecture_s_id',function(req,res){
    var lecture_b_id = req.params.lecture_b_id;
    var lecture_s_id = req.params.lecture_s_id;
    var sql = 'SELECT * FROM lecture_small WHERE lecture_b_id=? AND lecture_s_id=? AND isDeleted=0';
    var params = [lecture_b_id, lecture_s_id];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows[0]);
    });
});

app.post('/api/lecturebigadd',function(req,res){
    var lecture_b_title = req.body.lecture_b_title;
    var class_id = req.body.class_id;
    var sql = 'INSERT INTO lecture_big(class_id,lecture_b_title) VALUES(?,?)';
    var params = [class_id,lecture_b_title];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows);
    });
});

//source List
app.get('/api/sourcelist/:lecture_s_id',function(req,res){
    var lecture_s_id = req.params.lecture_s_id;
    var sql = 'SELECT * FROM lecture_source WHERE lecture_s_id=? AND isDeleted=0';
    var params = [lecture_s_id];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows);
    });
});

app.post('/api/addVideoUrl/:lecture_s_id/:item',function(req,res){
    var lecture_s_id = req.params.lecture_s_id;
    var item = req.params.item;
    var material = req.body.materialURL;
    var sql = 'INSERT INTO lecture_source(lecture_s_id, material, item) VALUES(?,?,?)';
    var param = [lecture_s_id,material,item];

    conn.query(sql, param, function(err, rows, fields){
        res.send(rows);
    });
});

app.post('/api/addLectureSamll/:classid/:lecture_b_id',function(req,res){
    var class_id = req.params.classid;
    var lecture_b_id = req.params.lecture_b_id;
    var lecture_s_title = req.body.lecturetitle;
    var lecture_s_desc = req.body.lecturedesc;
    var sql = 'INSERT INTO lecture_small(class_id,lecture_b_id,lecture_s_title,lecture_s_desc) VALUES(?,?,?,?)';
    var params = [class_id,lecture_b_id,lecture_s_title,lecture_s_desc];

    // console.log(class_id);
    // console.log(lecture_b_id);
    // console.log(lecture_s_title);
    // console.log(lecture_s_desc);
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows);
    });
});


//Delete LectureBig API
app.delete('/api/deleteBigLecture/:lecture_b_id',function(req,res){
    var lecture_b_id = req.params.lecture_b_id;
    var sql = 'UPDATE lecture_big SET isDeleted=1 WHERE lecture_b_id=?';
    var params = [lecture_b_id];
    
    conn.query(sql,params,function(err,rows,fields){
        if(err){
            console.log(err);
        }else{
            res.send(rows);
        }
    });
});

//Delete LectureSmall API
app.delete('/api/deleteSmallLecture/:lecture_s_id',function(req,res){
    var lecture_s_id = req.params.lecture_s_id;
    var sql = 'UPDATE lecture_small SET isDeleted=1 WHERE lecture_s_id=?';
    var params = [lecture_s_id];
    
    conn.query(sql,params,function(err,rows,fields){
        if(err){
            console.log(err);
        }else{
            res.send(rows);
        }
    });
});

//Get Student List 
app.get('/api/studentlist/:classid',function(req,res){
    var classid = req.params.classid;
    var sql = 'SELECT * FROM user_student AS us JOIN class_student AS cs ON us.student_id=cs.student_id AND cs.class_id=?';
    // var sql = 'SELECT * FROM class_student WHERE class_id=?';
    var params = [classid];
    conn.query(sql,params,function(err,rows,fields){
        // console.log(rows);
        res.send(rows);
    });
});


//Get Homework List
app.get('/api/homeworkList/:classid',function(req,res){
    var class_id = req.params.classid;
    var sql = 'SELECT * FROM homework WHERE class_id=? AND isDeleted=0';
    var params = [class_id];
    
    conn.query(sql,params,function(err, rows, fields){
        res.send(rows);
    });
});

//Create Homework
app.post('/api/createHomework/:classid',function(req,res){
    var class_id = req.params.classid;
    var title = req.body.homeworktitle;
    var text = req.body.body;
    // console.log(class_id);
    // console.log(title);
    // console.log(text);
    var sql = 'INSERT INTO homework(class_id,homework_title,homework_desc) VALUES(?,?,?)';
    var params = [class_id,title,text];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows);
    });
});

app.get('/api/homework/:homework_id',function(req,res){
    var homework_id = req.params.homework_id;
    var sql = 'SELECT * FROM homework WHERE homework_id=? AND isDeleted=0';
    var params = [homework_id];
    
    conn.query(sql,params,function(err, rows, fields){
        // console.log(rows);
        res.send(rows);
    });
});


//example richtext

app.get('/api/richtext',function(req,res){
    var sql = 'SELECT * FROM richex';
    conn.query(sql,function(err,rows,fields){
        res.send(rows);
    });
});


app.post('/api/richtext',function(req,res){
    var text = req.body.body;
    var sql = 'INSERT INTO richex(body) VALUES(?)';
    var params = [text];
    conn.query(sql,params,function(err,rows,fields){
        res.send(rows);
    });
});

app.listen(port, function(){
    console.log('server is running on 4000port');
});