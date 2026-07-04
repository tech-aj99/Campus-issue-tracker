import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import * as locationRepo from '../repositories/locationRepository';
import { successResponse } from '../utils/apiResponse';

const router = Router();

router.use(authenticate);

// ── GET routes (all authenticated users — used by student raise-issue form) ──
router.get('/buildings', async (req, res, next) => {
  try {
    const buildings = await locationRepo.getAllBuildings();
    successResponse(res, buildings);
  } catch (err) { next(err); }
});

router.get('/floors/:buildingId', async (req, res, next) => {
  try {
    const floors = await locationRepo.getFloorsByBuilding(req.params.buildingId);
    successResponse(res, floors);
  } catch (err) { next(err); }
});

router.get('/rooms/:floorId', async (req, res, next) => {
  try {
    const rooms = await locationRepo.getRoomsByFloor(req.params.floorId);
    successResponse(res, rooms);
  } catch (err) { next(err); }
});

// ── Admin-only CRUD routes ────────────────────────────────────────────────────

// Buildings
router.post('/buildings', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) { res.status(400).json({ success: false, message: 'Building name is required' }); return; }
    const building = await locationRepo.createBuilding(name.trim());
    successResponse(res, building, 201);
  } catch (err) { next(err); }
});

router.delete('/buildings/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await locationRepo.deleteBuilding(req.params.id);
    successResponse(res, { message: 'Building deleted' });
  } catch (err) { next(err); }
});

// Floors
router.post('/floors', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { buildingId, number } = req.body;
    if (!buildingId || number === undefined) { res.status(400).json({ success: false, message: 'buildingId and number are required' }); return; }
    const floor = await locationRepo.createFloor(buildingId, Number(number));
    successResponse(res, floor, 201);
  } catch (err) { next(err); }
});

router.delete('/floors/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await locationRepo.deleteFloor(req.params.id);
    successResponse(res, { message: 'Floor deleted' });
  } catch (err) { next(err); }
});

// Rooms
router.post('/rooms', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { floorId, number } = req.body;
    if (!floorId || !number?.trim()) { res.status(400).json({ success: false, message: 'floorId and room number are required' }); return; }
    const room = await locationRepo.createRoom(floorId, number.trim());
    successResponse(res, room, 201);
  } catch (err) { next(err); }
});

router.delete('/rooms/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await locationRepo.deleteRoom(req.params.id);
    successResponse(res, { message: 'Room deleted' });
  } catch (err) { next(err); }
});

export default router;
