/*
 * Ryan Haas
 * Dr. David Tarnoff
 * CSCI 4677-901, IoT
 * 9 October, 2020
 */

const FS    = require('fs');
const JSON5 = require('json5'); // Using json5 because hex values are supported.
const MQTT = require('mqtt');

// Read in the JSON file to an object:
let json_obj = JSON5.parse(
	FS.readFileSync('config/config.json5')
)

// Create the mqtt object using the MQTT config values:
const client = MQTT.connect(json_obj["MQTT_CONFIG"])

// Set the connection with my broker and subscribe:
client.on('connect', function () {
	console.log('\n[MQTT Client] Connected to broker.');
	
	// Subscribe and notify:
	client.subscribe('pub/mouseinput', function (err) {
		console.log('\n[MQTT Client] Subscribed to pub/mouseinput.\n');
		if (err) throw "Error description: " + err;
	});
});

/*
	This function is not my own; I got it from
	https://stackoverflow.com/questions/13468474/javascript-convert-a-hex-signed-integer-to-a-javascript-value
*/
function hexToInt(hex) {
    if (hex.length % 2 != 0) {
        hex = "0" + hex;
    }
    var num = parseInt(hex, 16);
    var maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
        num = num - maxVal
    }
    return num;
}

// Set listener for messsages; only handle 'pub/mouseinput' topic:
client.on('message', function(topic, message) {
	let input = '';
	let click = 0;
	let x_val = 0;
	let y_val = 0;
	let scroll = 0;

	if (topic == 'pub/mouseinput') {
		// Handy conversion directly from hex into string:
		input = message.toString('hex');

		// Preserving hex representations:
		clickStr = input.substring(0, 2); // First byte for left, right, wheel
		x_valStr = input.substring(2, 4);
		y_valStr = input.substring(4, 6);
		scrollStr = input.substring(6, 8);

		// Get the signed values:
		click = hexToInt(clickStr);
		x_val = hexToInt(x_valStr);
		y_val = hexToInt(y_valStr);
		scroll = hexToInt(scrollStr);

		// Positive values are right movement, neg are left; 0=none:
		if (x_val > 0)
			console.log('Mouse right');
		else if (x_val < 0)
			console.log('Mouse left');
		else
			console.log('No X movement');	
		
		// Positive values are down movement, neg are up; 0=none:
		if (y_val > 0)
			console.log('Mouse down')
		else if (y_val < 0)
			console.log('Mouse up')
		else
			console.log('No Y movement');

		// Test for 0 first, since it is more likely:
		if (click == 0)
			console.log('No click');
		else if (click == 1)
			console.log('Left click');
		else if (click == 2)
			console.log('Right click');
		else // Value here is 4
			console.log('Wheel click');
			
		if (scroll == 0)
			console.log('No scroll');
		else
			if (scroll == 1)
				console.log('Scroll up');
			else // Value here is 2
				console.log('Scroll down');

		// Show the original hex:
		console.log("\nMOUSE INPUT:");
		console.log("Click=0x" + clickStr + " Scroll=0x" + scrollStr);
		console.log("X mov=0x" + x_valStr + " Y mov=0x" + y_valStr + "\n");

		// Send Ack:
		client.publish('sub/ack', 'Ack: Success!');
		console.log('Acknowledgement sent to publisher.\n');
	}
});
