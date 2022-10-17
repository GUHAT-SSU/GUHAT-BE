const express = require("express");
const app = express();

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = 8001;

app.set("port", process.env.PORT || PORT);

app.get("/test", (req, res) => {
    res.send("Hello from App Engine!");
});

app.listen(app.get("port"), () => {
    console.log(`Server listening on port ${app.get("port")}...`);
});
