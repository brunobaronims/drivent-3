import { getHotels, getHotelWithRooms } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router();

hotelsRouter
    .all('/*', authenticateToken)
    .get('/', getHotels)
    .get('/:hotelId', getHotelWithRooms)

export { hotelsRouter };