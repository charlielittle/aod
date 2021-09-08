// const url = "mongodb+srv://aod:aod@cluster0.qukk7.mongodb.net/myFirstDatabase?retryWrites=false&w=1";
const url = "mongodb+srv://aod:aod@aod-views.qukk7.mongodb.net/aod?retryWrites=true&w=majority";

const { strict } = require("assert");
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
const { MongoClient } = require("mongodb");
const { userInfo } = require("os");
const { exit } = require("process");
const { getSystemErrorMap } = require("util");
const generate_index = require("../view_function");

const client = new MongoClient(url, { "useUnifiedTopology": true });
var count = 0;

async function run() {
	const args = require('minimist')(process.argv.slice(2));
	console.log( JSON.stringify( args ) );
	let reverse = false;
	if( args["reverse"]==true ) {
		console.log( "Reverse flag found" );
		reverse = true;
	} else { console.log( "No reverse flag or reverse==false"); }
	try {
		await client.connect();

		const database = client.db("aod");
		const aod = database.collection("aod");

		var result = await aod.findOne();
		if (!result) {
			const fs = require('fs');
			const path = require('path');

			let rawdata = fs.readFileSync(path.resolve(__dirname, '../aod-sample.json'));
			let sample = JSON.parse(rawdata);
			console.log(sample);
			result = await aod.insertOne(sample);
			if (result) result = await aod.findOne();
		}
		delete result._id;
		const viewFun = require('../view_function');
		if (!result["requestInstance"]) {
			result = { "requestInstance": result };
		}
		console.log(result);

		var datascopes = await aod.distinct("requestInstance.datascopeId");
		if( reverse ) datascopes.reverse();
		datascopes = datascopes.slice( 0, datascopes.length/2 );
		console.log(datascopes);
		var view = database.collection("view_desc");
		await createViews(datascopes, aod, view);
		console.log("createViews returned.");
		// console.log(result);
		// insertMany( result, aod );
	} catch( err ) {
		console.error("Caught exception: " + err );
	} finally {
		while (count > 0) {
			console.log(`waiting on background tasks: count=${count}`);
			await new Promise(r => setTimeout(r, 2 * 1000));
		}
		await client.close();
		console.log("Mongo session closed.  Exiting");
	}
}
run().catch(console.dir);

async function createViews(datascopes, aod, view) {
	// datascopes.forEach( function (scope) {
	console.log( `datascopes to generate: ${datascopes.length}`);
	for( let idx = 0; idx < datascopes.length; idx++ ) {
		const scope = datascopes[ idx ];
		// while (count >= 5) {
		// 	console.log(`waiting on background tasks: count=${count}`);
		// 	await new Promise(r => setTimeout(r, 2 * 1000));
		// }
		count++;
		let queryTotal = 0;
		let queryStart = process.hrtime();
		const docs = await aod.find({ "requestInstance.datascopeId": scope }).toArray();
		let queryEnd = process.hrtime( queryStart );
		console.log( `count for datascope ${scope}: ${docs.length}, query time: ${(queryEnd[1]/1000000).toFixed(2)}`);
		let totalTime = 0;
		for( let i = 0; i < docs.length; i++ ) { //.forEach( async function(doc) {
			const doc = docs[ i ];
			start = process.hrtime();
			const itemCount = await generate_index(doc, view);
			let hrend = process.hrtime( start );
			totalTime += hrend[1];
			count--;
			// console.log( `${(hrend[1]/1000000).toFixed(2)} items added ${itemCount}` );
			if( (i+1) % 1000 == 0 ) {
				console.log( `count: ${i+1}, average time per instance: ${(totalTime/1000000/(i+1)).toFixed(2)}`);
			}
		}// );
			// count--;
	} //);
}

async function insertMany(result, aod) {
	var batch = [];
	var id = result.requestInstance.id;
	var datascopeId = result.requestInstance.datascopeId;
	// need to remove _id if it is there
	delete result._id;
	for (let i = 0; i < 1000000; i++) {
		let scopeIdx = Math.floor(i / 1000);
		let scopePad = scopeIdx.toString().padStart(5, "0");
		let padded = i.toString().padStart(9, "0");
		result.requestInstance.id = id.concat("-", padded);
		result.requestInstance.datascopeId = datascopeId.concat("-", scopePad);
		if (i % 1013 == 0)
			console.log(result.requestInstance.id, result.requestInstance.datascopeId);
		batch.push(JSON.parse(JSON.stringify(result)));
		if (batch.length > 0 && batch.length % 1000 == 0) {
			// insert batch async
			console.log(`Batch length: ${batch.length}`);
			count++;
			const db = aod.insertMany(batch, { "ordered": false }).then((dbResult) => {
				console.log(dbResult);
				count--;
				// console.log( (result._id||"no _id" )); 
			});
			batch = [];
		}
		while (count > 5) {
			console.log(`waiting on tasks before adding another: count=${count}`);
			await new Promise(r => setTimeout(r, 2 * 1000));
		}
	}
}

async function sleep(secs) {
	await new Promise(r => setTimeout(r, secs * 1000));
	console.log("slept " + secs);
}
