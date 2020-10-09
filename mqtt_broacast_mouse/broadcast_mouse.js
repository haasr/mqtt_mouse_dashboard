const FS    = require('fs');
const HID   = require('node-hid');
const JSON5 = require('json5'); // Using json5 because hex values are supported.
const MQTT  = require('mqtt');

// Read in the JSON file to an object:
let json_obj = JSON5.parse(
	FS.readFileSync('config/config.json5')
);

// Create the node-hid object using the hexadecimal values from the config:
const MOUSE = new HID.HID(json_obj['USB_MOUSE_CONFIG']['Vendor_ID'],
				json_obj['USB_MOUSE_CONFIG']['Product_ID']);

// Create the mqtt object using the MQTT config values:
const MQTT_CLIENT = MQTT.connect(json_obj["MQTT_CONFIG"]);

// Set inFunction of the node-hid USB mouse object:
MOUSE.inFunction = receiveEtBroadcast;
// Bind the receiveEtBroadcast function:
MOUSE.read(MOUSE.inFunction.bind(MOUSE));

function receiveEtBroadcast(err, data) {
	// Handle any errors that occur because of the read() function.
	if (err) console.log('Error received when receiving data ', err);

	// Publish the data as it is generated. Don't care about Acks:
	MQTT_CLIENT.publish('pub/mouseinput', data, function (err) {
		if (err)
			throw "[MQTT PUB ERROR]: " + err;
		else // Log if publish OK:
			console.log('Broadcasted data: ', data);
	});

	// Call read() again to capture the next packet of data.
	this.read(this.inFunction.bind(this));
}

MQTT_CLIENT.on('connect', function() {
	console.log("\nPi MQTT client connected to broker.\n");
});
