import http from 'http';
import socketio from "socket.io";
import koa from "koa";
var app = koa();

import bodyParser from "koa-bodyparser";
app.use(bodyParser());

app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
});

import bunyan from "bunyan";
var log = bunyan.createLogger({name: "web-login-proxy"});
app.on('error', function(err){
  log.error(err);
});

import {Service} from "./service";
var service = new Service("http://" + process.env.VIRTUAL_HOST + ":" + process.env.WEB_PORT + "/qrimage", log);

import {Controller} from "./controller";
var controller = Controller(service);

import router from "koa-router";
var r = new router();
r.get("/qrimage", controller.getRandomQRImage);
r.get("/qrimage/:id", controller.getQRImage);
r.post("/confirmLogin", controller.confirmLogin);
app.use(r.middleware());

import cors from "koa-cors";
app.use(cors());

app.listen(5000);

// socket
var server = http.createServer(app.callback());
var io = socketio(server);
server.listen(3000);

service.setIo(io);
service.listen();

log.info("app listen 5000");
