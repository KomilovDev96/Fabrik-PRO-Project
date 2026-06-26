import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/shared/api'
import type { ID } from '@/shared/types'
import { attendanceApi } from './attendanceApi'
import type { Attendance, AttendanceListParams, CreateAttendanceDto, UpdateAttendanceDto } from '../model/types'

export const attendanceKeys = {
  all: ['attendances'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (p: AttendanceListParams) => [...attendanceKeys.lists(), p] as const,
  detail: (id: ID) => [...attendanceKeys.all, 'detail', id] as const,
}

export function useAttendances(params: AttendanceListParams) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.list(params),
    placeholderData: keepPreviousData,
  })
}
export function useAttendance(id: ID | undefined) {
  return useQuery({
    queryKey: attendanceKeys.detail(id ?? 0),
    queryFn: () => attendanceApi.getById(id as ID),
    enabled: id != null,
  })
}
export function useCreateAttendance() {
  const qc = useQueryClient()
  return useMutation<Attendance, ApiError, CreateAttendanceDto>({
    mutationFn: (dto) => attendanceApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.lists() }),
  })
}
export function useUpdateAttendance() {
  const qc = useQueryClient()
  return useMutation<Attendance, ApiError, { id: ID; dto: UpdateAttendanceDto }>({
    mutationFn: ({ id, dto }) => attendanceApi.update(id, dto),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: attendanceKeys.lists() })
      void qc.invalidateQueries({ queryKey: attendanceKeys.detail(id) })
    },
  })
}
export function useDeleteAttendance() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID>({
    mutationFn: (id) => attendanceApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.lists() }),
  })
}
export function useDeleteAttendances() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, ID[]>({
    mutationFn: (ids) => attendanceApi.removeMany(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.lists() }),
  })
}
