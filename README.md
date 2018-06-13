# JsonMapper
Small Simple JS Json mapper

Map one json object to another.
JS developer life is hard. You're getting numbers as strings. 
Someone on the backend is returning objects with underscores, 
so you called the police, but now you're stuck with this server. 


### Mapping definitions

First simple case, consider this response vrom server:
```javascript
const resp = {
  "playerId": "123e4567-e89b-12d3-a456-426655440000",
  "numberOfLives": "4",
  "lastRecord": "2018-05-14T03:00:00+0200"
}

```
Define transformation:

```javascript
const playerMapping = {
  "playerId": String,
  "numberOfLives": Int,
  "lastRecord": Date
}

```
Call: `mapJson(resp, playerMapping)`

And this is the result:
```javascript
{
  const resp = {
    "playerId": "123e4567-e89b-12d3-a456-426655440000",
    "numberOfLives": 4,
    "lastRecord": new Date("2018-05-14T03:00:00+0200")
  }
}
```

But now you can do more cool stuff. 
For example you have another api, returning list of users.
Now you can reuse your mapping, on the list:
```javascript
const listMapping = {
  "userList": new ComplexArray(playerMapping)
}
```
So when you receive array of users, each object will be mapped
correctly to your needs.

But wait there's more.

Key `PlayerId` sounds little too tedious. 
So you can define transformation:
```javascript
const advancedPlayerMapping = {
  "playerId": {
    toName: "id",
    type: String,
  },
  "numberOfLives": Int,
  "lastRecord": Date
}

```
and now the output will be
```javascript
const mappedResp = {
  "id": "123e4567-e89b-12d3-a456-426655440000",
  "numberOfLives": 4,
  "lastRecord": new Date("2018-05-14T03:00:00+0200")
}
```

But wait there's more!

Wha if playerId consists of multiple parts with meaning. First part is groupId. 
Now you need more complex transformation. For that purpose you can write your own mapping function.
```javascript
function idMapper(value) {
  const idSplit = value.split("-");
  return {
    groupId: idSplit[0],
    playerId: value,
    isValid: value.includes("-")
  }
}


const playerMapping = {
  "playerId": {
    toName: "playerIdentifier",
    mapper: idMapper,
  },
  "numberOfLives": Int,
  "lastRecord": Date
}
```
Now the result will be:
```javascript
const mappedResp = {
  "playerIdentifier": {
    groupId: "123e4567",
    playerId: "123e4567-e89b-12d3-a456-426655440000",
    isValid: true,
  },
  "numberOfLives": 4,
  "lastRecord": new Date("2018-05-14T03:00:00+0200")
}
```

### Mapping configuration
Defining these mapping objects can do for you more than you expect. 
You can for example force consistency of object structures. 
There is third argument to function: `mapJson(obj, mappingDef, options)`
```javascript
options = {
  includeUndescribed: boolean, // includes also attributes not specified in mappingDef
  fillMissing: boolean, // add missing keys from obj - default true
}
```

So having input object
```javascript
const simpleObj = {
  attr1: "string1",
  attr2: "string1",
  attr3: "string1",
}
```
and mapping definition:
```javascript
const simpleMapping = {
  attr1: String,
  attr3: String,  
  attr4: String,  
}
```
calling `const mappingResult = mapJson(simpleObj, simpleMapping)` will produce
```javascript
const mappingResult = {
  attr1: "string1",
  attr3: "string1",
  attr4: null,
}
```
thus maintaining the structure defined in `simpleMapping`.

Or define your custom default value for attributes
```javascript
const simpleMapping = {
  attr1: String,
  attr3: String,  
  attr4: {
    type: String,
    defaultValue: "this is missing string"
  },  
}
```
with result
```javascript
const mappingResult = {
  attr1: "string1",
  attr3: "string1",
  attr4: "this is missing string",
}
```


For more information consult TypeMapper.js.flow with comments and all options.

That's all folks;
