# Hypercat Stream

## Description
The Hypercat Stream Plugin enables Reekoh to read from a Hypercat catalogue and ingest device and telemetry data from it into a Reekoh pipeline for further processing. 

### Configuration

1. Endpoint Host - Hypercat server endpoint.
2. Url path - Hypercat defined url endpoint.
3. Server Auth Key - Hypercat authentication key.
4. Key Map - Hypercat rel/val mappings

### Sample Key Map
```javascript
{
    'urn:X-hypercat:rels:pagingNumFound': 'pagingNumFound',
    'urn:X-hypercat:rels:pagingOffset': 'pagingOffset',
    'urn:X-hypercat:rels:pagingItemLimit': 'pagingItemLimit',
    'urn:X-hypercat:rels:supportsPaging': 'supportsPaging',
    'urn:X-hypercat:rels:supportsSearch': 'supportsSearch',
    'urn:X-smartstreets:rels:hasVisibility': 'visibility',
    'urn:X-smartstreets:rels:hasMaintainer': 'maintainer',
    'urn:X-hypercat:rels:hasDescription:en': 'description',
    'urn:X-smartstreets:rels:hasId': '_id', // required
    'urn:X-smartstreets:rels:hasName:en': 'name', // required
    'urn:X-smartstreets:rels:fields': 'fields',
    'urn:X-smartstreets:rels:data': 'data',
    'urn:X-smartstreets:rels:tags': 'tags',
    'urn:X-hypercat:rels:isContentType': 'contentType',
    'http://www.w3.org/2003/01/geo/wgs84_pos#lat': 'latitude',
    'http://www.w3.org/2003/01/geo/wgs84_pos#long': 'longitude',
}
```