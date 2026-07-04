import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../../api/issueApi';
import { analyzeIssue, analyzeImage } from '../../api/aiApi';
import { getBuildings, getFloors, getRooms, Building, Floor, Room } from '../../api/locationApi';
import { CreateIssuePayload } from '../../types/issue';
import Input from '../common/Input';
import Button from '../common/Button';
import DuplicateWarningModal from './DuplicateWarningModal';
import ImageUploader from './ImageUploader';
import { CATEGORIES, DEPARTMENTS } from '../../utils/constants';

export default function RaiseIssueForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateIssuePayload>();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Store the actual File for multipart upload (not base64)
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [duplicate, setDuplicate] = useState<{
    matchedIssueId: string | null; confidence: number; reason: string;
  } | null>(null);
  const [pendingData, setPendingData] = useState<CreateIssuePayload | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const description = watch('description');

  // Load buildings on mount
  useEffect(() => {
    getBuildings().then(setBuildings).catch(() => {});
  }, []);

  // Load floors when building changes
  useEffect(() => {
    if (!selectedBuilding) { setFloors([]); setRooms([]); return; }
    getFloors(selectedBuilding).then(setFloors).catch(() => {});
  }, [selectedBuilding]);

  // Load rooms when floor changes
  useEffect(() => {
    if (!selectedFloor) { setRooms([]); return; }
    getRooms(selectedFloor).then(setRooms).catch(() => {});
  }, [selectedFloor]);

  // AI autofill on description change (debounced)
  useEffect(() => {
    if (!description || description.length < 20) return;
    const timer = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const result = await analyzeIssue(description);
        if (result.category) setValue('category', result.category);
        if (result.priority) setValue('priority', result.priority);
        if (result.department) setValue('department', result.department);
        if (result.tags?.length) setValue('tags', result.tags);
        toast.success('✨ AI filled in some fields for you', { duration: 2000 });
      } catch { /* silent fail */ }
      finally { setAnalyzing(false); }
    }, 900);
    return () => clearTimeout(timer);
  }, [description, setValue]);

  // Handle image selection — store the File object for upload
  const handleImageSelect = useCallback((file: File, _base64: string) => {
    setImageFile(file);
  }, []);

  // Handle image removal
  const handleImageRemove = useCallback(() => {
    setImageFile(null);
  }, []);

  // Handle AI image analysis — auto-fills form fields
  const handleAnalyzeImage = useCallback(async (file: File) => {
    setAnalyzingImage(true);
    try {
      const result = await analyzeImage(file);
      if (result.category) setValue('category', result.category);
      if (result.priority) setValue('priority', result.priority);
      if (result.department) setValue('department', result.department);
      if (result.tags?.length) setValue('tags', result.tags);
      if (result.descriptionHint && !description) {
        setValue('description', result.descriptionHint);
      }
      toast.success('🖼️ AI analyzed your image and filled the fields!', { duration: 3000 });
    } catch {
      toast.error('Image analysis failed. Try describing the issue manually.');
    } finally {
      setAnalyzingImage(false);
    }
  }, [setValue, description]);

  const onSubmit = async (data: CreateIssuePayload) => {
    setSubmitting(true);
    try {
      const result = await createIssue(data, imageFile);
      if (result?.isDuplicate) {
        setPendingData(data);
        setPendingImageFile(imageFile);
        setDuplicate({ matchedIssueId: result.matchedIssueId, confidence: result.confidence, reason: result.reason });
        setSubmitting(false);
        return;
      }
      toast.success('Issue raised successfully!');
      navigate('/my-issues');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create issue';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForceCreate = async () => {
    if (!pendingData) return;
    setSubmitting(true);
    try {
      await createIssue({ ...pendingData, forceCreate: true }, pendingImageFile);
      toast.success('Issue raised successfully!');
      navigate('/my-issues');
    } catch {
      toast.error('Failed to create issue');
    } finally {
      setSubmitting(false);
      setDuplicate(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
        <Input
          label="Issue Title"
          placeholder="e.g. Broken fan in room 101"
          required
          error={errors.title?.message}
          {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })}
        />

        {/* Image uploader — placed before description for natural flow */}
        <ImageUploader
          onImageSelect={handleImageSelect}
          onRemove={handleImageRemove}
          onAnalyze={handleAnalyzeImage}
          analyzing={analyzingImage}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
            {analyzing && <span className="ml-2 text-xs text-indigo-500 animate-pulse">✨ Analyzing...</span>}
          </label>
          <textarea
            rows={4}
            placeholder="Describe the issue in detail. The more you write, the better AI can categorize it."
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
            {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Please describe the issue in at least 20 characters' } })}
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
        </div>

        {/* Location selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Building <span className="text-red-500">*</span></label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedBuilding}
              onChange={(e) => { setSelectedBuilding(e.target.value); setSelectedFloor(''); }}
            >
              <option value="">Select building</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Floor <span className="text-red-500">*</span></label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              disabled={!selectedBuilding}
            >
              <option value="">Select floor</option>
              {floors.map((f) => <option key={f.id} value={f.id}>Floor {f.number}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Room <span className="text-red-500">*</span></label>
            <select
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.roomId ? 'border-red-400' : 'border-gray-300'}`}
              disabled={!selectedFloor}
              {...register('roomId', { required: 'Please select a room' })}
            >
              <option value="">Select room</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.number}</option>)}
            </select>
            {errors.roomId && <p className="text-xs text-red-500">{errors.roomId.message}</p>}
          </div>
        </div>

        {/* AI-filled fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize" {...register('category')}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" {...register('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Department</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize" {...register('department')}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <Button type="submit" loading={submitting} className="w-full" size="lg">
          Submit Issue
        </Button>
      </form>

      <DuplicateWarningModal
        isOpen={!!duplicate}
        matchedIssueId={duplicate?.matchedIssueId ?? null}
        confidence={duplicate?.confidence ?? 0}
        reason={duplicate?.reason ?? ''}
        onCreateAnyway={handleForceCreate}
        onClose={() => setDuplicate(null)}
      />
    </>
  );
}
