// import { z } from "zod";
// import dateFormat from "dateformat";
// import { createTRPCRouter, adminProcedure } from "../trpc";
// import type { Prisma } from "@prisma/client";

// export const adminRouter = createTRPCRouter({
//   getReports: adminProcedure
//     .input(
//       z.object({
//         page: z.number(),
//         limit: z.number().min(1).max(100).nullish(),
//         showResolved: z.boolean().optional(),
//         sortOption: z.string().optional(),
//       })
//     )
//     .query(async ({ ctx, input: { page, limit, sortOption = "asc" } }) => {
//       const pageLimit = limit ?? 25;

//       const reportsInDb = await ctx.prisma.report.findMany({
//         orderBy: {
//           createdAt: sortOption as Prisma.SortOrder,
//         },
//         take: pageLimit,
//         skip: (page - 1) * pageLimit,
//       });

//       const reportsCount = await ctx.prisma.report.count();

//       return {
//         pages: Math.ceil(reportsCount / pageLimit),
//         reports: reportsInDb.map((r) => ({
//           id: r.id,
//           postId: r.postId,
//           createdAt: dateFormat(r.createdAt, "dd/mm/yyyy, HH:MM:ss"),
//           reason: r.reason,
//         })),
//       };
//     }),
//   getReportedPost: adminProcedure
//     .input(
//       z.object({
//         reportId: z.string(),
//       })
//     )
//     .query(async ({ ctx, input: { reportId } }) => {
//       const reportInDb = await ctx.prisma.report.findUniqueOrThrow({
//         where: {
//           id: reportId,
//         },
//         include: { post: true },
//       });

//       return {
//         report: {
//           id: reportInDb.id,
//           reason: reportInDb.reason,
//         },
//         post: {
//           id: reportInDb.post.id,
//           content: reportInDb.post.content,
//           extendedContent: reportInDb.post.extendedContent,
//         },
//       };
//     }),
//   reviewReport: adminProcedure
//     .input(
//       z.object({
//         shouldPostBeRemoved: z.boolean(),
//         reportId: z.string(),
//       })
//     )
//     .mutation(async ({ ctx, input: { shouldPostBeRemoved, reportId } }) => {
//       const reportInDb = await ctx.prisma.report.findUniqueOrThrow({
//         where: { id: reportId },
//       });

//       if (shouldPostBeRemoved) {
//         await ctx.prisma.report.delete({
//           where: {
//             id: reportInDb.id,
//           },
//         });

//         await ctx.prisma.post.delete({
//           where: {
//             id: reportInDb.postId,
//           },
//         });
//       } else {
//         await ctx.prisma.report.delete({
//           where: {
//             id: reportInDb.id,
//           },
//         });
//       }
//     }),
//   getUsers: adminProcedure
//     .input(
//       z.object({
//         page: z.number(),
//         limit: z.number().min(1).max(100).nullish(),
//         sortOption: z.string().optional(),
//       })
//     )
//     .query(async ({ ctx, input: { page, limit, sortOption = "usr-asc" } }) => {
//       const pageLimit = limit ?? 25;
//       const usersCount = await ctx.prisma.user.count();

//       let orderBy;

//       switch (sortOption) {
//         case "usr-asc":
//           orderBy = {
//             username: "asc" as Prisma.SortOrder,
//           };
//           break;
//         case "usr-des":
//           orderBy = {
//             username: "desc" as Prisma.SortOrder,
//           };
//           break;
//         case "dsp-asc":
//           orderBy = {
//             displayName: "asc" as Prisma.SortOrder,
//           };
//           break;
//         case "dsp-des":
//           orderBy = {
//             displayName: "desc" as Prisma.SortOrder,
//           };
//           break;
//         case "rol-asc":
//           orderBy = {
//             role: "asc" as Prisma.SortOrder,
//           };
//           break;
//         case "rol-des":
//           orderBy = {
//             role: "desc" as Prisma.SortOrder,
//           };
//           break;
//         case "flw-asc":
//           orderBy = {
//             followedBy: {
//               _count: "asc" as Prisma.SortOrder,
//             },
//           };
//           break;
//         case "flw-des":
//           orderBy = {
//             followedBy: {
//               _count: "desc" as Prisma.SortOrder,
//             },
//           };
//           break;
//         case "jdt-asc":
//           orderBy = {
//             joinedAt: "asc" as Prisma.SortOrder,
//           };
//           break;
//         case "jdt-des":
//           orderBy = {
//             joinedAt: "desc" as Prisma.SortOrder,
//           };
//           break;
//         case "bdu-asc":
//           orderBy = {
//             bannedUntil: "asc" as Prisma.SortOrder,
//           };
//           break;
//         case "bdu-des":
//           orderBy = {
//             bannedUntil: "desc" as Prisma.SortOrder,
//           };
//           break;
//       }

//       const usersInDb = await ctx.prisma.user.findMany({
//         orderBy,
//         include: {
//           _count: {
//             select: {
//               followedBy: true,
//             },
//           },
//         },
//         take: pageLimit,
//         skip: (page - 1) * pageLimit,
//       });

//       return {
//         pages: Math.ceil(usersCount / pageLimit),
//         users: usersInDb.map((r) => ({
//           id: r.id,
//           username: r.username ?? "",
//           displayName: r.displayName ?? "",
//           role: r.role,
//           followers: r._count.followedBy,
//           joinedAt: dateFormat(r.joinedAt, "dd/mm/yyyy, HH:MM:ss"),
//           bannedUntil: r.bannedUntil
//             ? dateFormat(r.bannedUntil, "dd/mm/yyyy, HH:MM:ss")
//             : "",
//           email: r.email ?? "",
//         })),
//       };
//     }),
//   resetUserData: adminProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//         resetUsername: z.boolean(),
//         resetDisplayName: z.boolean(),
//         resetBio: z.boolean(),
//         removeAllPosts: z.boolean(),
//         resetPicture: z.boolean(),
//       })
//     )
//     .mutation(
//       async ({
//         ctx,
//         input: {
//           userId,
//           resetBio,
//           resetDisplayName,
//           resetUsername,
//           removeAllPosts,
//           resetPicture,
//         },
//       }) => {
//         if (resetBio) {
//           await ctx.prisma.user.update({
//             where: { id: userId },
//             data: { bio: null },
//           });
//         }

//         if (resetDisplayName) {
//           await ctx.prisma.user.update({
//             where: { id: userId },
//             data: { displayName: null },
//           });
//         }

//         if (resetUsername) {
//           await ctx.prisma.user.update({
//             where: { id: userId },
//             data: { username: null },
//           });
//         }

//         if (resetPicture) {
//           await ctx.prisma.user.update({
//             where: { id: userId },
//             data: { avatar: "/defaultUserImage.webp" },
//           });
//         }

//         if (removeAllPosts) {
//           await ctx.prisma.post.deleteMany({
//             where: {
//               userId: userId,
//             },
//           });
//         }
//       }
//     ),
//   removeUser: adminProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//       })
//     )
//     .mutation(async ({ ctx, input: { userId } }) => {
//       await ctx.prisma.user.delete({ where: { id: userId } });
//     }),
//   updateBanTime: adminProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//         newBanTime: z.date(),
//       })
//     )
//     .mutation(async ({ ctx, input: { userId, newBanTime } }) => {
//       await ctx.prisma.user.update({
//         where: { id: userId },
//         data: { bannedUntil: newBanTime },
//       });
//     }),
//   updateRole: adminProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//         role: z.string(),
//       })
//     )
//     .mutation(async ({ ctx, input: { userId, role } }) => {
//       await ctx.prisma.user.update({
//         where: { id: userId },
//         data: { role: role },
//       });
//     }),
//   getUserData: adminProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//       })
//     )
//     .query(async ({ ctx, input: { userId } }) => {
//       const userInDb = await ctx.prisma.user.findUniqueOrThrow({
//         where: {
//           id: userId,
//         },
//       });
//       const currentDate = new Date();

//       return {
//         banTime:
//           userInDb.bannedUntil && userInDb.bannedUntil > currentDate
//             ? userInDb.bannedUntil
//             : undefined,
//         role: userInDb.role,
//       };
//     }),
// });
