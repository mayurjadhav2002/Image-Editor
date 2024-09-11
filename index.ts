import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import {errorHandler} from "./utils/func";
const IdentityRoutes = require("./routes/Identify");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(errorHandler);



app.get("/", (req: Request, res: Response) => {
	res.send("Hello, World!");
});

app.use("/", IdentityRoutes);


app.listen(port, () => {
	console.log(`🌐 Server is running at http://localhost:${port}`);
});
