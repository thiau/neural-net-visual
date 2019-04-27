/*jslint node: true, nomen:true*/
/*env:node*/
(function () {
	"use strict";
	require("dotenv").config({"silent": true});
	const gulp = require("gulp");
	const argv = require("yargs").argv;
	const browserify = require("browserify");
	const cond = require("gulp-cond");
	const gutil = require("gulp-util");
	const fs = require("fs");
	const fse = require("fs-extra");
	const uglify = require("gulp-uglify");
	const imagemin = require("gulp-imagemin");
	const rename = require("gulp-rename");
	const cssnano = require("cssnano");
	const cache = require("gulp-cache");
	const postcss = require("gulp-postcss");
	const sass = require("gulp-sass");

	const runSequence = require("run-sequence");
	const watchify = require("watchify");
	const buffer = require("vinyl-buffer");
	const source = require("vinyl-source-stream");
	const sourcemaps = require("gulp-sourcemaps");
	const babelify = require("babelify");
	const envify = require("gulp-envify");
	const vueify = require("vueify");
	const eslint = require("gulp-eslint");
	const plumber = require("gulp-plumber");
	const path = require("path");
	const cssnext = require("postcss-cssnext");
	const log = require("fancy-log");
	const colors = require("ansi-colors");
	const cssUglifier = [
		cssnano({
			"zindex": false
		})
	];
	const childProcess = require("child_process");
	const APP_DEPS = ["izitoast", "flatpickr"];
	let currentContext = "";
	let browserifyInstance;
	let modulePath;
	let isProd;
	let isBluemix = argv.bluemix || argv.bx;

	vueify.compiler.applyConfig({
		"postcss": [cssnext()]
	});

	process.env.NODE_ENV = argv.prod ? "production" : "development";
	isProd = process.env.NODE_ENV === "production";
	let methods = {
		"errorHandler": function (module, error, stack) {
			log(colors.red("ERROR FOUND BUILDING THIS ARTIFACT:"), colors.yellow(module));
			log(error);
			log(stack);
			if (isBluemix) {
				let log_url;
				if (isProd) {
					log_url = "https://console.bluemix.net/devops/pipelines/8828557f-bb39-4f96-9d69-2c015ebfabb0?env_id=ibm%3Ayp%3Aus-south";
				} else {
					log_url = "https://console.bluemix.net/devops/pipelines/51d76df7-aed9-4374-8e0c-be1a6c8924df?env_id=ibm%3Ayp%3Aus-south";
				}
				methods.sendSlackMessage({
					"username": "BUILD FAILING",
					"icon_emoji": ":interrobang:",
					"text": [
						"*ENVIRONMENT*: ", process.env.NODE_ENV, "\n",
						error, "\n",
						"Check the <", log_url, "|logs>"
					].join("")
				}).then(function () {
					log("Webhook sent");
					return process.exit(1);
				}).catch(function(error) {
					log(error);
					return process.exit(1);
				});
			} else {
				return process.exit(1);
			}
		},
		"bundleJS": function bundleJS(done = (() => false)) {
			if (isProd) {
				fse.remove(modulePath + "dist/js/bundle.js.map");
			}
			browserifyInstance.bundle()
				.on("error", function (err) {
					log(err);
				})
				.pipe(source(modulePath + "/js/main.js"))
				.pipe(cond(!isProd, plumber()))
				.pipe(buffer())
				.pipe(rename("bundle.js"))
				.pipe(cond(isProd, uglify()))
				.pipe(cond(!isProd, sourcemaps.init({"loadMaps": true})))
				.pipe(cond(!isProd, sourcemaps.write("./")))
				.pipe(gulp.dest(modulePath + "/dist/js/"));

			done();
			return isProd ? log("FINISHED PRODUCTION BUILD") : log("FINISHED DEV BUILD");
		},
		"createFiles": function (files) {
			return files.map(function (file) {
				return new Promise(function (resolve, reject) {
					fse.outputFile(file.path, file.content || "", "utf-8", function (err) {
						if (err) {
							reject(err);
						} else {
							resolve("file saved");
						}
					});
				});
			});
		},
		"setCFManifest": function () {
			return fse.copy(path.join("root", isProd ? "manifest.prod.yml" : "manifest.dev.yml"), "manifest.yml", {
				"overwrite": true
			});
		},
		"htmlTemplate": function (module, title) {
			return [
				"<!DOCTYPE html>",
				`<html lang="en">`,
				"<head>",
				`	<meta charset="UTF-8">`,
				`	<meta name="viewport" content="width=device-width, initial-scale=1">`,
				`	<link rel="manifest" href="/etc/manifest.json">`,
				`	<meta name="theme-color" content="#4A8FCC">`,
				`	<title>${title || module}</title>`,
				`	<link rel="stylesheet" href="./${module}_module/dist/css/style.css">`,
				"</head>",
				"<body>",
				`	<div id="app"></div>`,
				`<noscript>Your browser does not support Script at this time</noscript>`,
				`<script defer src="/etc/service-worker-registration.js"></script>`,
				`<script src="./${module}_module/dist/js/bundle.js"></script>`,
				"</body>",
				"</html>"].join("\n");
		},
		"jsTemplate": function () {
			return [
				"(function () {",
				`	"use strict";`,
				"}());"
			].join("\n");
		}
	};



	gulp.task("load-deps", function(done) {
		Promise.all(APP_DEPS.map((dependecy) => {
			return new Promise((resolve, reject) => {
				const NPM_LIB_PATH = path.join("client/etc/libs", dependecy);
				log(colors.green(`PREPARING TO INSTALL: ${dependecy}`));
				if (fse.pathExistsSync(NPM_LIB_PATH)) {
					fse.copy(
						path.join("node_modules", dependecy),
						NPM_LIB_PATH,
						(err) => {
							if (err) {
								reject(err);
								reject([colors.red("ERR LOADING DEP:"), dependecy].join(" "));
							} else {
								resolve(dependecy);
							}
						}
					);
				} else {
					childProcess.exec(["npm install", dependecy].join(" "), function (error, stdout) {
						log([colors.blue("NPM:"), stdout].join(" "));
						fse.copy(
							path.join("node_modules", dependecy),
							NPM_LIB_PATH,
							(err) => {
								if (err) {
									reject(err);
									reject([colors.red("ERR LOADING DEP:"), dependecy].join(" "));
								} else {
									resolve(dependecy);
								}
							}
						);
					});
				}
			});

		})).then(() => {
			done();
		}).catch((err) => {
			log(err);
		});
	});

	gulp.task("set-manifest", function (done) {
		methods.setCFManifest().then(function () {
			done();
		}).catch(function (error) {
			methods.errorHandler("set-manifest", error, "Check the logs to see where it fails");
		});
	});

	gulp.task("notifyBuildSuccess", function (done) {
		methods.sendSlackMessage({
			"username": "BUILD SUCCESS",
			"text": "ENVIRONMENT: *" + process.env.NODE_ENV + "* finished building and preparing to deploy",
			"icon_emoji": ":cat2:"
		}).then(result => done());
	});

	gulp.task("notifyDeploySuccess", function (done) {
		methods.sendSlackMessage({
			"username": "DEPLOY SUCCESS",
			"text": "ENVIRONMENT: *" + process.env.NODE_ENV + "* finished deploy to Bluemix",
			"icon_emoji": ":bluemix:"
		}).then(result => done());
	});



	gulp.task("lint", function () {
		modulePath = currentContext ? currentContext : ["client" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		return gulp.src([[modulePath, "/js/**/*.js"].join(""), [modulePath, "/js/**/*.vue"].join("")])
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());
	});

	gulp.task("lint:server", function () {
		// modulePath = currentContext ? currentContext : ["client" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		// return gulp.src(["./app.js", "./server/**/*.js"])
		// 	.pipe(eslint())
		// 	.pipe(eslint.format())
		// 	.pipe(eslint.failAfterError())
		// 	.on("error", function (error) {
		// 		methods.errorHandler("lint:server", error, "Check the logs to see where it fails");
		// 	})
		return 
	});


	gulp.task("js", function (done) {
		modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		browserifyInstance = browserify({
			"entries": modulePath + "/js/main.js",
			"noParse": ["vue.js"],
			"plugin": argv.w || argv.watch ? [watchify] : [],
			"cache": {},
			"packageCache": {},
			"debug": !isProd
		}).transform("envify", {
			"global": true,
			"NODE_ENV": process.env.NODE_ENV
		})
			.transform(babelify)
			.transform(vueify)
			.on("update", function () {
				methods.bundleJS(done);
			});

		return methods.bundleJS(done);
	});

	gulp.task("css", function () {
		modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		if (isProd) {
			fse.remove(modulePath + "/dist/css/style.css.map");
		}
		return gulp.src([
			modulePath + "/css/*.css",
			modulePath + "/css/*.scss"
		])
			.pipe(plumber())
			.pipe(postcss([
				cssnext({
				})
			]))
			.pipe(cond(!isProd, sourcemaps.init({"loadMaps": true})))
			.pipe(cache(sass({
				"includePaths": [
					__dirname + '/node_modules/'
				]
			}).on("error", sass.logError)))
			.pipe(cond(isProd, postcss(cssUglifier)))
			.pipe(cond(!isProd, sourcemaps.write("./")))
			.pipe(gulp.dest(modulePath + "/dist/css/"));
	});


	gulp.task("watch-css", function (done) {
		modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		if (argv.w || argv.watch) {
			return gulp.watch([
				modulePath + "/css/*.css",
				modulePath + "/css/*.scss"
			], gulp.parallel("css"));
		} else {
			done();
		}
	});

	gulp.task("build", gulp.parallel("lint", "js", "css", "watch-css"));
	// gulp.task("build-all", gulp.parallel("lint:server", "set-manifest", function iterateOverModules(done) {
	// 	cache.clearAll();
	// 	modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
	// 	fs.readdir("./client", function (err, files) {
	// 		Promise.all(files.map(file => {
	// 			return new Promise((resolve, reject) => {
	// 				let stat = fs.statSync(path.join("client"));
	// 				if (stat.isDirectory() && file.indexOf("_module") > -1) {
	// 					let module = file.split("_")[0];
	// 					childProcess.exec(["gulp build -m", module, isProd ? "--prod" : ""].join(" "), function (error, stdout) {
	// 						log([colors.blue("MODULE:"), module, colors.blue("BUILD TYPE:"), process.env.NODE_ENV].join(" "));
	// 						if (error) {
	// 							log(error);
	// 							reject(methods.errorHandler(module, error, stdout));
	// 						} else {
	// 							log(stdout);
	// 							log(colors.green("Module built successfully"));
	// 							resolve();
	// 						}
	// 					});
	// 				} else {
	// 					resolve();
	// 				}
	// 			});
	// 		}))
	// 			.then(result => done())
	// 			.catch(err => done(err));
	// 	});
	// }));

	gulp.task("build-all", function (done) {
		cache.clearAll();
		modulePath = currentContext ? currentContext : ["client/" + (argv.module || argv.m || currentContext || "main") + "_module"].join();
		fs.readdir("./client", function (err, files) {
			Promise.all(files.map(file => {
				return new Promise((resolve, reject) => {
					let stat = fs.statSync(path.join("client"));
					if (stat.isDirectory() && file.indexOf("_module") > -1) {
						let module = file.split("_")[0];
						childProcess.exec(["gulp build -m", module, isProd ? "--prod" : ""].join(" "), function (error, stdout) {
							log([colors.blue("MODULE:"), module, colors.blue("BUILD TYPE:"), process.env.NODE_ENV].join(" "));
							if (error) {
								log(error);
								reject(methods.errorHandler(module, error, stdout));
							} else {
								log(stdout);
								log(colors.green("Module built successfully"));
								resolve();
							}
						});
					} else {
						resolve();
					}
				});
			}))
				.then(result => done())
				.catch(err => done(err));
		});
	});


	gulp.task("images", function () {
		return gulp.src("public/images/disclaimer/*.+(png|jpg|jpeg|gif|svg)").pipe(cache(imagemin())).pipe(gulp.dest("public/images/disclaimer/dist"));
	});

	gulp.task("create-module", function () {
		let module = argv.m || argv.module;
		let override = argv.o || argv.override;
		if (!module) {
			log("can not proceed without module parameter");
		} else {
			let targetPath = path.join("./client", module + "_module/");
			let cssPath = path.join(targetPath, "css");
			let jsPath = path.join(targetPath, "js");
			let componentPath = path.join(targetPath, "js", "components");

			console.log("AQUIII")
			if (fse.pathExistsSync(targetPath) && !override) {
				log("Module already exists. Run with -o flag to override");
			} else {
				Promise.all(methods.createFiles([{
					"path": path.join(targetPath, "index.html"),
					"content": methods.htmlTemplate(module)
				}, {
					"path": path.join(cssPath, "style.css"),
					"content": ""
				}, {
					"path": path.join(jsPath, "main.js"),
					"content": methods.jsTemplate()
				},  {
					"path": path.join(componentPath, "app.vue"),
					"content": methods.jsTemplate()
				}])).then(function (result) {
					log(result);
				}).catch(function (err) {
					log(err);
				});
			}
		}
	});

	gulp.task("help", function () {
		/*
		 params to doc
		 @ watch, alias w -> #build
		 @ prod -> #env
		 @ bluemix, alias bx -> #generate-sw
		 @ module, alias m -> #build
		 @ override, alias o -> #create-module
		 */

		log(colors.green("Task: build-all"), colors.magenta('#'));
		log(colors.green("Task: build"), colors.magenta('#'));
		log(colors.green("Task: lint"), colors.magenta('#'));
		log(colors.green("Task: lint:server"), colors.magenta('#'));
		log(colors.green("Task: js"), colors.magenta('#'));
		log(colors.green("Task: css"), colors.magenta('#'));
		log(colors.green("Task: generate-sw"), colors.magenta('#'));
		log(colors.green("Task: set-manifest"), colors.magenta('#'));
		log(colors.green("Task: create-module"), colors.magenta('#'));
		log(colors.green("Task: images"), colors.magenta('#'));
		log(colors.green("Task: load-deps"), colors.magenta('#'));

	});

	process.on("exit", function(code) {
		log("About to exit with code:", code);
	});

}());
