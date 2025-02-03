import { RequestHandler } from 'express';
import { SystemStatus, statusHelperSubscription } from '@/core/helper/status';

export const StatusRealTimeHandler: RequestHandler = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    const sendStatus = (status: SystemStatus) => {
        try{
            res.write(`data: ${JSON.stringify(status)}\n\n`);
        } catch (e) {
            console.error(`An error occurred when writing sendStatus data to client: ${e}`);
        }
    };
    statusHelperSubscription.on('statusUpdate', sendStatus);
    req.on('close', () => {
        statusHelperSubscription.off('statusUpdate', sendStatus);
        res.end();
    });
};
