export function Controller(service) {
	return {
		* getRandomQRImage(next) {
			var img = service.getRandomQRImage();
			this.type = img.mimeType;
			this.status = 200;
      this.body = img.body;
		},

		* getQRImage(next) {
			var id = String(this.params.id);
			var img = service.getQRImage(id);
			this.type = img.mimeType;
			this.status = 200;
      this.body = img.body;
		},

		* confirmLogin(next) {
			var token = this.body.token;
			var qrid = this.body.qrid;
			this.body = service.sendToken(token, qrid);
			this.type = "json";
			this.status = 200; 
		}
	};
}