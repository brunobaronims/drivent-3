import faker from "@faker-js/faker";
import { prisma } from "@/config";

export function createHotel() {
    return prisma.hotel.create({
        data: {
            name: faker.company.companyName(),
            image: faker.image.abstract()
        }
    });
};

export function createRoom(hotelId: number) {
    return prisma.room.create({
        data: {
            name: faker.name.findName(),
            capacity: faker.datatype.number(),
            hotelId: hotelId
        }
    });
};