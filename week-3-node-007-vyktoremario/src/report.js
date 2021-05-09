const { getTrips, getDriver, getVehicle } = require("api");

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */

async function driverReport() {
  let tripData = await getTrips();
  let array = [];

  let uniqueID = tripData
    .map((item) => item.driverID)
    .filter((item, index, arr) => {
      return arr.indexOf(item) === index;
    });

  let vehicleInfo = uniqueID.map(async (item) => {
    try {
      let driverData = await getDriver(item);

      driverData.item = item;

      let vehicle = driverData.vehicleID.map(async (vehicleID) => {
        let vehicleData = await getVehicle(vehicleID);
        return {
          plate: vehicleData.plate,
          manufacturer: vehicleData.manufacturer,
        };
      });

      let vehicleDetails = await Promise.all(vehicle);
      driverData.vehicleDetails = vehicleDetails;
      return driverData;
    } catch {
      return item;
    }
  });
  let driver = await Promise.all(vehicleInfo);

  

  for (let i = 0; i < uniqueID.length; i++) {
    let count = 0;
    let trips = [];
    let cashCount = 0;
    let nonCashCount = 0;
    let totalAmountEarned = 0;
    let totalCashAmount = 0;
    let totalNonCashAmount = 0;
    let vehicleDetails = [];

    tripData.forEach((item) => {
      if (item.driverID === uniqueID[i]) {
        let amount = Number(`${item.billedAmount}`.split(",").join(""));
        trips.push({
          user: item.user.name,
          created: item.created,
          pickup: item.pickup.address,
          destination: item.destination.address,
          billed: amount,
          isCash: item.isCash,
        });
        count++;

        totalAmountEarned += amount;
        if (item.isCash) {
          cashCount++;
          totalCashAmount += amount;
        } else {
          nonCashCount++;
          totalNonCashAmount += amount;
        }
      }
    });

    try {
      if (driver[i].item === uniqueID[i]) {
        array.push({
          fullName: driver[i].name,
          id: uniqueID[i],
          phone: driver[i].phone,
          noOfTrips: count,
          noOfVehicles: driver[i].vehicleID.length,
          vehicles: driver[i].vehicleDetails,
          noOfCashTrips: cashCount,
          noOfNonCashTrips: nonCashCount,
          totalAmountEarned: Number(totalAmountEarned.toFixed(2)),
          totalCashAmount: Number(totalCashAmount.toFixed(2)),
          totalNonCashAmount: Number(totalNonCashAmount.toFixed(2)),
          trips: trips,
        });
      } else {
        array.push({
          id: uniqueID[i],
          noOfTrips: count,
          noOfCashTrips: cashCount,
          noOfNonCashTrips: nonCashCount,
          trips: trips,
          totalAmountEarned: Number(totalAmountEarned.toFixed(2)),
          totalCashAmount: Number(totalCashAmount.toFixed(2)),
          totalNonCashAmount: Number(totalNonCashAmount.toFixed(2)),
        });
      }
    } catch {}
  }
  return array;
}

module.exports = driverReport;
