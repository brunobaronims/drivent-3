import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from "@/repositories/ticket-repository";
import { paymentRequiredError } from "@/errors/payment-required-error";

async function getHotels(userId: number, ticketId: number) {
    await FindEnrollmentOrThrow(userId);

    await FindTicketWithTypeOrThrow(ticketId);

    const hotels = await hotelRepository.getHotels();

    return hotels;
};

async function getHotelWithRooms(params: GetHotelWithRoomsParams) {
    const {
        userId,
        ticketId,
        hotelId
    } = params;

    await FindEnrollmentOrThrow(userId);

    await FindTicketWithTypeOrThrow(ticketId);

    const hotel = await hotelRepository.getHotelWithRooms(hotelId);
    if (!hotel)
        throw notFoundError();

    return hotel;
}

async function FindEnrollmentOrThrow(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment)
        throw notFoundError();
};

async function FindTicketWithTypeOrThrow(ticketId: number) {
    const ticket = await ticketRepository.findTickeyById(ticketId);
    if (!ticket)
        throw notFoundError();

    const ticketType = await ticketRepository.findTicketTypeById(ticket.ticketTypeId);


    if ((ticket.status !== 'PAID') || (!ticketType.includesHotel))
        throw paymentRequiredError();
}

type GetHotelWithRoomsParams = {
    userId: number,
    ticketId: number,
    hotelId: number
};

const hotelService = {
    getHotels,
    getHotelWithRooms
};

export default hotelService;