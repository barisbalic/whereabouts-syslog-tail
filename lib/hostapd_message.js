var moment = require('moment')
  , locations = require('../config/locations.json')
  , identities = require('../config/identities.json')
  , md5 = require('crypto');

// WPA event notification enum lifted from hostapd driver source
// typedef enum {
//   WPA_AUTH, WPA_ASSOC, WPA_DISASSOC, WPA_DEAUTH, WPA_REAUTH,
//   WPA_REAUTH_EAPOL, WPA_ASSOC_FT
// } wpa_event;
var wpaAuth = /event 0 notification/gi;
var wpaAssoc = /event 1 notification/gi;
var wpaDisassoc = /event 2 notification/gi;
var wpaDeauth = /event 3 notification/gi;
var wpaReauth = /event 4 notification/gi;
var wpaReauthEapol = /event 5 notification/gi;
var wpaAssocFt = /event 6 notification/gi;

var EVENTS = {
  connection: [wpaAuth, wpaAssoc, wpaReauth, wpaReauthEapol],
  disconnection: [wpaDisassoc, wpaDeauth],
  authentication: [/STA identity/gi]
}

var MAC_ADDRESS_MATCHER = /(([0-9a-f]{2}:){5}[0-9a-f]{2})/gi;
var IP_ADDRESS_MATCHER = /(\d{1,3}\.){3}\d{1,3}/gi;

function HostAPDMessage(data){
  var eventTimestamp = Date.now();

  this.isAuthentication = function() {
    return eventMatch(EVENTS.authentication, data);
  }

  this.isAssociation = function() {
    return eventMatch(EVENTS.connection, data)
  };

  this.isDisassociation = function() {
    return eventMatch(EVENTS.disconnection, data)
  };

  this.isInteresting = function() {
    return this.isDisassociation() || this.isAssociation() || this.isAuthentication();
  };

  function eventMatch(events, entry) {
    return events.some(function match(expression) { return !!entry.match(expression) });
  };

  if (this.isAssociation()) {
    this.json = associationEvent();
  } else if (this.isDisassociation()) {
    this.json = disassociationEvent();
  } else if (this.isAuthentication()) {
    this.json = authenticationEvent();    
  }

  function cleanUsername(name){
    if(identities[name]) return identities[name];
    
    return name.toString()
                .replace(/host\/|'|\\|@uswitch\.com|uswitch/gi, '')
                .replace(/\./g, ' ');
  };

  function gravatarUrl(userName) {
    var email = userName.replace(' ', '.') + '@uswitch.com';
    return 'http://www.gravatar.com/avatar/' + md5.createHash('md5').update(email).digest('hex');
  };

  function associationEvent() {
    var locationIpAddress = data.match(IP_ADDRESS_MATCHER);
    var location = locations[locationIpAddress];
    var macAddress = data.match(MAC_ADDRESS_MATCHER)[0];

    return {
      macAddress: macAddress,
      locationName: location['name'],
      locationIpAddress: locationIpAddress,
      locationId: location['id'],
      connectedAt: eventTimestamp,
      connected: true
    };    
  }

  function authenticationEvent() {
    var locationIpAddress = data.match(IP_ADDRESS_MATCHER);
    var location = locations[locationIpAddress];
    var userName = cleanUsername(data.match(/'(.*)'/i)[1]);
    var avatarUrl = gravatarUrl(userName);
    var macAddress = data.match(MAC_ADDRESS_MATCHER)[0];

    return {
      macAddress: macAddress,
      locationName: location['name'],
      locationIpAddress: locationIpAddress,
      locationId: location['id'],
      connectedAt: eventTimestamp,
      username: userName,
      avatarUrl: avatarUrl
    };    
  };

  function disassociationEvent() {
    var disconnectedDate = moment().format('ddd Do MMM');
    var disconnectedTime = moment().format('h:mm:ss a');
    var macAddress = data.match(MAC_ADDRESS_MATCHER)[0];

    return {
      macAddress: macAddress,
      disconnectedDate: disconnectedDate,
      disconnectedTime: disconnectedTime,
      disconnectedAt: eventTimestamp,
      connected: false
    };
  };
}

module.exports = HostAPDMessage;