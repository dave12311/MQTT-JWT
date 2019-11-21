var mosca = require('mosca');
var jwt = require('jsonwebtoken');
var fs = require('fs')

var pubkey;

var settings = {
    port: 1883
};

var server = new mosca.Server(settings);

server.on('clientConnected', function(client){
    console.log('Client connected:', client.id);
});

server.on('ready', function(){
    fs.readFile('pub.key', 'utf8', function(err, content){
        if(err) throw new Error(err);
        pubkey = content;
    });
    console.log('Ready.');
});

var authenticate = function(client, username, password, callback){
    console.log('User connecting:', username);
    jwt.verify(password.toString(), pubkey, function(err, decoded){
        if(err){
            console.log('Invalid JWT for user', username);
            callback(null, false);
        }else{
            var time = Math.floor(Date.now()/1000);
            if(time >= decoded.iat && time <= decoded.exp){
                console.log('Authenticated', decoded.aud);
                client.aud = decoded.aud;
                callback(null,true);
            }else{
                console.log('Invalid JWT for', decoded.aud);
                callback(null,false);
            }
        }
    });
};

server.authenticate = authenticate;