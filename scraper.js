/* eslint camelcase: ["error", {properties: "never"}] */

var request = require('request');
var moment = require('moment');

function formatDate(find, body, callback) {
  var toscrape = body.substring(body.indexOf(find), body.indexOf(find) + 100);
  var scrapedDate = toscrape.substring(toscrape.indexOf('on the') + 7, toscrape.indexOf('.'));
  console.log('scrapedDate: ' + scrapedDate);
  var dateSplit = scrapedDate.split(' ');
  console.log('dateSplit: ' + dateSplit);
  var day = dateSplit[0].substring(0, 2);
  console.log('day: ' + day);
  var month = dateSplit[3];
  console.log('month: ' + month);
  var year = dateSplit[dateSplit.length - 1];
  console.log('year: ' + year);
  var shortDate = moment(year + '-' + month + '-' + day, 'YYYY-MMMM-DD').format('YYYY-MM-DD');
  callback(shortDate, scrapedDate);
}

function slaveRegister(code, callback) {
  var url = 'http://www.slaveregister.com/' + code;
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('Scraping slaveregistry.com website for code ' + code);
      var valid = -1;
      var msg = '';
      var data = {slave_id: code, message: ''};
      if (body.includes(code + ' is not a valid Slave Registration Number')) {
        msg = 'SlaveRegister.com: Entered code is invalid!';
        data = {slave_id: code, message: msg};
        valid = 1;
      } else if (body.includes(code + ' was issued by The Slave Register')) {
        msg = 'SlaveRegister.com: Entered code is already used!';
        valid = 2;
        var find = code + ' was issued by The Slave Register';
        formatDate(find, body, function (shortDate, fullDate) {
          data = {slave_id: code, message: msg, fullregdate: fullDate, regdate: shortDate};
        });
      } else if (body.includes(code + ' was not registered')) {
        msg = 'SlaveRegister.com: Entered number is valid but was never used!';
        data = {slave_id: code, message: msg, fullregdate: moment(new Date(), 'DD-MMMM-YYYY'), regdate: moment(new Date()).format('YYYY-MM-DD')};
        valid = 3;
      }
      callback(valid, data);
    }
  });
}

module.exports = {
  SlaveRegister: slaveRegister
};
