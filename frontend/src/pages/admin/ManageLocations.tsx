import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  getBuildings,
  getFloors,
  getRooms,
  Building,
  Floor,
  Room,
} from '../../api/locationApi';
import {
  adminCreateBuilding,
  adminDeleteBuilding,
  adminCreateFloor,
  adminDeleteFloor,
  adminCreateRoom,
  adminDeleteRoom,
} from '../../api/adminLocationApi';

export default function ManageLocations() {
  // ── Buildings ──────────────────────────────────────────────────────────────
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [newBuildingName, setNewBuildingName] = useState('');
  const [buildingLoading, setBuildingLoading] = useState(false);

  // ── Floors ─────────────────────────────────────────────────────────────────
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [floors, setFloors] = useState<Floor[]>([]);
  const [newFloorNumber, setNewFloorNumber] = useState('');
  const [floorLoading, setFloorLoading] = useState(false);

  // ── Rooms ──────────────────────────────────────────────────────────────────
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [roomLoading, setRoomLoading] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadBuildings = () =>
    getBuildings().then(setBuildings).catch(() => toast.error('Failed to load buildings'));

  const loadFloors = (buildingId: string) => {
    setFloors([]);
    setSelectedFloorId('');
    setRooms([]);
    if (!buildingId) return;
    getFloors(buildingId).then(setFloors).catch(() => toast.error('Failed to load floors'));
  };

  const loadRooms = (floorId: string) => {
    setRooms([]);
    if (!floorId) return;
    getRooms(floorId).then(setRooms).catch(() => toast.error('Failed to load rooms'));
  };

  useEffect(() => { loadBuildings(); }, []);
  useEffect(() => { loadFloors(selectedBuildingId); }, [selectedBuildingId]);
  useEffect(() => { loadRooms(selectedFloorId); }, [selectedFloorId]);

  // ── Building handlers ──────────────────────────────────────────────────────
  const handleAddBuilding = async () => {
    if (!newBuildingName.trim()) return;
    setBuildingLoading(true);
    try {
      await adminCreateBuilding(newBuildingName.trim());
      setNewBuildingName('');
      await loadBuildings();
      toast.success('Building added!');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add building';
      toast.error(msg);
    } finally { setBuildingLoading(false); }
  };

  const handleDeleteBuilding = async (id: string) => {
    if (!confirm('Delete this building and all its floors & rooms?')) return;
    try {
      await adminDeleteBuilding(id);
      if (selectedBuildingId === id) setSelectedBuildingId('');
      await loadBuildings();
      toast.success('Building deleted');
    } catch { toast.error('Failed to delete building (it may have linked issues)'); }
  };

  // ── Floor handlers ─────────────────────────────────────────────────────────
  const handleAddFloor = async () => {
    if (!selectedBuildingId || !newFloorNumber) return;
    setFloorLoading(true);
    try {
      await adminCreateFloor(selectedBuildingId, Number(newFloorNumber));
      setNewFloorNumber('');
      await loadFloors(selectedBuildingId);
      toast.success('Floor added!');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add floor';
      toast.error(msg);
    } finally { setFloorLoading(false); }
  };

  const handleDeleteFloor = async (id: string) => {
    if (!confirm('Delete this floor and all its rooms?')) return;
    try {
      await adminDeleteFloor(id);
      if (selectedFloorId === id) setSelectedFloorId('');
      await loadFloors(selectedBuildingId);
      toast.success('Floor deleted');
    } catch { toast.error('Failed to delete floor (it may have linked issues)'); }
  };

  // ── Room handlers ──────────────────────────────────────────────────────────
  const handleAddRoom = async () => {
    if (!selectedFloorId || !newRoomNumber.trim()) return;
    setRoomLoading(true);
    try {
      await adminCreateRoom(selectedFloorId, newRoomNumber.trim());
      setNewRoomNumber('');
      await loadRooms(selectedFloorId);
      toast.success('Room added!');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add room';
      toast.error(msg);
    } finally { setRoomLoading(false); }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Delete this room?')) return;
    try {
      await adminDeleteRoom(id);
      await loadRooms(selectedFloorId);
      toast.success('Room deleted');
    } catch { toast.error('Failed to delete room (it may have linked issues)'); }
  };

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const selectedFloor = floors.find((f) => f.id === selectedFloorId);

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add or remove buildings, floors, and rooms. Students will see only locations you create here.
          </p>
        </div>

        {/* ── Section 1: Buildings ─────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">🏢 Buildings</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Add building */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Main Block"
                value={newBuildingName}
                onChange={(e) => setNewBuildingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBuilding()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddBuilding}
                disabled={buildingLoading || !newBuildingName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {buildingLoading ? 'Adding…' : '+ Add'}
              </button>
            </div>

            {/* Building list */}
            {buildings.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No buildings yet. Add one above.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {buildings.map((b) => (
                  <li
                    key={b.id}
                    onClick={() => setSelectedBuildingId(b.id === selectedBuildingId ? '' : b.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedBuildingId === b.id
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm text-gray-800 font-medium">{b.name}</span>
                    <div className="flex items-center gap-2">
                      {selectedBuildingId === b.id && (
                        <span className="text-xs text-indigo-500 font-medium">Selected ✓</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteBuilding(b.id); }}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Section 2: Floors ────────────────────────────────────────────── */}
        <section className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-opacity ${!selectedBuildingId ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">
              🏠 Floors
              {selectedBuilding && <span className="text-gray-400 font-normal ml-2">— {selectedBuilding.name}</span>}
            </h2>
            {!selectedBuildingId && <p className="text-xs text-gray-400 mt-0.5">Select a building above to manage floors</p>}
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Floor number (e.g. 1)"
                min={0}
                value={newFloorNumber}
                onChange={(e) => setNewFloorNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFloor()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddFloor}
                disabled={floorLoading || !newFloorNumber || !selectedBuildingId}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {floorLoading ? 'Adding…' : '+ Add'}
              </button>
            </div>

            {floors.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No floors yet for this building.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {floors.map((f) => (
                  <li
                    key={f.id}
                    onClick={() => setSelectedFloorId(f.id === selectedFloorId ? '' : f.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedFloorId === f.id
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm text-gray-800 font-medium">Floor {f.number}</span>
                    <div className="flex items-center gap-2">
                      {selectedFloorId === f.id && (
                        <span className="text-xs text-indigo-500 font-medium">Selected ✓</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFloor(f.id); }}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Section 3: Rooms ─────────────────────────────────────────────── */}
        <section className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-opacity ${!selectedFloorId ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">
              🚪 Rooms
              {selectedFloor && selectedBuilding && (
                <span className="text-gray-400 font-normal ml-2">
                  — {selectedBuilding.name} / Floor {selectedFloor.number}
                </span>
              )}
            </h2>
            {!selectedFloorId && <p className="text-xs text-gray-400 mt-0.5">Select a floor above to manage rooms</p>}
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room number (e.g. 101, Lab-1)"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddRoom}
                disabled={roomLoading || !newRoomNumber.trim() || !selectedFloorId}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {roomLoading ? 'Adding…' : '+ Add'}
              </button>
            </div>

            {rooms.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No rooms yet for this floor.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {rooms.map((r) => (
                  <li key={r.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-sm text-gray-800 font-medium">Room {r.number}</span>
                    <button
                      onClick={() => handleDeleteRoom(r.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
