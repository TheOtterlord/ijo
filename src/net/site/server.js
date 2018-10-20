const HTTPServer = require("./../server/http");
const CookieManager = require("./cookies");
const SessionManager = require("./sessions");
const EJS = require("./ejs");

function parseCookies(header) {
	let cookies = [];

	if(header === undefined) {
		return cookies;
	}

	cookies = header.split(";");

	return cookies.map(function(cookie) {
		cookie = cookie.trim();

		return {
			key: cookie.substring(0, cookie.indexOf("=")),
			value: cookie.substring(cookie.indexOf("=") + 1)
		}
	});
}

function extractPath(path) {
	return require("url").parse(path).pathname;
}

function prepareResponse(response, request) {
	let endFunction = response.end;

	response.cookies = new CookieManager();
	response.cookies.set(
		app.globalConfig.get("siteServer.sessions.cookie.name"),
		request.session.id,
		{path: "/"}
	);

	response.end = function() {
		response.setHeader("Set-Cookie", response.cookies.build());

		endFunction.apply(response, arguments);
	};
}

function getBody(request) {
	return () => new Promise(function(resolve, reject) {
		let body = "";

		request.on("data", function(chunk) {
			body += chunk;
		});

		request.on("error", function(err) {
			reject(err);
		});

		request.on("end", function() {
			resolve(body);
		});
	});
}

function prepareRequest(request, sessionManager) {
	request.getBody = getBody(request);
	request.cookies = parseCookies(request.headers["cookie"]);
	request.session = sessionManager.get(
		request.cookies.find(cookie => cookie.key === app.globalConfig.get("siteServer.sessions.cookie.name"))
	);
}

module.exports = class SiteServer {
	constructor() {
		this.sessions = new SessionManager();
		this.ejs = new EJS();

		this.server = undefined;
		this.routes = [];
	}

	start() {
		this.sessions.start();

		this.server = new HTTPServer(this.handle.bind(this));
		this.server.port = app.globalConfig.get("siteServer.port");

		return this.server.start();
	}

	stop() {
		this.sessions.stop();

		return this.server.stop();
	}

	route(route) {
		this.routes.push(route);
	}

	async handle(request, response) {
		prepareRequest(request, this.sessions);
		prepareResponse(response, request);

		let path = extractPath(request.url);
		let method = request.method;
		let next = () => {};

		for(let route of this.routes) {
			if(!route.match({path, method})) {
				continue;
			}

			return route.callback(request, response, next);
		}

		response.statusCode = 404;
		response.end("Error: 404");
	}
}