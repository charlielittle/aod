// const url = "mongodb+srv://aod:aod@cluster0.qukk7.mongodb.net/myFirstDatabase?retryWrites=false&w=1";
const url = "mongodb+srv://aod:aod@aod-views.qukk7.mongodb.net/aod?retryWrites=true&w=majority";

const { strict } = require("assert");
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
const { MongoClient } = require("mongodb");
const { userInfo } = require("os");
const { exit } = require("process");
const { getSystemErrorMap } = require("util");
const generate_index = require("./view_function");


const client = new MongoClient(url, { "useUnifiedTopology": true });
var count = 0;

let changeStream;

const simulateAsyncPause = () =>
    new Promise(resolve => {
        setTimeout(() => resolve(), 1000);
});

async function run() {
    await client.connect();

    try {
        const database = client.db("aod");
        const collection = database.collection("aod");
        var view = database.collection("view_desc");

        // open a Change Stream on the "haikus" collection
        changeStream = collection.watch();
        // set up a listener when change events are emitted
        changeStream.on("change", async (next) => {
        // process any change event
            console.log("received a change to the collection: \t", next);
            if( next.operationType == "insert" ) {
                const itemCount = await generate_index( next.fullDocument, view );
            }
        });

        while( true ) {
            await simulateAsyncPause();

            let one = await collection.findOne();
            if( one ) {
                delete one._id;
                await collection.insertOne( one );
            }
        }
        // await changeStream.close();

        // console.log("closed the change stream");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
