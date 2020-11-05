const Assert = include("assert");
const Utils = include("@ijo-sm/utils");

class PluginEnvironment {
	constructor(object) {
		Assert.equal(typeof object, "object", "The argument object must be an object");

		this.platform = object.platform;
		this.language = object.lang;
		this.indexFile = object.index;
		this.includes = object.includes;
		this.excludes = object.excludes;
	}

	set language(value) {
		Assert.equal(typeof value, "string", "There variable language must be a string");

		this._language = value;
	}

	get language() {
		return this._language;
	}

	set indexFile(value) {
		Assert.equal(typeof value, "string", "There variable indexFile must be a string");

		this._indexFile = value;
	}

	get indexFile() {
		return this._indexFile;
	}
}

module.exports = class Plugin {
	constructor(object) {
		Assert.equal(typeof object, "object", "The argument object must be an object");

		this.name = object.name;
		this.description = object.description;
		this.version = object.version;
		this.author = object.author;
		this.license = object.license;
		this.panel = this._parseEnvironments(object.panel);
		this.machine = this._parseEnvironments(object.machine);
	}

	loadIndexFile() {
		let enviroment = this._findBestEnvironment();

		if(enviroment === undefined) {
			return console.error(`The plugin ${this.name} has no matching environments for the panel`);
		}

		let indexFilePath = Utils.path.resolve(`plugins/${this.name}/${enviroment.indexFile}`);

		this.loadedIndexFile = require(indexFilePath);
	}

	set name(value) {
		Assert.equal(typeof value, "string", "The variable name must be a string");

		this._name = value;
	}

	get name() {
		return this._name;
	}

	set version(value) {
		Assert.equal(typeof value, "string", "The variable version must be a string");

		this._version = value;
	}

	get version() {
		return this._version;
	}

	executeEvent(event) {
		if(!this._isEventCallable(event)) {
			return;
		}

		let args = [];

		switch(event) {
			case "enable":
				args.push("test");
				break;
		}

		return this.loadedIndexFile[event](...args);
	}

	_isEventCallable(event) {
		return typeof this.loadedIndexFile === "object" && typeof this.loadedIndexFile[event] === "function";
	}

	_findBestEnvironment() {
		let panelPlatform = Utils.platform.get();
		let sortedEnvironments = this.panel.sort(Utils.array.sortByObjectKey("platform"));

		for(let enviroment of sortedEnvironments) {
			if(!Utils.platform.match(enviroment.platform, panelPlatform)) {
				continue;
			}
			
			return enviroment;
		}
	}

	_parseEnvironments(environment) {
		if(environment === undefined) {
			return [];
		}
		else if(environment instanceof Array) {
			environment.map(function(environment) {
				return new PluginEnvironment(environment);
			});
			
			return environment;
		}
	
		return [new PluginEnvironment(environment)];
	}
}