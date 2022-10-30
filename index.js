const express = require('express');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();

const port = process.env.PORT || 3000;

var app = express();
app.use(express.json());
app.use(cors());

app.get('/api', function(req, res) {
    const key = '5c21b59a1000460eb087316813224fb5';
    
    let today = new Date().toISOString().substring(0, 10).replace(/-/g,'');
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
            'TI_FROM_YMD': '20221031',
            'TI_TO_YMD': '20221031'
        },
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    })
    .then(response => {
        console.log(response.data['misTimetable'][1]['row'][0]['PERIO']);
        console.log(response.data['misTimetable'][1]['row'][0]['ITRT_CNTNT']);
        console.log(response.data['misTimetable'][1]['row'][0]['ITRT_CNTNT']);
    });
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
            'MLSV_FROM_YMD': '20221031',
            'MLSV_TO_YMD': '20221031'
        },
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    })
    .then(response => {
        res.send({
            "version": "2.0",
            "template": {
                "outputs": [
                    {
                        "simpleText": {
                            "text": "간단한 텍스트 요소입니다."
                        }
                    }
                ]
            }
        })
    });
});

app.listen(port);