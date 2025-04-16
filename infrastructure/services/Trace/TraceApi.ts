import { BackendPaths } from '@/enums/Paths';
import { backendClient } from '@/infrastructure/clients';
import { Trace } from '@/types';

type GetTraceListResponse = Trace & { preset: { name: string } };

type GetTraceByIdResponse = Trace & { preset: { name: string } };

export const TraceApi = {
  createTrace: async (preset: FormData) =>
    backendClient.post<Trace>(BackendPaths.TracesCreate, preset, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withAuth: true,
    }),
  getTraceList: async () => backendClient.get<GetTraceListResponse[]>(BackendPaths.Traces),
  getTraceById: async (id: number | string) => backendClient.get<GetTraceByIdResponse>(BackendPaths.TraceById(id)),
};
