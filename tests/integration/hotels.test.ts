import supertest from "supertest";

import app, { init } from "@/app";
import {
    cleanDb,
    getWithNoToken,
    getWithInvalidToken,
    getNonExistentSession,
    getNonExistentEnrollment,
    getNonExistentTicket,
    getNonExistentHotel,
    getWithUnpaidTicket,
    getWithoutHotelIncluded,
    getHotels
} from "../helpers";

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
    it('should respond with status 401 if no token is given', () => getWithNoToken(server, '/hotels'));
    it('should respond with status 401 if given token is not valid', () => getWithInvalidToken(server, '/hotels'));
    it('should respond with status 401 if there is no session for given token', async () => getNonExistentSession(server, '/hotels'));

    describe('when token is valid', () => {
        it('should respond with status 404 when enrollment does not exist', async () => getNonExistentEnrollment(server, '/hotels'));
        it('should respond with status 404 when ticket does not exist', async () => getNonExistentTicket(server, '/hotels'));
        it('should respond with status 402 when ticket is not paid', async () => getWithUnpaidTicket(server, '/hotels'));
        it('should respond with status 402 when ticket does not include hotel', async () => getWithoutHotelIncluded(server, '/hotels'));

        it('should respond with status 200 and hotels', async () => getHotels(server, '/hotels'));
    });
});