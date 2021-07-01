/*
 * @Author: snltty
 * @Date: 2021-07-01 09:15:37
 * @LastEditors: snltty
 * @LastEditTime: 2021-07-01 17:16:49
 * @version: v1.0.0
 * @Descripttion: 功能说明
 * @FilePath: \学校爬虫\parser.js
 */
const fs = require('fs')

const result = [];
const cache = {};
const fn = (path) => {

    const pathStr = path.join('/');
    const stat = fs.statSync(pathStr);

    if (stat.isDirectory()) {
        for (const dir of fs.readdirSync(pathStr)) {
            fn(path.concat([dir]));
        }
    } else if (stat.isFile()) {
        try {
            let str = fs.readFileSync(pathStr).toString().replace(/\[\]\[/g, '[').replace(/\]\[\]/g, ']').replace(/\]\[/g, ',').replace(/,$/g, '');
            const arr = JSON.parse(str || '[]');
            for (const item of arr) {
                let { id, type, typecode, name, address, pname, pcode, cityname, citycode, adname, adcode, location, tel, postcode, website, email, photos, timestamp } = item;

                //没添加过 并且  只有一个分类的 多个分类数据不纯，比如 包含培训机构，校内设施的（某某某楼，某某某学院，某某某教学中心）
                if (!cache[id] && typecode.indexOf('|') == -1) {
                    cache[id] = 1;
                    tel = typeof tel == 'string' ? tel : tel.join(',');
                    postcode = typeof postcode == 'string' ? postcode : postcode.join(',');
                    website = typeof website == 'string' ? website : website.join(',');
                    email = typeof email == 'string' ? email : email.join(',');
                    photos = typeof photos == 'string' ? photos : photos.map(c => c.url).join(',');
                    result.push(`INSERT INTO SchoolInfo (Name,Address,Pname,Pcode,CityName,CityCode,ADName,ADCode,Location,Tel,PostCode,Website,Email,Photos,Timestamp) VALUES  ('${name}','${address}','${pname}','${pcode}','${cityname}','${citycode}','${adname}','${adcode}','${location}','${tel}','${postcode}','${website}','${email}','${photos}','${timestamp}')`)
                }
            }
        } catch (e) {
            console.log(pathStr);
            return;
        }
    }
};

fn(['result']);

fs.writeFileSync(`result.sql`, `
GO
if exists (select 1 from sys.tables where name='SchoolInfo')
drop table SchoolInfo
GO
CREATE TABLE [dbo].[SchoolInfo](
	[ID] [int] IDENTITY(1,1) PRIMARY KEY NOT NULL,
	[Name] [varchar](50) NOT NULL default(''),
	[Address] [varchar](50) NOT NULL default(''),
	[Pname] [varchar](50) NOT NULL default(''),
	[Pcode] [varchar](50) NOT NULL default(''),
	[CityName] [varchar](50) NOT NULL default(''),
	[CityCode] [varchar](50) NOT NULL default(''),
	[ADName] [varchar](50) NOT NULL default(''),
	[ADCode] [varchar](50) NOT NULL default(''),
	[Location] [varchar](50) NOT NULL default(''),
	[Tel] [varchar](50) NOT NULL default(''),
	[PostCode] [varchar](50) NOT NULL default(''),
	[Website] [varchar](500) NOT NULL default(''),
	[Email] [varchar](50) NOT NULL default(''),
	[Photos] [varchar](500) NOT NULL default(''),
	[Timestamp] [varchar](50) NOT NULL default(''),
)
GO 
`+ result.join('\nGO\n'));