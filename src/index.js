// const url = "mongodb+srv://aod:aod@cluster0.qukk7.mongodb.net/myFirstDatabase?retryWrites=false&w=1";
const url = "mongodb+srv://aod:aod@aod-views.qukk7.mongodb.net/aod?retryWrites=true&w=majority";

const { strict } = require("assert");
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
const { MongoClient } = require("mongodb");
const generate_index = require("../view_function");

const client = new MongoClient(url);
var count = 0;

async function run() {
  try {
    await client.connect();

    const database = client.db("aod");
    const aod = database.collection("aod");

	var result = await aod.findOne();
	if( !result ) {
		const fs = require('fs');
		const path = require('path');
		
		let rawdata = fs.readFileSync(path.resolve(__dirname, '../aod-sample.json'));
		let sample = JSON.parse(rawdata);
		console.log(sample);
		result = await aod.insertOne( sample );
		if( result ) result = await aod.findOne();
	}
	delete result._id;
	const viewFun = require('../view_function');
	if( !result["requestInstance"] ) {
		result = { "requestInstance" : result };
	}
	console.log( result );
	generate_index( result );
	
    // console.log(result);
	insertMany( result, aod )
  } finally {
	while( count > 0 ) {
		console.log( `waiting on background tasks: count=${count}` );
		await new Promise( r => setTimeout( r,  2 * 1000 ));
	}
    await client.close();
  }
}
run().catch(console.dir);

async function insertMany( result, aod ) {
	var batch = [];
	var id = result.requestInstance.id;
	var datascopeId = result.requestInstance.datascopeId;
	// need to remove _id if it is there
	delete result._id;
	for( let i = 0; i < 1000000; i++ ) {
		let scopeIdx = Math.floor(i / 1000);
		let scopePad = scopeIdx.toString().padStart( 5, "0" );
		let padded = i.toString().padStart(9,"0");
		result.requestInstance.id = id.concat( "-", padded );
		result.requestInstance.datascopeId = datascopeId.concat( "-", scopePad );
		if( i % 1013 == 0 )
			console.log(result.requestInstance.id, result.requestInstance.datascopeId);
		batch.push( JSON.parse( JSON.stringify(result) ) );
		if( batch.length > 0 && batch.length % 1000 == 0 ) {
			// insert batch async
			console.log( `Batch length: ${batch.length}` );
			count++;
			const db = aod.insertMany( batch, { "ordered":false } ).then( (dbResult) => { 
				console.log( dbResult) ;  
				count--; 
				// console.log( (result._id||"no _id" )); 
			} );
			batch = [];
		}
		while( count > 5 ) {
			console.log( `waiting on tasks before adding another: count=${count}` );
			await new Promise( r => setTimeout( r,  2 * 1000 ));
		}
	}
}
