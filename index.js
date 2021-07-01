/*
 * @Author: snltty
 * @Date: 2021-06-29 22:30:36
 * @LastEditors: snltty
 * @LastEditTime: 2021-07-01 17:03:48
 * @version: v1.0.0
 * @Descripttion: 功能说明
 * @FilePath: \学校爬虫\index.js
 */
const fs = require('fs');
const axios = require('axios');
axios.defaults.timeout = 5000;

//高德德图 ak
const AK = "c404bb67a39b30074cef9296d7f9e551";
//每页大小
const PAGE_SIZE = 50;
//并发大小
const QPS = 50;
//冷却时间 超出并发量被限制后 等待多少时间
const COOLING_TIME = 60 * 1000;

const citys = JSON.parse(fs.readFileSync('城市代码.json'));
const types = JSON.parse(fs.readFileSync('类型代码.json'));

const cityNameMaxLength = citys.sort((a, b) => b[0].length - a[0].length)[0][0].length;
const typeNameMaxLength = types.sort((a, b) => b[0].length - a[0].length)[0][0].length;
const allCount = citys.length * types.length;
let successCount = 0;


//等待 ms
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}
//写入文件
const writeResult = async ({ pois = [], page = 1, cityName, typeName }) => {
    if (!fs.existsSync(`./result1/${cityName}/${typeName}`)) {
        fs.mkdirSync(`./result1/${cityName}/${typeName}`, { recursive: true });
    }
    fs.writeFileSync(`./result1/${cityName}/${typeName}/${page}.json`, JSON.stringify(pois.map(c => {
        return {
            id: c.id,
            name: c.name,
            address: c.address,
            location: c.location,
            tel: c.tel,
            postcode: c.postcode,
            website: c.website,
            email: c.email,
            pname: c.pname,
            pcode: c.pcode,
            cityname: c.cityname,
            citycode: c.citycode,
            adname: c.adname,
            adcode: c.adcode,
            photos: c.photos,
            timestamp: c.timestamp,
            type: c.type,
            typecode: c.typecode,
        }
    })), { 'flag': 'a' });
}

const func = async () => {
    for (const city of citys) {
        const [cityName, adcode] = city;
        for (const type of types) {
            const [typeName, typeCode] = type;

            let page = 1, isDone = false;
            console.log(cityName.padEnd(cityNameMaxLength, '丶')
                , typeName.padEnd(typeNameMaxLength, '丶')
                , '第', (page + '').padStart(2, '丶'), '页', '已开始');
            while (!isDone) {

                try {
                    const res = await axios.get('https://restapi.amap.com/v3/place/text', {
                        params: {
                            city: adcode,
                            page: page,
                            types: typeCode,
                            key: AK,
                            citylimit: 'true',
                            offset: PAGE_SIZE,
                            output: 'JSON',
                            extensions: 'all'
                        }
                    });
                    if (res.status == 200) {
                        if (res.data.infocode == '10000') {
                            writeResult({
                                cityName: cityName,
                                typeName: typeName,
                                page: page,
                                pois: res.data.pois
                            });

                            //没有数据  或者 当前页已达到最大页数 就已完成了
                            count = Number(res.data.count);
                            if (count == 0 || Math.ceil(count / PAGE_SIZE) <= page) {
                                isDone = true;
                            } else {
                                page += 1;
                            }
                        } else if (res.data.infocode == '10003') {
                            console.log('访问已超出日访问量', city, type, res.data);
                            return;
                        } else if (res.data.infocode == '10004') {
                            console.log('qps超额 将sleep一分钟');
                            await sleep(COOLING_TIME);
                        } else if (res.data.infocode == '10010') {
                            console.log('IP访问超限', city, type, res.data);
                            return;
                        } else if (res.data.infocode.indexOf('3') == 0) {
                            console.log('3服务错误', city, type, res.data);
                            fs.writeFileSync(`error.txt`, JSON.stringify({
                                city, type, data: res.data
                            }), { 'flag': 'a' });
                        } else {
                            console.log('其它服务错误', city, type, res.data);
                            fs.writeFileSync(`error.txt`, JSON.stringify({
                                city, type, data: res.data
                            }), { 'flag': 'a' });
                        }
                    } else {
                        onsole.log('网络错误', city, type, res);
                    }
                    await sleep(1000 / QPS);
                } catch (error) {
                    await sleep(1000 / QPS);
                }
            }
            successCount += 1;
            console.log(cityName.padEnd(cityNameMaxLength, '丶')
                , typeName.padEnd(typeNameMaxLength, '丶')
                , '第', (page + '').padStart(2, '丶'), '页', '已完成,', successCount, '/', allCount)
        }
    }
}
func();

