import type { RequestStatus } from "./status";
import type { FieldErrors } from "./validate";

export type DataSource = "mongodb" | "demo";

export type RequestRecord = {
  code: string;
  tripId: string;
  route: string;
  when: string;
  name: string;
  cargo: string;
  /** ISO */
  createdAt: string;
  /** Tizimga kirgan yuk egasining logini (bo‘lsa) */
  owner?: string;
  /** Qo‘lda o‘rnatilgan holat (transport egasi / admin / bekor qilish) */
  status?: RequestStatus;
  updatedAt?: string;
};

/** Barcha API javoblari uchun yagona format. */
export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; message: string; errors?: FieldErrors };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
