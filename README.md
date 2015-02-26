

# To customize data
* Modify the variables at the top of the js/chart-progression.js to match your data
* Modify data/data.csv with dynamic data you want to be charted<br/>
Data must follow this format: <br/>
`TIME,TYPE,SUBJECT_ID,VALUE`<br/>
`TIME` and `VALUE` are numeric types<br/>
Each `TYPE` will be a new chart<br/>
`SUBJECT_ID` will link dots together
* Modify data/static.csv with static data using the same format and identifiers as above.<br/>
`VALUE` does not have be numeric in this data
This data will not be charted but exist as filters on the right

# Developer Setup
If you want to run grunt (not a requirement), use the following [guide](http://gruntjs.com/getting-started).

* Install Node
* Install Grunt <br/>
`npm install -g grunt-cli`
* Navigate to root directory
* Install dependencies<br/>
`npm install`
* Run grunt to setup bower, jshint, etc.<br/>
`grunt`