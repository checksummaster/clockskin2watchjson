var getangle = function(obj,time)
{

    level_0_to_100 = 50;

    var anglesecond = (time.getSeconds() + time.getMilliseconds() / 1000.0) * 360.0 / 60.0;
    var angleminute = time.getMinutes() * 360.0 / 60.0 + anglesecond / 60.0;
    var anglehour = time.getHours() * 360.0 / 12.0 + angleminute / 12.0;
    var anglehour24 = time.getHours() * 360.0 / 24.0 + angleminute / 24.0;
    var anglemonth = time.getMonth() * 360.0 / 12.0;
    var angleweek = time.getDay() * 360.0 / 7.0;
    var anglebatt = level_0_to_100 * 360.0 / 100.0;
    var angle = 0.0;

    switch (obj.rotate)
    {

        case 0: // Static images, no  configuration is required
            angle = 0;
            break;

        case 1: // Hour hand rotate
            angle = anglehour;
            break;

        case 2: // Minute hand  rotate
            angle = angleminute;
            break;

        case 3: // Second hand  rotate
            angle = anglesecond;
            break;

        case 4: // Month rotate
            angle = anglemonth;
            break;

        case 5: // Week rotation  angle
            angle = angleweek;
            break;

        case 6: // Power rotation  angle
            angle = anglebatt;
            break;

        case 7: // 24 hours rotate  (Hour hand as a 12 - hour period)
            angle = anglehour24;
            break;

        case 8: // Hour hand rotate shadow effect
            angle = anglehour;//TODO (what is shadow ?)
            break;

        case 9: // Minute hand  rotate shadow effect
            angle = angleminute;//TODO
            break;

        case 10: // Second hand  rotate shadow effect
            angle = anglesecond;//TODO
            break;
    }

    if ( obj.mulrotate ) {
        if (obj.mulrotate > 0 )
        {
            angle *= obj.mulrotate;
        }
        else {
            angle /= -obj.mulrotate;
        }
    }

    if (obj.angle ) {
        angle += obj.angle;
    }

    if (obj.direction ) {
        if (obj.direction == 2)
        {
            angle *= -1;
        }
    }

    return angle;
}

var merge = function (bitmaps, list) {

    var width = 0;
    var height = 0;
    for (var i = 0; i < list.length ; i++)
    {
        if (i < bitmaps.length)
        {
            if (bitmaps[list[i]] != null)
            {
                width += bitmaps[list[i]].width;
                if (bitmaps[list[i]].height > height)
                {
                    height = bitmaps[list[i]].height;
                }
            }
        }
    }
    if (width == 0)
    {
        width = 1;
    }

    if (height == 0)
    {
        height = 1;
    }
    
    var c = CreateCanvas(width, height);
    var ctx = c.getContext("2d");
    
    var tx = 0;
    for (var i = 0; i < list.length ; i++)
    {
        if (i < bitmaps.length)
        {
            if (bitmaps[list[i]] != null  && bitmaps[list[i]].width !== 0 && bitmaps[list[i]].height !== 0 )
            {
                ctx.drawImage(bitmaps[list[i]], tx, 0);
                tx += bitmaps[list[i]].width;
            }
        }
    }

    var img = CreateImage();
    img.src = c.toDataURL();
    
    return img;
}

var getbitmap = function (obj)
{

}

function show(name) {

    var canvas = document.createElement('canvas');
    canvas.width  = 400;
    canvas.height = 400;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var obj = data[name];

    console.log(obj);
 
    // replace base64 by image object in database
    for (bitmap in obj.bitmap) {
        for (j in obj.bitmap[bitmap].bitmap) {
            var i = new Image();
            i.src = obj.bitmap[bitmap].bitmap[j];
            obj.bitmap[bitmap].bitmap[j] = i;
            /*
            var label = document.createElement('label');
            label.innerHTML = bitmap;
            document.body.appendChild(document.createElement("br"));
            document.body.appendChild(label);
            document.body.appendChild(i);
            */
        }
    }

    setInterval(function(){ 

        var time = new Date();

        for (command in obj.command) {
            if ( obj.command[command].bitmap ) {
                var bitmap = obj.bitmap[obj.command[command].bitmap].bitmap[0];
                var centerx = obj.command[command].centerx || 0;
                var centery = obj.command[command].centery || 0;
                var angle = getangle(obj.command[command],time);

                if (obj.command[command].arraytype === 9 ) {
                    centerx = 0;
                }
   
                ctx.save();             
                var x = centerx + canvas.width / 2;
                var y = centery + canvas.height / 2;
                var width = bitmap.width;
                var height = bitmap.height;
                ctx.translate(x, y);
                ctx.rotate(angle * Math.PI / 180);
                ctx.drawImage(bitmap, -width / 2, -height / 2, width, height);
                ctx.restore();
 
            }
            
        }   
     }, 100); 
}

window.onload = function(e){ 
    for (obj in data) {
        console.log(obj);
        show(obj);
    }

  //  show("test3/Mario Kart");
  //  show("VICTORINOX ALPNACH MECHANICAL CHRONOGRAPH_GREEN");
}

