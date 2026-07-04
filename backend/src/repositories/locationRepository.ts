import prisma from '../config/db';

// ── Read (used by student raise-issue form) ──────────────────────────────────
export const getAllBuildings = () =>
  prisma.building.findMany({ orderBy: { name: 'asc' } });

export const getFloorsByBuilding = (buildingId: string) =>
  prisma.floor.findMany({
    where: { buildingId },
    orderBy: { number: 'asc' },
  });

export const getRoomsByFloor = (floorId: string) =>
  prisma.room.findMany({
    where: { floorId },
    orderBy: { number: 'asc' },
  });

// ── Buildings CRUD (admin) ────────────────────────────────────────────────────
export const createBuilding = (name: string) =>
  prisma.building.create({ data: { name } });

export const deleteBuilding = (id: string) =>
  prisma.building.delete({ where: { id } });

// ── Floors CRUD (admin) ───────────────────────────────────────────────────────
export const createFloor = (buildingId: string, number: number) =>
  prisma.floor.create({ data: { buildingId, number } });

export const deleteFloor = (id: string) =>
  prisma.floor.delete({ where: { id } });

// ── Rooms CRUD (admin) ────────────────────────────────────────────────────────
export const createRoom = (floorId: string, number: string) =>
  prisma.room.create({ data: { floorId, number } });

export const deleteRoom = (id: string) =>
  prisma.room.delete({ where: { id } });
