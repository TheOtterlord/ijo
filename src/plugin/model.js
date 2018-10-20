function bestEnvironment(enviroments) {
	let panelPlatform = Utils.platform.get();

	enviroments.sort(Utils.array.sortByObjectKey("platform"));

	for(let enviroment of enviroments) {
		if(!Utils.platform.match(enviroment.platform, panelPlatform)) {
			continue;
		}
		
		return enviroment;
	}
}

class Plugin {
	constructor(object) {
		this.name = object.name;
		this.description = object.description;
		this.version = object.version;
		this.author = object.author;
		this.license = object.license;
		this.panel = object.panel;
		this.machine = object.machine;
	}

	initialize() {
		let enviroment = bestEnvironment(this.panel);

		if(enviroment === undefined) {
			return console.error(`The plugin ${plugin.name} has no matching environments for the panel`);
		}
	}
}

class PluginEnvironment {
	constructor(object) {
		this.platform = object.platform;
		this.language = object.lang;
		this.indexFile = object.index;
		this.includes = object.includes;
		this.excludes = object.excludes;
	}
}

module.exports = {Plugin, PluginEnvironment};