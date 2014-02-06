var HostAPDMessage = require('./hostapd_message'),
  DHCPMessage = require('./dhcp_message');

function Message(data) {
  var _data = data;
  var _message = message();

  function isDHCP() {
    return !!(_data.match(/dhcp/i));
  };

  function isHostAPD() {
    return !!(_data.match(/hostapd/i));
  };

  function message() {
    if (isDHCP()) {
      return new DHCPMessage(_data);
    } else if (isHostAPD()) {
      return new HostAPDMessage(_data);
    }
  };

  this.toJSON = function() {
    return _message.json;
  };

  this.isInteresting = function() {
    return !!(_message) && _message.isInteresting();
  };
}

module.exports = Message;