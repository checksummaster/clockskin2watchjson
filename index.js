var fs = require('fs');
var path = require('path');
var AdmZip = require('adm-zip');
var Readable = require('stream').Readable;

var x2js = require("x2js");

var folders = {};

var exithelp = function(msg) {

    if (msg) {
        console.error(msg);
    }
    console.error("Format input output.json (input is a folder or a zip file with one or more clockskin inside.");
    process.exit();
}

var streamtostring = function (s, obj, name) {
    return new Promise(function(resolve, reject) {
        var data = "";
        s.on('data', function (chunk) {
            data += chunk;
        })
        .on('end', function () {
            parseString(data, function (err, result) {
                obj[name] = result
                resolve(obj[name]);
            });            
        })
        .on('error', function() {
            reject(null);
        });
    });
}

var streamtopng = function (s, obj, name) {

    return new Promise(function(resolve, reject) {
        chunks = [];
        s.on('data', function (chunk) {
            chunks.push(chunk);
        })
        .on('end', function () {
            obj[name] = "data:image/png;base64," + Buffer.concat(chunks).toString('base64');
            resolve(obj[name] );
        })
        .on('error', function() {
            reject(null);
        });
    });
}

var parsezip = function(filename)
{

    var zip = new AdmZip(filename);
    var zipEntries = zip.getEntries();

    zipEntries.forEach(function(zipEntry) {
        if ( !zipEntry.isDirectory ) {
            var lib = path.dirname(zipEntry.entryName);
            var name = path.basename(zipEntry.entryName);
            if (folders[lib] === undefined ) {
                folders[lib] = {};
            }
            switch (path.extname(zipEntry.entryName)) {
                case '.xml':
                    var x2jsobj = new x2js();
                    var xml = zipEntry.getData().toString('utf8');
                    folders[lib][name] = x2jsobj.xml2js(xml);
                    break;
                case '.png':
                    folders[lib][name] = "data:image/png;base64," + zipEntry.getData().toString('base64');
                    break;
                default : 
                    console.error('Find garbage ' + zipEntry.entryName);
                    break;
            }
        }
	});
}

for (var i = 2 ; i < process.argv.length ; i ++ ) {
    var total = [];
    if (fs.lstatSync(process.argv[i]).isDirectory()) {
        
    } else {
        parsezip(process.argv[i])
    }
}

var data = {};

for (objkey in folders) {
    var obj = folders[objkey];
    if ( obj !== undefined &&   obj["clock_skin.xml"] != undefined ) {
        var clock_skin = obj["clock_skin.xml"].clockskin.drawable;
        var skin = {
            command: [],
            bitmap: {},
           // junk: {}
        }
        if ( clock_skin !== undefined ) {
            
            for (drawable in clock_skin) {
                var element = {};
                for (key in clock_skin[drawable]) {
                    if (key === 'name') {

                        element['bitmap'] = clock_skin[drawable][key];
                        if (path.extname(clock_skin[drawable][key]) === '.xml' ) {
                            if (obj[clock_skin[drawable][key]] && 
                                obj[clock_skin[drawable][key]].drawables ) {

                                skin.bitmap[clock_skin[drawable][key]] = {
                                    bitmap:[],
                                    key:'0123456789'
                                };

                                for (var i in obj[clock_skin[drawable][key]].drawables.image)
                                {
                                    var keypng = obj[clock_skin[drawable][key]].drawables.image[i];
                                    var base64 =obj[keypng];
                                    skin.bitmap[clock_skin[drawable][key]].bitmap.push(base64);
                                }
                                
                            }
                        } else {
                            skin.bitmap[clock_skin[drawable][key]] = {
                                bitmap:[obj[clock_skin[drawable][key]]],
                                key:'0'
                            };
                        }

                    } else {
                        element[key.toLowerCase()] = parseInt(clock_skin[drawable][key]);
                    }
                }
                skin.command.push(element);
            }
        }
/*
        for (bitmapkey in obj) {
            if (path.extname(bitmapkey) === '.png' )
                skin.bitmap[bitmapkey] = obj[bitmapkey];
           // else 
           //     skin.junk[bitmapkey] = obj[bitmapkey];
        }
        */
        data[objkey] =  skin;  
    }
}

console.log("data = " + JSON.stringify(data,null,2));
process.exit();
