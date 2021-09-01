const generate_index = function (doc, meta) {
  var dataScope = doc.requestInstance.datascopeId;
  var objectType =  doc.requestInstance.objectType;
  var id = doc.requestInstance.id;

  if(dataScope && objectType){
    if(objectType !="JOB"){

      var processChildren = function(dataScope,logicalDimId,children)
      {
        if(children == null || children.length == 0)
          return;

        for(var k=0;k<children.length; k++)
        {
          child = children[k];
          // emit([dataScope,logicalDimId,child.type,child.desc,objectType],null);
		  let item = { "id" : id, "dataScopeId": dataScope,"logicalDimId":logicalDimId,"type":child.type,"desc":child.desc,"objectType":objectType };
        //   let res = db.view_desc.insertOne( item );
          console.log( item );

		  // emit([dataScope,logicalDimId,child.type,child.nodeId,objectType],null);
		  item =     { "id" : id, "dataScopeId": dataScope,"logicalDimId":logicalDimId,"type":child.type,"nodeId":child.nodeId,"objectType":objectType};
        //   res = db.view_desc.insertOne( item );
          console.log( item );
          processChildren(dataScope,logicalDimId,children[k].children);
        }
      }

      for(var h=0;h<doc.requestInstance.dataSet.length;h++){
        var logicalDimId = doc.requestInstance.dataSet[h].logicalDimId;
        for(var i=0;i<doc.requestInstance.dataSet[h].selections.length;i++)
           {
            for(var j=0;j<doc.requestInstance.dataSet[h].selections[i].items.length;j++)
                {
                 var itemzz = doc.requestInstance.dataSet[h].selections[i].items[j];
                  processChildren(dataScope,logicalDimId,itemzz.children);
                 }
            }
       }
    }
  }
}

module.exports = generate_index;
