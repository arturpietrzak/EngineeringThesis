import { TRPCError } from "@trpc/server";
import moment from "moment";
import { z } from "zod";
import { errorMessages } from "../../../utils/errorMessages";
import { extractUniqueHashtags } from "~/utils/helpers";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  getRecent: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 25;
      const { cursor } = input;

      const postsInDb = await ctx.prisma.post.findMany({
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        take: limit + 1,
        include: {
          user: true,
          postLikes: {
            where: {
              userId: ctx.session?.user.id,
            },
          },
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

      return {
        nextCursor: nextCursor,
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
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const postInDb = await ctx.prisma.post.findUniqueOrThrow({
        where: {
          id: id,
        },
        include: {
          user: true,
          postLikes: {
            where: {
              userId: ctx.session?.user.id,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  displayName: true,
                  avatar: true,
                  username: true,
                },
              },
              commentLike: {
                where: {
                  userId: ctx.session?.user.id,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              postLikes: true,
            },
          },
        },
      });

      return {
        post: {
          id: postInDb.id,
          createdAt: moment(postInDb.createdAt).format("dd/mm/yyyy, HH:MM:ss"),
          userId: postInDb.user.id,
          imageUrl: postInDb.user.avatar ?? "/defaultUserImage.webp",
          displayName: postInDb.user.displayName ?? "",
          username: postInDb.user.username ?? "",
          content: postInDb.content,
          commentsCount: postInDb._count.comments,
          likesCount: postInDb._count.postLikes,
          liked: ctx.session !== null && postInDb.postLikes.length !== 0,
          likeButtonActive: ctx.session !== null,
        },
        comments: postInDb.comments.map((c) => ({
          commentId: c.id,
          content: c.content,
          createdAt: moment(c.createdAt).format("dd/mm/yyyy, HH:MM:ss"),
          displayName: c.user.displayName ?? "",
          username: c.user.username ?? "",
          userImgUrl: c.user.avatar ?? "/defaultUserImage.webp",
          userId: c.userId ?? "",
          liked: c.commentLike.length != 0,
          likeAmount: c.commentLike.length,
        })),
      };
    }),
  getByIdToUpdate: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const postInDb = await ctx.prisma.post.findUniqueOrThrow({
        where: {
          id: id,
        },
        select: {
          content: true,
        },
      });

      return {
        post: {
          id,
          content: postInDb.content,
        },
      };
    }),
  getRecentByFollowed: protectedProcedure
    .input(
      z.object({
        page: z.number().min(0),
      })
    )
    .query(async ({ ctx, input: { page } }) => {
      const followsInDb = await ctx.prisma.follows.findMany({
        where: {
          followerId: ctx.session?.user.id,
        },
        select: {
          followingId: true,
        },
      });

      const followingIds = followsInDb.map(({ followingId }) => followingId);

      return await ctx.prisma.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          userId: {
            in: followingIds,
          },
        },
        skip: page * 25,
        take: 25,
        include: {
          _count: {
            select: {
              comments: true,
              postLikes: true,
            },
          },
        },
      });
    }),
  getTrending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 25;
      const page = input.cursor ?? 0;

      const trendingMinDate = new Date();
      trendingMinDate.setDate(trendingMinDate.getDate() - 7);

      const postsInDb = await ctx.prisma.post.findMany({
        orderBy: [
          {
            postLikes: {
              _count: "desc",
            },
          },
          {
            createdAt: "desc",
          },
        ],
        take: limit,
        skip: page * limit,
        where: {
          createdAt: {
            gt: trendingMinDate,
          },
        },
        include: {
          user: true,
          postLikes: {
            where: {
              userId: ctx.session?.user.id,
            },
          },
          _count: {
            select: { comments: true, postLikes: true },
          },
        },
      });

      const hashtagsInDb: { hashtagName: string; posts: string }[] = await ctx
        .prisma.$queryRaw`
      SELECT h.hashtagName, CAST(COUNT(h.hashtagName) as CHAR(50)) AS posts
      FROM Hashtag as h
      RIGHT JOIN PostHashtag as ph
      ON h.hashtagName = ph.hashtagName
      LEFT JOIN Post as p
      ON p.id = ph.postId
      WHERE p.createdAt > ${moment(trendingMinDate).format(
        "YYYY-MM-DD, HH:mm:ss.SSS"
      )}
      GROUP BY h.hashtagName
      `;

      let nextPage: number | undefined = undefined;
      if (postsInDb.length === limit) {
        nextPage = page + 1;
      }
      return {
        nextPage: nextPage,
        trendingHashtags: hashtagsInDb.map((row) => ({
          hashtagName: row["hashtagName"],
          posts: Number(row["posts"]),
        })),
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
  getByHashtag: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
        hashtagName: z.string(),
        allPosts: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 25;
      const page = input.cursor ?? 0;
      const { hashtagName } = input;
      const { allPosts } = input;

      const trendingMinDate = new Date();
      trendingMinDate.setDate(trendingMinDate.getDate() - 7);

      const postsInDb = await ctx.prisma.post.findMany({
        orderBy: [
          {
            postLikes: {
              _count: "desc",
            },
          },
          {
            createdAt: "desc",
          },
        ],
        take: limit,
        skip: page * limit,
        where: {
          ...(allPosts ? undefined : { createdAt: { gt: trendingMinDate } }),
          postHashtag: { some: { hashtagName } },
        },
        include: {
          user: true,
          postLikes: {
            where: {
              userId: ctx.session?.user.id,
            },
          },
          _count: {
            select: { comments: true, postLikes: true },
          },
        },
      });

      let nextPage: number | undefined = undefined;
      if (postsInDb.length === limit) {
        nextPage = page + 1;
      }
      return {
        nextPage: nextPage,
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
  create: protectedProcedure
    .input(z.object({ content: z.string(), hashtags: z.string() }))
    .mutation(async ({ ctx, input: { content, hashtags } }) => {
      const extractedHashtags = extractUniqueHashtags(hashtags);

      if (extractedHashtags.length > 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errorMessages.BAD_REQUEST,
        });
      }

      const postInDb = await ctx.prisma.post.create({
        data: {
          content: content,
          userId: ctx.session.user.id,
        },
      });

      extractedHashtags.map(async (h) => {
        const hashtagInDb = await ctx.prisma.hashtag.findUnique({
          where: {
            hashtagName: h,
          },
        });

        if (hashtagInDb === null) {
          await ctx.prisma.hashtag.create({
            data: {
              hashtagName: h,
            },
          });
        }

        await ctx.prisma.postHashtag.create({
          data: {
            hashtagName: h,
            postId: postInDb.id,
          },
        });
      });

      return {
        postId: postInDb.id,
      };
    }),
  delete: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input: { postId } }) => {
      const postInDb = await ctx.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (postInDb?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: errorMessages.UNAUTHORIZED,
        });
      }

      return await ctx.prisma.post.delete({
        where: {
          id: postId,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { content, postId } }) => {
      const postInDb = await ctx.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (postInDb?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: errorMessages.UNAUTHORIZED,
        });
      }

      await ctx.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          content: content,
        },
      });

      const hashtags = extractUniqueHashtags(content);

      await ctx.prisma.postHashtag.deleteMany({
        where: {
          postId: postId,
        },
      });

      hashtags.map(async (h) => {
        const hashtagInDb = await ctx.prisma.hashtag.findUnique({
          where: {
            hashtagName: h,
          },
        });

        if (hashtagInDb === null) {
          await ctx.prisma.hashtag.create({
            data: {
              hashtagName: h,
            },
          });
        }

        await ctx.prisma.postHashtag.create({
          data: {
            hashtagName: h,
            postId: postInDb.id,
          },
        });
      });
    }),
  like: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { postId } }) => {
      const postLikeInDb = await ctx.prisma.postLike.findFirst({
        where: {
          AND: [
            {
              userId: ctx.session.user.id,
            },
            {
              postId: postId,
            },
          ],
        },
      });

      if (postLikeInDb !== null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errorMessages.BAD_REQUEST,
        });
      }

      return await ctx.prisma.postLike.create({
        data: {
          postId: postId,
          userId: ctx.session.user.id,
        },
      });
    }),
  unlike: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { postId } }) => {
      const postLikeInDb = await ctx.prisma.postLike.findFirst({
        where: {
          AND: [
            {
              userId: ctx.session.user.id,
            },
            {
              postId: postId,
            },
          ],
        },
      });

      if (postLikeInDb === null) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: errorMessages.UNAUTHORIZED,
        });
      }

      return await ctx.prisma.postLike.deleteMany({
        where: {
          postId: postId,
          userId: ctx.session.user.id,
        },
      });
    }),
  report: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        reason: z.string(),
        category: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { postId, reason, category } }) => {
      const reportInDb = await ctx.prisma.report.findFirst({
        where: {
          userId: ctx.session.user.id,
          postId: postId,
        },
      });

      if (reportInDb === null) {
        await ctx.prisma.report.create({
          data: {
            userId: ctx.session.user.id,
            postId,
            reason,
            category,
          },
        });
      }
    }),
});
