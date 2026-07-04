import api from './axiosInstance';

export interface Building { id: string; name: string; }
export interface Floor { id: string; number: number; buildingId: string; }
export interface Room { id: string; number: string; floorId: string; }

export const getBuildings = async (): Promise<Building[]> => {
  const { data } = await api.get('/locations/buildings');
  return data.data;
};

export const getFloors = async (buildingId: string): Promise<Floor[]> => {
  const { data } = await api.get(`/locations/floors/${buildingId}`);
  return data.data;
};

export const getRooms = async (floorId: string): Promise<Room[]> => {
  const { data } = await api.get(`/locations/rooms/${floorId}`);
  return data.data;
};
