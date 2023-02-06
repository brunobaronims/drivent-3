import * as jwt from "jsonwebtoken";
import { TicketStatus, User } from "@prisma/client";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";

import {
  createEnrollmentWithAddress,
  createHotel,
  createTicket,
  createTicketType,
  createUser
} from "./factories";
import { createSession } from "./factories/sessions-factory";
import { prisma } from "@/config";

export async function cleanDb() {
  await prisma.address.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.hotel.deleteMany({});
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ userId: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
};

export async function getWithNoToken(server: supertest.SuperTest<supertest.Test>, route: string) {
  const response = await server.get(`${route}`);

  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
};

export async function getWithInvalidToken(server: supertest.SuperTest<supertest.Test>, route: string) {
  const token = faker.lorem.word();

  const response = await server.get(`${route}`).set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
};

export async function getNonExistentSession(server: supertest.SuperTest<supertest.Test>, route: string) {
  const user = await createUser();
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

  const response = await server.get(`${route}`).set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
};

export async function getNonExistentEnrollment(server: supertest.SuperTest<supertest.Test>, route: string) {
  const user = await createUser();
  const token = await generateValidToken(user);

  const response = await server.get(`${route}`).set('Authorization', `Bearer ${token}`);
  expect(response.status).toEqual(httpStatus.NOT_FOUND);
};

export async function getNonExistentTicket(server: supertest.SuperTest<supertest.Test>, route: string) {
  const user = await createUser();
  const token = await generateValidToken(user);
  await createEnrollmentWithAddress(user);

  const response = await server.get(`${route}?ticketId=1`).set("Authorization", `Bearer ${token}`);
  expect(response.status).toEqual(httpStatus.NOT_FOUND);
};

export async function getNonExistentHotel(server: supertest.SuperTest<supertest.Test>, route: string) {

};

export async function getWithUnpaidTicket(server: supertest.SuperTest<supertest.Test>, route: string) {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketType(true, false);
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

  const response = await server.get(`${route}?ticketId=${ticket.id}`).set('Authorization', `Bearer ${token}`);
  expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
};

export async function getWithoutHotelIncluded(server: supertest.SuperTest<supertest.Test>, route: string) {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketType(false, false);
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

  const response = await server.get(`${route}?ticketId=${ticket.id}`).set('Authorization', `Bearer ${token}`);
  expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
};

export async function getHotels(server: supertest.SuperTest<supertest.Test>, route: string) {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketType(true, false);
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const hotel = await createHotel();

  const response = await server.get(`${route}?ticketId=${ticket.id}`).set('Authorization', `Bearer ${token}`);
  expect(response.status).toBe(httpStatus.OK);
  expect(response.body).toEqual([
    {
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    }
  ]);
}