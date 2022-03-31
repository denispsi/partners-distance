// Airtable
const Airtable = require('airtable');
const base = new Airtable({apiKey: 'keyxAZ3d9E89s9gyP'}).base('appp5bGpINlu3K49h');
const partners = [];

const getRecords = async () => {
  const table = base.table('Coordinates');
  const records = await table
    .select({ maxRecords: -1 })
    .firstPage();
  records.forEach(function (record) {
    partners.push({
        name: record.get('name'),
        partner_id: record.get('partner_id'),
        latitude: record.get('latitude'),
        longitude: record.get('longitude')
      });
  });
  return partners;
}

// Calculate distance
/** Converts numeric degrees to radians */
if(typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

//Return distance in kilometers between partner and our office
function getDistance(partner, office, decimals) {
    decimals = decimals || 2;
    var earthRadius = 6371; // km
    lat1 = parseFloat(partner.latitude);
    lat2 = parseFloat(office.latitude);
    lon1 = parseFloat(partner.longitude);
    lon2 = parseFloat(office.longitude);

    var dLat = (lat2 - lat1).toRad();
    var dLon = (lon2 - lon1).toRad();
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = earthRadius * c;
    return Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Compare IDs for sorting
function compareIds(a, b) {
    if (a.partner_id < b.partner_id){
      return -1;
    }
    if (a.partner_id > b.partner_id){
      return 1;
    }
    return 0;
}

const coordsOffice = {
  latitude : 42.6665921,
  longitude : 23.351723
};

// Get partners within 100km
async function getPartners() {
  const PartnersInvites = [];
  const records = await getRecords();
  for (let i = 0; i < records.length; i++) {
    if (getDistance(records[i], coordsOffice) < 100) {
      PartnersInvites.push({
        name: records[i].name,
        partner_id: Number(records[i].partner_id)
      });
    }
  }
  return PartnersInvites;
}

(async () => {
  try {
    const records = await getPartners();
    console.table(records.sort(compareIds), ['name']['partner_id']);
  } catch (error) {
    console.error(error);
  }
})();