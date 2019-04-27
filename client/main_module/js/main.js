(function () {
	"use strict";

	const Vue = require("vue");
	const App = require("./components/app.vue");
	const socket = require("vue-websocket").default;

	Vue.use(socket, null, { "autoConnect": false });

	new Vue({
		"el": "#app",
		"render": function (h) {
			return h(App);
		}
	});
}())