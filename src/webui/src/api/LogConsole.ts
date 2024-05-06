import { RequestHandler } from "express";
import { resolve } from "path";

export const GetLogHandler: RequestHandler = (req, res) => {
    //res.sendFile(resolve(__dirname, "../../../logs/napcat.log"));
};
