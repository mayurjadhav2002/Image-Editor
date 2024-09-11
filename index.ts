import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req: Request, res: Response) => {
	res.send("Express Server using CommonJS");
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
})
	