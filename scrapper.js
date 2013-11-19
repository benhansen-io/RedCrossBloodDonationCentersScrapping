var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var json2csv = require('json2csv');

var regions = ['socal',
  'pnw',
  'northernca',
  'lewisclark',
  'northcentral',
  'midwest',
  'centralplains',
  'southwest',
  'badgerhawkeye',
  'heartofamerica',
  'missouri-illinois',
  'greaterozarks',
  'greatlakes',
  'southeasternmichigan',
  'indianaohio',
  'rivervalley',
  'tennesseevalley',
  'alabama',
  'westernlakeerie',
  'northernohio',
  'centralohio',
  'greateralleghenies',
  'nne',
  'ma',
  'ct',
  'nyp',
  'nepa',
  'pennjersey',
  'gcp',
  'midatlantic',
  'carolinas',
  'sc',
  'southern',
  'midatlantic',
  'puertorico'];

var main_url = 'http://www.redcrossblood.org/donation-centers/';

async.concat(regions, fetchCentersForRegion, function(err, results) {
  if(err) {
    console.err(err);
    return;
  }
  json2csv({data: results, fields: ['Title', 'Link', 'AddressLine1', 'AddressLine2', 'City', 'State', 'Zip', 'Region']}, function(err, csv) {
    if (err) console.err(err);
    console.log(csv);
  });

});

function fetchCentersForRegion(region, callback) {

  request(main_url + region, function (error, response, body) {
    if (error || response.statusCode != 200) {
      console.err(error + ': ' + response.statusCode);
    }
    $ = cheerio.load(response.body);
    var locations = $('div.views-field-title > span.field-content');
    var data = [];
    locations.each(function(i, center) {
      var title = $(center).text();
      var link = main_url + $(center).find('a').attr('href');
      var parent = $(center).parent().parent();
      var addressLine1 = parent.find('div.views-field-street > span.field-content').text();
      var addressLine2 = parent.find('div.views-field-street-1 > span.field-content').text();
      var Line3 = parent.find('div.views-field-postal-code > span.field-content').text();
      var city = /[\s\n\r]+([^,]*)/m.exec(Line3)[1];
      var state = /, ([\w]{2})/m.exec(Line3)[1];
      var zip = /[\d]{5}-?[\d]*/m.exec(Line3)[0];
      data.push({"Title": title,
                "Link": link,
                "AddressLine1": addressLine1,
                "AddressLine2": addressLine2,
                "City": city,
                "State": state,
                "Zip": zip,
                "Region": region});
    });
    callback(null, data);
  });
}


