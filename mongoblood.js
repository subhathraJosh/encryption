var http = require("http");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var mongoose=require('mongoose');

var schemadonor=new mongoose.Schema({
   _id:{type:Number},
  a:{type:String},
  b:{type:String},
  c:{type:String},
  d:{type:String},
  e:{type:String},
  f:{type:String}
 
});

mongoose.model('Bank',schemadonor);

var bank1=mongoose.model('Bank');


const crypto=require('crypto');
var fs=require('fs');
//mongodb connectivity
var dbo=0;
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  dbo = db.db("bank");
  console.log("u r now connected");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend:true}));
// Running Server Details.
var server = app.listen(8082, function () {
var host = server.address().address
var port = server.address().port
  console.log("Example app listening at %s:%s Port", host, port)
});
 
 
app.get('/form', function (req, res) {
  var html='';
  html+="<body>";
  html+="<h2>Banking</h2>";
  html+= "<fieldset><form action='/thank'  method='post' name='form1'><table><tr>";
  html+= "<td>PassKey:</td><td><input type= 'text' name='pass' required></td></tr><tr>";
  html+= "<td>Name:</td><td><input type= 'text' name='name' required></td></tr><tr>";
  html+="<td>Age:</td><td><input type='text' name='age' required></td></tr><tr><br>";
  html+="<td>Account no:</td><td><input type='text' name='accno' required></td></tr><tr>";
  html+= "<td>Branch:</td><td><input type='text' name='branch' required></td></tr><tr>";
  html+= "<td>Mobile number:</td><td><input type='text' name='mobileno' required></td></tr><tr>";
  html+="<td>Pincode:</td><td><input type='text' name='pincode' required></td></tr><br>";
  html+="</table><br>";
  html+= "<input type='submit' value='register'>&nbsp;&nbsp;";
  html+= "<INPUT type='reset'  value='clear'>";
  html+= "</form></fieldset>";
  html+= "</body>";
  res.send(html);
});
 
app.post('/thank', urlencodedParser, function (req, res){
var reply='';
var b=new bank1();
const cipher=crypto.createCipher('aes192','123');

b._id=req.body.pass;
b.a=req.body.name;
b.b=req.body.age;
b.c=cipher.update(req.body.accno,'utf8','hex');
b.c+=cipher.final('hex');
b.d=req.body.branch;
b.e=req.body.mobileno;
b.f=req.body.pincode;

var f=0;
dbo.collection("bank").insertOne(b,function(err,res)
{
  if(err)
  {
    f=1;
    console.log("An error occurred");
    throw err;
  }
  else
  {
console.log("record inserted");
reply="record inserted";
}
if(f==1)
{
  reply="Error";
}
});
res.send(reply);
 });
app.get('/form1',function(req,res)
{
var html='';
html+="<body>";
html+="<h2>Search user name by password</h2><br>";
html+="<form action='/search' method='post' name='form2'>"; 
html+="Password:<input type='password' name='searc'><br><br>";
html+="<input type='submit' value='search'>";
html+="</form>";
html+="</body>";
res.send(html);
});
app.post('/search',urlencodedParser,function(req,res){
var result='';
var pass=req.body.searc;
var name='';
var pass1={_id:pass};
dbo.collection("bank").find(pass1).toArray(function(err,res){
if(err) throw err;
else
{
for(var i=0;i<res.length;i++)
{
name=res[i].c;
const decipher=crypto.createDecipher('aes192','123');
var de=decipher.update(name,'hex','utf8');
de+=decipher.final('utf8');
result+="<table>"+
  "<tr><td>PassKey:</td>"+
  "<td><b>Name:</b></td>"+
  "<td><b>Age:<b></td>"+
  "<td><b>Account No:<b></td>"+
  "<td><b>Branch:<b></td>"+
  "<td><b>Mobile no:<b></td>"+
  "<td><b>Pin code:<b></td>"+
  "</tr>"
  "<tr>"
  "<td>"+res[i]._id+"</td>"+
  "<td>"+res[i].a+"</td>"+
  "<td>"+res[i].b+"</td>"+
  "<td>"+de+"</td>"+
  "<td>"+res[i].d+"</td>"+
  "<td>"+res[i].e+"</td>"+
  "<td>"+res[i].f+"</td>"+
  "</tr>"+
  "</table>";
}
}
});
setTimeout(function(){
  res.send(result);
},3000);
});