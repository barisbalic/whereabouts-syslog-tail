function DHCPMessage(data){
  function macAddress() {
    var macAddress = data.match(/[0-9a-f]{12}/i)[0];
    var pairs = macAddress.match(/[a-f0-9]{2}/gi);
    return pairs.join(':').toLowerCase();
  };

  function ipAddress() {
    return data.match(/\d+\.\d+\.\d+\.\d+/i)[0];
  };

  this.isInteresting = function() {
    return true;
  };

  this.json = {
    macAddress: macAddress(),
    ipAddress: ipAddress()
  };
};

module.exports = DHCPMessage;