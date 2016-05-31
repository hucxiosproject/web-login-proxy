import qr from "qr-image";
import fs from "fs";
import md5 from "md5";
import _ from "lodash";

export class Service {
	constructor(qrUrl, log) {
		this._log = log;
		this._qrurl = qrUrl;

		this._people = {};
		this._sockets = {};
		this._log.info("service instantiated");
	}

	setIo(io) {
		this._io = io;
	}

	getRandomQRImage() {
		return this._getQRImage(this._getRandom());
	}

	getQRImage(info) {
		return this._getQRImage(info);
	}

	_getQRImage(info) {
		var img = qr.imageSync(info);
		return {
			mimeType: 'png',
			body: img
		};
	}

	_getRandom() {
		var random = Math.random() * 100000000;
		return md5(random + new Date().getTime());
	}

	listen() {
		this._io.sockets.on('connection', socket => {
			// console.log(socket);
			socket.on('connected', () => {
				var id = this._getRandom();
				var info = this._qrurl + "/" + id;
				socket.qrid = id;
				this._people[id] = socket;
				this._sockets[socket.id] = socket;

				socket.emit('qrimage', info);
			}.bind(this));

			socket.on('disconnect', () => {
				var qrid = socket.qrid;
				delete this._people[qrid];
				delete this._sockets[socket.id];
			}.bind(this));
		}.bind(this));
	}

	sendToken(token, qrid) {
		var socketId = this._people[qrid];
		if (!socketId) {
			throw {
				status: 401,
				body: 'user not found'
			};
		}
			
		var socket = this._sockets[socketId];
		if (!socket) {
			throw {
				status: 401,
				body: 'user not found'
			};
		}
			
		socket.emit('login', token);
		return true;
	}
}