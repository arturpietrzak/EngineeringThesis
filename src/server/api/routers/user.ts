import { TRPCError } from "@trpc/server";
import moment from "moment";
import { env } from "process";
import { z } from "zod";
import { errorMessages } from "~/utils/errorMessages";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

// TODO: Add notifications
export const userRouter = createTRPCRouter({
  follow: protectedProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { username } }) => {
      const userInDb = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          username: username,
        },
      });

      const followsInDb = await ctx.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: userInDb.id,
          },
        },
      });

      if (followsInDb !== null || userInDb.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errorMessages.BAD_REQUEST,
        });
      }

      return await ctx.prisma.follows.create({
        data: {
          followerId: ctx.session.user.id,
          followingId: userInDb.id,
        },
      });
    }),
  unfollow: protectedProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { username } }) => {
      const userInDb = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          username: username,
        },
      });

      const followsInDb = await ctx.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: userInDb.id,
          },
        },
      });

      if (followsInDb === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errorMessages.BAD_REQUEST,
        });
      }

      return await ctx.prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: userInDb.id,
          },
        },
      });
    }),
  getUser: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        username: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 25;
      const { cursor } = input;

      const postsInDb = await ctx.prisma.post.findMany({
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          user: {
            username: input.username,
          },
        },
        include: {
          postLikes: {
            where: {
              user: {
                id: ctx.session?.user.id,
              },
            },
          },
          user: true,
          _count: {
            select: {
              comments: true,
              postLikes: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (postsInDb.length > limit) {
        const nextItem = postsInDb.pop();
        nextCursor = nextItem?.id;
      }

      const userInDb = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          username: input.username,
        },
        include: {
          _count: {
            select: {
              posts: true,
              followedBy: true,
              following: true,
            },
          },
        },
      });

      const followInDb = await ctx.prisma.follows.findFirst({
        where: {
          followerId: ctx.session?.user.id,
          following: {
            username: input.username,
          },
        },
      });

      return {
        nextCursor: nextCursor,
        user: {
          username: userInDb.username ?? "",
          bio: userInDb.bio ?? undefined,
          imageUrl: userInDb.avatar,
          displayName: userInDb.displayName ?? "",
          joinedAt: moment(userInDb.joinedAt).format("LL"),
          followers: userInDb._count.followedBy,
          following: userInDb._count.following,
          posts: userInDb._count.posts,
          isUserFollowing: followInDb !== null ? true : false,
          isUserOwner: ctx.session?.user.username === input.username,
        },
        posts: postsInDb.map((p) => ({
          id: p.id,
          createdAt: moment(p.createdAt).format("dd/mm/yyyy, HH:MM:ss"),
          userId: p.user.id,
          userImage: p.user.avatar,
          displayName: p.user.displayName ?? "",
          username: p.user.username ?? "",
          content: p.content,
          commentsCount: p._count.comments,
          likesCount: p._count.postLikes,
          liked: ctx.session !== null && p.postLikes.length !== 0,
          likeButtonActive: ctx.session !== null,
        })),
      };
    }),
  updateSettings: protectedProcedure
    .input(
      z.object({
        displayName: z
          .string()
          .min(3)
          .max(32)
          .regex(/^\S+(?: \S+)*$/),
        username: z
          .string()
          .min(3)
          .max(32)
          .regex(/^[a-zA-Z0-9._]+$/),
        bio: z.string().max(320),
      })
    )
    .mutation(async ({ ctx, input: { bio, displayName, username } }) => {
      return ctx.prisma.user.update({
        data: {
          bio,
          displayName,
          username,
        },
        where: {
          id: ctx.session.user.id,
        },
      });
    }),
  updateProfilePicture: protectedProcedure
    .input(
      z.object({
        picturePublicId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { picturePublicId } }) => {
      return ctx.prisma.user.update({
        data: {
          avatar: `https://res.cloudinary.com/${
            env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""
          }/${picturePublicId}.webp`,
        },
        where: {
          id: ctx.session.user.id,
        },
      });
    }),
  getSettings: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
    const userInDb = await ctx.prisma.user.findFirstOrThrow({
      where: {
        username: ctx.session.user.username,
      },
    });

    return {
      username: userInDb.username ?? "",
      displayName: userInDb.displayName ?? "",
      bio: userInDb.bio ?? "",
    };
  }),
});
