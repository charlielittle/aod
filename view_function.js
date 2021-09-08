const generate_index = async function (doc, view) {
	var dataScope = doc.requestInstance.datascopeId;
	var objectType = doc.requestInstance.objectType;
	var id = doc.requestInstance.id;
	var items = 0;
	var batch = [];

	if (dataScope && objectType) {
		if (objectType != "JOB") {
			var processChildren = async function (dataScope, logicalDimId, children) {
				if (children == null || children.length == 0)
					return;

				for (var k = 0; k < children.length; k++) {
					child = children[k];
					// emit([dataScope,logicalDimId,child.type,child.desc,objectType],null);
					let item = { "id": id, "datascopeId": dataScope, "logicalDimId": logicalDimId, "type": child.type, "desc": child.desc, "objectType": objectType };
					try {
						batch.push( item );
						// let res = await view.insertOne( item ); //.then(res => items++, (err) => { 
						// console.log( `inserted: ${JSON.stringify(item)}`);
						items++;
					} catch( err ) {
						console.error( "desc view insert err: " + err );
						if( err.code = 11000 ) {
							console.log( "Duplicate: " + JSON.stringify( item ) );
							return;
						}
					}
					//   items++;
					//   console.log( item );

					// emit([dataScope,logicalDimId,child.type,child.nodeId,objectType],null);
					item = { "id": id, "datascopeId": dataScope, "logicalDimId": logicalDimId, "type": child.type, "nodeId": child.nodeId, "objectType": objectType };
					try {
						batch.push( item );
						// let res = await view.insertOne( item ); //.then(res => items++, (err) => { 
						// console.log( `inserted: ${JSON.stringify(item)}`);
						items++;
					} catch( err ) {
						console.error( "nodeId view insert err: " + err );
						if( err.code = 11000 ) {
							console.log( "Duplicate: " + JSON.stringify( item ) );
							return;
						}
					}
					//   items++;
					//    console.log( item );
					await processChildren(dataScope, logicalDimId, children[k].children);
				}
			}

			for (var h = 0; h < doc.requestInstance.dataSet.length; h++) {
				var logicalDimId = doc.requestInstance.dataSet[h].logicalDimId;
				for (var i = 0; i < doc.requestInstance.dataSet[h].selections.length; i++) {
					for (var j = 0; j < doc.requestInstance.dataSet[h].selections[i].items.length; j++) {
						var itemzz = doc.requestInstance.dataSet[h].selections[i].items[j];
						await processChildren(dataScope, logicalDimId, itemzz.children);
					}
				}
			}
			if( batch.length > 0 ) {
				let res = await view.insertMany( batch, { ordered: false, writeConcern: {w:1} });
				// console.log( `insertMany: ${res}` );
			} else {
				console.log( `Empty batch` );
			}
			// console.log( `${items} inserted for id: ${id} datascope: ${dataScope} objectType: ${objectType}` );
		}
	}
	return items; // return count of inserted index entries
}

module.exports = generate_index;
