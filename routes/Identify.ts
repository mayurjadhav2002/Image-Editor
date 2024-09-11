import express, {Request, Response} from "express";
import bodyParser from "body-parser";

const routes = express();
routes.use(bodyParser.json());
routes.use(bodyParser.urlencoded({extended: true}));

const {FindContact} = require("../controller/IdentityController");

routes.post("/identify", FindContact);

module.exports = routes;
