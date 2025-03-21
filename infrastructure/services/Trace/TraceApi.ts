import { BackendPaths } from '@/enums/Paths';
import { backendClient } from '@/infrastructure/clients';
import { Trace } from '@/types';

type GetTraceListResponse = Trace & { preset: { name: string } };

export const TraceApi = {
  createTrace: async (preset: Trace) => backendClient.post<Trace>(BackendPaths.TracesCreate, preset),
  getTraceList: async () => backendClient.get<GetTraceListResponse[]>(BackendPaths.Traces),
};
