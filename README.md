# Whereabouts Syslog Tail

This small application will listen to a syslog file and write a mixture of WPA(hostapd) and DHCP events into a mongodb database, giving you a list of devices that are, or have been seen, on your network.  DHCP is completely optional, and it is recommended you set up an RSYSLOG server rather than run this directly on the Master/Access Points.

There is also a very basic API written into this application for querying for one or more devices by MAC address or associated username.

Any questions? Join the conversation at [![Gitter](https://badges.gitter.im/barisbalic/whereabouts-syslog-tail.png)](https://gitter.im/barisbalic/whereabouts-syslog-tail)

## Notice!

Before continuing you should be aware...

- This is just the backend, see the [whereabouts-meteor](https://github.com/barisbalic/whereabouts-meteor) for the default interace.
- This is a work in progress.
- It is **strongly** advised you do not run this on the network master.
- The application needs some configuration.
- It is probably not very idiomatic.

## Installation

Get the source code onto the machine where your syslog exists, you can do this by any means you would normally.  You should then install the dependencies with NPM, like so...

```bash
  $ npm install
```

It's worth reading the configuration section blow next, but once you are happy you can use the sample upstart script found in `/config` or write your own to get/keep the application running.

## Configuration

There are two files that you should take a look at before starting the tail, these are `./config/identities.json` which contains a mapping of machine hostnames to usernames, and `./config/locations.json` which contains a mapping of IP addresses to 'location' infomation.

Different Operating Systems seem to have slightly different behaviour when providing their identity, to even out the mess you can add entries to `identities.json`, the exact string identity should be used as a key, the real username as the value.  An example can be found in the file.

`locations.json` exists because the primary purpose of 'whereabouts' is to make it possible to find people, I've provided the location config for my current office as an example.  Each Access Point IP address should appear as a key, then the corresponding location information as a value.


### Front End

There is a basic default front-end called [whereabouts-meteor](https://github.com/barisbalic/whereabouts-meteor) (imaginative!) which provides "live" updates and some basic search functionality.  If you create your own please let me know and I'll list it here.

## Contributing

Contributions are very welcome, ideally anything that makes this more generic and easier for other people to use in their own environments.

Quick guide to contributing:

1. Fork the repo.
2. Create your branch `git checkout -b branch-name` **bonus for feature branches**.
3. Make your changes.
4. Test to make sure you have not broken any existing functionality.
5. Commit your changes.
6. Push to your branch.
7. Submit a pull request.

I will do my best to merge your PR or provide feedback as soon as possible!