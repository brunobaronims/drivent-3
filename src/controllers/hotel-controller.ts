import { Response } from "express";

import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotel-service";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { ticketId } = req.query;

    try {
        const hotels = await hotelService.getHotels(userId, Number(ticketId));

        return res.status(httpStatus.OK).send(hotels);
    } catch (e) {
        if (e.name === 'PaymentRequiredError')
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        return res.sendStatus(httpStatus.NOT_FOUND);
    };
};