import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from "@/repositories/ticket-repository";
import { paymentRequiredError } from "@/errors/payment-required-error";

async function getHotels(userId: number, ticketId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment)
        throw notFoundError();

    const ticket = await ticketRepository.findTickeyById(ticketId);
    if (!ticket) 
        throw notFoundError();
    
    const ticketType = await ticketRepository.findTicketTypeById(ticket.ticketTypeId);
    
    
    if ((ticket.status !== 'PAID') || (!ticketType.includesHotel))
        throw paymentRequiredError();
    
    const hotels = await hotelRepository.getHotels();

    return hotels;
}

const hotelService = {
    getHotels
};

export default hotelService;