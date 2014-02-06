var mongoose = require('mongoose')
  , Message = require('./lib/message')
  , Tail = require('tail').Tail
  , express = require('express')
  , server = express();

console.log('Establishing MongoDB connection.');
mongoose.connect('mongodb://localhost/whereabouts', function(err) {
  if(err) console.log(err);
});

var Device = mongoose.model('Device', {
    username: String,
    connected: { type: Boolean, default: false },
    connectedAt: Number,
    disconnectedAt: Number,
    disconnectedDate: String,
    disconnectedTime: String,
    macAddress: String,
    ipAddress: String,
    // deviceName: { type: String, default: ''},
    locationIpAddress: String,
    locationName: String,
    locationId: String,
    avatarUrl: String
  });

console.log('Tailing syslog...');
var syslog = new Tail('/var/log/syslog');

syslog.on('line', function(data) {
  var message = new Message(data);

  if(message.isInteresting()) {
    var json = message.toJSON();
    Device.findOneAndUpdate(
      { macAddress: json.macAddress },
      json,
      { upsert: true },
      function(err) { if(err) console.log(err); });
  }
});


// Serve an 'API'
server.get('/', function(req,res) {
  res.send("Whereabouts Syslog Tail<br><br> Available routes are '/devices', '/devices?username=mike' and '/devices/:macaddress'");
});

server.get('/devices', function(req,res) {
  var filter = {};
  if (req.query['username']) filter['username'] = new RegExp(req.query['username'], 'i');

  var d = Device.find(filter, function(err, devices) {
    res.writeHead(200, { 'Content-Type': 'application/json' }); 
    res.write(JSON.stringify(devices));
    res.end();
  });
});

server.get('/devices/:macAddress', function (req,res) {
  Device.find({macAddress: req.params['macAddress']}, function(err, device) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(device));
    res.end();
   });
});

console.log('Listening on 3030');
server.listen(3030);