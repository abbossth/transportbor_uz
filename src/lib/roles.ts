import type { Role } from "./auth-types";

export const ROLE_SLUGS: Record<string, Role> = { "yuk-egasi": "shipper", "transport-egasi": "carrier", admin: "admin" };
export const ROLE_SLUG: Record<Role, string> = { shipper: "yuk-egasi", carrier: "transport-egasi", admin: "admin" };
export const ROLE_INFO: Record<Role, { title: string; text: string }> = {
  shipper: { title: "Yuk egasi", text: "Yuk jo‘natish, so‘rovlarni va yuk holatini kuzatish" },
  carrier: { title: "Transport egasi", text: "Qatnovlaringizga kelgan yuklarni ko‘rish va boshqarish" },
  admin: { title: "Admin", text: "Platforma statistikasi, barcha so‘rovlar va foydalanuvchilar" },
};
