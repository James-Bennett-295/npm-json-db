import EventEmitter from "node:events";
import fs from "node:fs";
import writeFile from "@james-bennett-295/writefile";

function getPointer(obj, prop) {
	let pointer = obj;
	for (let i = 0; i < prop.length; i++) {
		if (typeof pointer[prop[i]] === "undefined") pointer[prop[i]] = {}
		pointer = pointer[prop[i]];
	}
	return pointer;
}

class Database extends EventEmitter {

	constructor(filename) {
		super();
		this.filename = filename;
		this.data = {}
		if (fs.existsSync(this.filename)) {
			fs.readFile(this.filename, "utf8", (err, json) => {
				if (err !== null) this.emit("error", err);
				try {
					Object.assign(this.data, JSON.parse(json));
					this.emit("ready");
				} catch (err) {
					this.emit("error", err);
				}
			});
		} else {
			writeFile(this.filename, "{}")
				.then(() => {
					this.emit("ready");
				})
				.catch((err) => {
					this.emit("error", err);
				});
		}
	}
	save() {
		let promise = new Promise((resolve, reject) => {

			writeFile(this.filename, JSON.stringify(this.data))
				.then(() => {
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
		return promise;
	}
	set(propStr, val) {
		let pointerProp = propStr.split('.');
		let propFinal = pointerProp.pop();
		let pointer = getPointer(this.data, pointerProp);
		pointer[propFinal] = val;
	}
	get(propStr) {
		try {
			let pointer = getPointer(this.data, propStr.split('.'));
			return pointer;
		} catch (err) {
			this.emit("error", err);
		}
	}
	push(propStr, item) {
		let property = this.get(propStr);
		if (property.constructor === Array) {
			property.push(item);
			this.set(propStr, property);
		} else {
			this.set(propStr, [item]);
		}
	}
	add(propStr, num) {
		let property = this.get(propStr);
		if (typeof property === "number") {
			this.set(propStr, property + num);
		} else {
			this.set(propStr, num);
		}
	}
	sub(propStr, num, noNeg) {
		let property = this.get(propStr);
		if (typeof property === "number") {
			if (noNeg && property - num < 0) return false;
			this.set(propStr, property - num);
			return true;
		} else {
			this.set(propStr, 0);
			return false;
		}
	}
	transfer(fromPropStr, toPropStr, num) {
		let success = this.sub(fromPropStr, num, true);
		if (!success) return false;
		this.add(toPropStr, num);
		return true;
	}
}

export default Database;
