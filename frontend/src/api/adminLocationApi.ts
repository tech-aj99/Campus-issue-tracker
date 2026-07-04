import api from './axiosInstance';
import { Building, Floor, Room } from './locationApi';

// ── Admin location management ────────────────────────────────────────────────

export const adminCreateBuilding = async (name: string): Promise<Building> => {
  const { data } = await api.post('/locations/buildings', { name });
  return data.data;
};

export const adminDeleteBuilding = async (id: string): Promise<void> => {
  await api.delete(`/locations/buildings/${id}`);
};

export const adminCreateFloor = async (buildingId: string, number: number): Promise<Floor> => {
  const { data } = await api.post('/locations/floors', { buildingId, number });
  return data.data;
};

export const adminDeleteFloor = async (id: string): Promise<void> => {
  await api.delete(`/locations/floors/${id}`);
};

export const adminCreateRoom = async (floorId: string, number: string): Promise<Room> => {
  const { data } = await api.post('/locations/rooms', { floorId, number });
  return data.data;
};

export const adminDeleteRoom = async (id: string): Promise<void> => {
  await api.delete(`/locations/rooms/${id}`);
};
