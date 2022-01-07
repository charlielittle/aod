# mongodb-generate-materialized-index

Provides a JavaScript function to generate a collection of documents with the flattened keys to requestInstance document desc and nodeId fields.  This is done by traversing each document's nested hierarchy of dimensions array contents and writing a document with the id, datascope, logicalDimId, objectType, and either desc or nodeId fields.  One can then query the "view_desc" documents to find all the source collection document keys containing these combinations of values or all that have a specific combination of desc or nodeId values.

To run the example:

```bash
# Run the script to generate/insert sample data ( up to 1m requestInstance samples with 1000 docs per datascope ID value 00000-09999 )
# After sample data generation, the script will create the materialized index by looping over all the sample requestInstance documents
> node src/index.js --insert --url="$MY_ATLAS_URL"

# Run the script to only create the materialized index from requestInstance documents already in the source collection 
> node src/index.js --url="$MY_ATLAS_URL"
```

The script will log progress on data generation and also on creating index entries.  For example:
```log
...
Distinct datascope count: 9
[
  '19F5AE1EE45C4AA4979195910884C614-00005-00000',
  '19F5AE1EE45C4AA4979195910884C614-00005-00001',
  '19F5AE1EE45C4AA4979195910884C614-00005-00002',
  '19F5AE1EE45C4AA4979195910884C614-00005-00003',
  '19F5AE1EE45C4AA4979195910884C614-00005-00004',
  '19F5AE1EE45C4AA4979195910884C614-00005-00005',
  '19F5AE1EE45C4AA4979195910884C614-00005-00006',
  '19F5AE1EE45C4AA4979195910884C614-00005-00007',
  '19F5AE1EE45C4AA4979195910884C614-00005-00008'
]
datascopes to generate: 9
dropped 'view_desc' collection.
create new 'view_desc' collection.
count for datascope 19F5AE1EE45C4AA4979195910884C614-00005-00000: 1000, query time: 321.38
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 100, average time per requestInstance to create view (ms): 41.688
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 200, average time per requestInstance to create view (ms): 41.030
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 300, average time per requestInstance to create view (ms): 40.272
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 400, average time per requestInstance to create view (ms): 40.042
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 500, average time per requestInstance to create view (ms): 39.980
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 600, average time per requestInstance to create view (ms): 39.973
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 700, average time per requestInstance to create view (ms): 39.831
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 800, average time per requestInstance to create view (ms): 39.707
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 900, average time per requestInstance to create view (ms): 39.698
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00000, count: 1000, average time per requestInstance to create view (ms): 39.664
count for datascope 19F5AE1EE45C4AA4979195910884C614-00005-00001: 1000, query time: 564.58
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 100, average time per requestInstance to create view (ms): 39.042
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 200, average time per requestInstance to create view (ms): 39.291
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 300, average time per requestInstance to create view (ms): 39.304
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 400, average time per requestInstance to create view (ms): 39.334
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 500, average time per requestInstance to create view (ms): 39.282
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 600, average time per requestInstance to create view (ms): 39.412
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 700, average time per requestInstance to create view (ms): 39.467
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 800, average time per requestInstance to create view (ms): 39.478
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 900, average time per requestInstance to create view (ms): 39.295
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00001, count: 1000, average time per requestInstance to create view (ms): 39.333
count for datascope 19F5AE1EE45C4AA4979195910884C614-00005-00002: 1000, query time: 629.87
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00002, count: 100, average time per requestInstance to create view (ms): 39.142
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00002, count: 200, average time per requestInstance to create view (ms): 38.719
datascope: 19F5AE1EE45C4AA4979195910884C614-00005-00002, count: 300, average time per requestInstance to create view (ms): 39.086
```
