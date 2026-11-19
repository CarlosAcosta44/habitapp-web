"use server";
import { revalidatePath } from "next/cache";
import { adminService } from "@/services/admin.service";

export async function getUsersAction(page: number = 1, limit: number = 10) {
  return await adminService.getUsers(page, limit);
}

export async function updateUserRoleAction(userId: string, newRole: string) {
  const result = await adminService.updateUserRole(userId, newRole);
  if (result.success) {
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin");
  }
  return result;
}

export async function updateUserStatusAction(userId: string, newStatus: string) {
  const result = await adminService.updateUserStatus(userId, newStatus);
  if (result.success) {
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin");
  }
  return result;
}

export async function deleteForumAction(forumId: string) {
  return await adminService.deleteForum(forumId);
}

export async function deleteForumCommentAction(commentId: string) {
  return await adminService.deleteForumComment(commentId);
}
