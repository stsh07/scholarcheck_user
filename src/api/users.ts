import { apiFetch } from "./http";

export type UserProfile = {
  id?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  middleName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  address?: string;
  memberSince?: string | null;
  profileImage?: string;
};

export type UpdateUserProfilePayload = {
  fullName?: string;
  email?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
};

export type UpdateUserProfileResponse = {
  message: string;
  profileImage?: string;
  data?: {
    fullName?: string;
    email?: string;
    dob?: string;
    gender?: string;
    phone?: string;
    address?: string;
    profileImage?: string;
  };
};

export async function getUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/users/profile", { method: "GET" });
}

export async function updateUserProfile(
  data: UpdateUserProfilePayload,
  profileImageFile?: File | null
): Promise<UpdateUserProfileResponse> {
  const formData = new FormData();

  if (data.fullName !== undefined) formData.append("fullName", data.fullName);
  if (data.email !== undefined) formData.append("email", data.email);
  if (data.dob !== undefined) formData.append("dob", data.dob);
  if (data.gender !== undefined) formData.append("gender", data.gender);
  if (data.phone !== undefined) formData.append("phone", data.phone);
  if (data.address !== undefined) formData.append("address", data.address);

  if (profileImageFile) {
    formData.append("profileImage", profileImageFile);
  }

  return apiFetch<UpdateUserProfileResponse>("/api/users/profile", {
    method: "PATCH",
    body: formData,
  });
}