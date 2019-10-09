const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const to_json = require('xmljson').to_json;
let userName = [];
let studentID = "";
let PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/profile', (req, res) => {
    res.render('profile', {fullName: userName,SID: studentID});
});

app.post('/login', (req, res) => {
    let xmls = '<v:Envelope xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:d="http://www.w3.org/2001/XMLSchema" xmlns:c="http://schemas.xmlsoap.org/soap/encoding/" xmlns:v="http://schemas.xmlsoap.org/soap/envelope/"><v:Header /><v:Body><ValidateLogin xmlns="http://tempuri.org/" id="o0" c:root="1"><AccessKey i:type="d:string">NCfFWRBYU59NJS8RR4hbHA==</AccessKey><LoginName i:type="d:string">' + req.body.username + '</LoginName><Password i:type="d:string">' + req.body.password + '</Password><AppType i:type="d:string"></AppType><MobileConfig i:type="d:string"></MobileConfig></ValidateLogin></v:Body></v:Envelope>';

    axios.post('http://117.239.83.200:1010/MobAppWebService/',
        xmls, {
            headers: {
                'Content-Type': 'text/xml'
            }
        }).then(response => {
        to_json(response.data, function (error, data) {
            // console.log(data['soap:Envelope']['soap:Body']['ValidateLoginResponse']['ValidateLoginResult']['UserValidation']['UserDetails']['Status']);
            if (data['soap:Envelope']['soap:Body']['ValidateLoginResponse']['ValidateLoginResult']['UserValidation']['UserDetails']['Status'] === '1') {
                // console.log('Access Granted');
                let fullName = data['soap:Envelope']['soap:Body']['ValidateLoginResponse']['ValidateLoginResult']['UserValidation']['UserDetails']['FullName'].split(' ');
                studentID = data['soap:Envelope']['soap:Body']['ValidateLoginResponse']['ValidateLoginResult']['UserValidation']['UserDetails']['UserName'];
                // console.log(studentID);
                userName = fullName;
                // console.log(userName);
                res.redirect('/profile');
            }
            else {
                // console.log('Access Denied');
                res.redirect('/');
            }
        });
    }).catch(err => {
        console.log(err)
    });
});

app.listen(PORT, () => {
    console.log('Server started at localhost:3000');
});
