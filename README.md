JSON database

```mjs
import Database from "@james-bennett-295/json-db";

let db = new Database("./database.json");

db.on("error", (err) => {
	console.error(err);
});

db.on("ready", () => {
	// push
	db.set("users.dave.balance", 362);
	db.add("users.dave.balance", 5);
	db.sub("users.dave.balance", 4, true); // 3rd arg is true so number would not be changed if the change would make the number negative
	let wasSuccessful = db.transfer("users.dave.balance", "users.vera.balance", 3);
	console.log("Vera's balance is £%d", db.get("users.vera.balance"));
	db.push("users.dave.items", "candle");
	db.push("users.dave.items", "torch");
	db.save();
});
```
