import { RequestHandler } from 'express';
import { resolve } from 'path';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const GetLogFileListHandler: RequestHandler = async (req, res) => {
    try {
        const LogsPath = resolve(__dirname, './logs/');
        const LogFiles = await readdir(LogsPath);
        res.json({
            code: 0,
            data: LogFiles
        });
    } catch (error) {
        res.json({ code: -1, msg: 'Failed to retrieve log file list.' });
    }
};

export const GetLogFileHandler: RequestHandler = async (req, res) => {
    const LogsPath = resolve(__dirname, './logs/');
    const LogFile = req.query.file as string;

    // if (!isValidFileName(LogFile)) {
    //   res.json({ code: -1, msg: 'LogFile is not safe' });
    //   return;
    // }

    const filePath = `${LogsPath}/${LogFile}`;
    if (!existsSync(filePath)) {
        res.status(404).json({ code: -1, msg: 'LogFile does not exist' });
        return;
    }

    try {
        const fileStats = await stat(filePath);
        if (!fileStats.isFile()) {
            res.json({ code: -1, msg: 'LogFile must be a file' });
            return;
        }

        res.sendFile(filePath);
    } catch (error) {
        res.json({ code: -1, msg: 'Failed to send log file.' });
    }
};
// export function isValidFileName(fileName: string): boolean {
//   const invalidChars = /[\.\:\*\?\"\<\>\|\/\\]/;
//   return !invalidChars.test(fileName);
// }