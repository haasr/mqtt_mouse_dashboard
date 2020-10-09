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

const client = MQTT.connect(json_obj["MQTT_CONFIG"])

client.on('connect', function () {
	console.log("\nDesktop MQTT client connected to broker.\n");
	
	client.subscribe('pub/mouseinput', function (err) {
		if (err) throw "Error description: " + err;
	});
});

client.on('message', function(topic, message) {
	let input = '';
	let click = 0;
	let x_val = 0;
	let y_val = 0;
	let scroll = 0;

	if (topic == 'pub/mouseinput') {
		input = message.toString('hex');

		// Preserving hex representations:
		clickStr = input.substring(0, 2);
		x_valStr = input.substring(2, 4);
		y_valStr = input.substring(4, 6);
		scrollStr = input.substring(6, 8);

		// Convert to unsigned ints:
		let click = parseInt(clickStr, 16);
		let x_val = parseInt(x_valStr, 16);
		let y_val = parseInt(y_valStr, 16);
		let scroll = parseInt(scrollStr, 16);

		if (x_val < 248)
			if (x_val == 0)		
				console.log('No X movement');
			else
				console.log('Mouse right');
		else
			console.log('Mouse left');

		if (y_val < 248)		
			if (y_val == 0)
				console.log('No Y movement');
			else
				console.log('Mouse down');
		else
			console.log('Mouse up');

		if (click == 1)
			console.log('Left click');
		else if (click == 2)
			console.log('Right click');
		else if (click == 4)
			console.log('Wheel click');
		else
			console.log('No click');

		if (scroll == 0)
			console.log('No scroll');
		else
			if (scroll == 1)
				console.log('Scroll up');
			else
				console.log('Scroll down');

		console.log("\nMOUSE INPUT:");
		console.log("Click=0x" + clickStr + " Scroll=0x" + scrollStr);
		console.log("X mov=0x" + x_valStr + " Y mov=0x" + y_valStr + "\n");

		// Send Ack:
		client.publish('sub/ack', 'Ack: Success!');
		console.log('Acknowledgement sent to publisher.\n');
	}
});