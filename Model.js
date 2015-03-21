var fs = require('fs');

function Model(cfg) {
	// name and fields
	this.resourceCfg = cfg;
	this.modelName = cfg.name;
	this.filename = this.modelName + "_data.json";

	this.data = [];
	this.load();

	console.log('loaded: ' + this.data);
}

Model.prototype = {
	list: function(filterExpression) {
		console.log('list:' + this.modelName);
		return this.clone(this.data);
	},

	count: function(filterExpression) {
		return this.data.length;
	},

	create: function(sourceObj) {
		console.log('create');
		var obj = this.modelClone(sourceObj);

		if (!obj.id) {
			obj.id = this.guid();
			obj.model = this.modelName;
		}

		this.data.push(obj);
		this.save();
		return this.clone(obj);
	},

	queryItems: function(filter) {
		console.log('queryItenm: ' + this.data);
		var returnList = [];
		for (var i = 0; i < this.data.length; i++) {
			console.log('-=-' + this.data[i].id);
			if (filter(this.data[i])) {
				returnList[returnList.length] = this.data[i];
			}
		}
		return returnList;
	},

    queryItem: function(filter) {
		console.log('queryItenm: ' + this.data);
		var returnList = [];
		for (var i = 0; i < this.data.length; i++) {
			console.log('-=-' + this.data[i].id);
			if (filter(this.data[i])) {
				return this.data[i];
			}
		}
	},

	getItem: function(id) {
		console.log('getItem: ' + this.data);
		var r = this.queryItem(function(item){
			return item.id == id;
		});

		return r;
	},

	get: function(id) {
		console.log('get: ' + id);

		var item = this.getItem(id);
		var ret;
		if (item) {
			ret = this.modelClone(item);
		}
		return ret;
	},

	update: function(id, data) {
		console.log('update');
		var toUpdate = this.getItem(id);
		toUpdate = this.updateFrom(data, toUpdate);
		this.save();
		return this.clone(toUpdate);
	},

	load: function() {
		
		try {
			var dataContents = fs.readFileSync(this.filename, {
				encoding: 'UTF8'
			});

			if (dataContents) {
				this.data = JSON.parse(dataContents);
			}
		} catch(e) {

		}
	},

	save: function() {
		var json = JSON.stringify(this.data);
		console.log('save: ' + json);
		fs.writeFileSync(this.filename, json);
	},

	guid: function() {
		var g = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
		return g;
	},

	clone: function(obj) {
		return JSON.parse(JSON.stringify(obj));
	},

	updateFrom: function(from, to) {
		var ret = to;
		for (var i in this.resourceCfg.fields) {
			var fieldName = this.resourceCfg.fields[i];
			if (from[fieldName]) {
				console.log('cloning: ' + fieldName);
				ret[fieldName] = from[fieldName] || "";
			}
		}
		return ret;
	},

	modelClone: function(from, to) {
		var ret = to ? to : {};
		for (var i in this.resourceCfg.fields) {
			var fieldName = this.resourceCfg.fields[i];
			if (from[fieldName] || !to) {
				console.log('cloning: ' + fieldName);
				ret[fieldName] = from[fieldName] || "";
			}
		}

		ret.id = from.id;
		ret.model = this.modelName;
		return ret;
	},

};

module.exports = Model;
