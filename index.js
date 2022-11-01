const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql');

const port = process.env.PORT || 3000;
const apiRouter = express.Router();
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/client"));
app.disable('etag');

const key = '5c21b59a1000460eb087316813224fb5';

app.get('/questions', function(req, res){
    res.sendFile(path.join(__dirname, '/client/index.html'));
});

app.use('/api', apiRouter);
apiRouter.all('/timeTable', function(req, res) {
    let date = req.body['action']['detailParams']['date']['origin'].replace(/-/g, '');
    axios({
        method: 'get',
        url: 'https://open.neis.go.kr/hub/misTimetable',
        params: {
            'KEY': key,
            'Type': 'json',
            'pIndex': '1',
            'pSize': '35',
            'ATPT_OFCDC_SC_CODE': 'J10',
            'SD_SCHUL_CODE': '7621038',
            'GRADE': '1',
            'CLASS_NM': '8',
            'ALL_TI_YMD': date
            // 'TI_FROM_YMD': '20221031',
            // 'TI_TO_YMD': '20221031'
        },
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    })
    .then(response => {
        let simpleText = '';
        for (let row of response.data['misTimetable'][1]['row']) {
            simpleText += `${row['PERIO']}교시 - ${row['ITRT_CNTNT']}\n`
        }
        res.send({
            "version": "2.0",
            "template": {
                "outputs": [
                    {
                        "simpleText": {
                            "text": simpleText || '수업 정보가 없습니다.'
                        }
                    }
                ]
            }
        });
    });
});

apiRouter.all('/mealInfo', function(req, res) {
    let date = req.body['action']['detailParams']['date']['origin'].replace(/-/g, '');
    axios({
        method: 'get',
        url: 'https://open.neis.go.kr/hub/mealServiceDietInfo',
        params: {
            'KEY': key,
            'Type': 'json',
            'pIndex': '1',
            'pSize': '35',
            'ATPT_OFCDC_SC_CODE': 'J10',
            'SD_SCHUL_CODE': '7621038',
            'MLSV_YMD': date
            // 'MLSV_FROM_YMD': '20221031',
            // 'MLSV_TO_YMD': '20221031'
        },
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    })
    .then(response => {
        let simpleText = '';
        try {
            simpleText = response.data['mealServiceDietInfo'][1]['row'][0]['DDISH_NM'].replace(/<br\/>/g, '\n');
        }
        catch {
            simpleText = '급식 정보가 없습니다.';
        }
        res.send({
            "version": "2.0",
            "template": {
                "outputs": [
                    {
                        "simpleText": {
                            "text": simpleText
                        }
                    }
                ]
            }
        })
    });
});

apiRouter.all('/askQuestion', function(req, res) {
    let imageUrl = req.body['action']['detailParams']['secureimage']['origin'].slice(5, -1).split(',', '');
    let image = null;
    axios({
        method: 'get',
        url: imageUrl
    })
    .then(response => {
        image = response.blob();
    });
    var connection = mysql.createConnection({
        host: 'us-cdbr-east-06.cleardb.net',
        user: 'b3f9ed443dd4bb',
        password: '1513e835',
        database: 'heroku_2b73b425b0ab438'
    });
    connection.connect();
    connection.query(`INSERT INTO questions (image) VALUES (${image});`, function (error, results, fields) {
        if (error) throw error;
        res.send({
            "version": "2.0",
            "template": {
                "outputs": [
                    {
                        "simpleText": {
                            "text": results
                        }
                    }
                ]
            }
        });
    });
    connection.end();
});

app.listen(port);