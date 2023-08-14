import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { errorMessages } from "~/utils/errorMessages";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import moment from "moment";

export const commentRouter = createTRPCRouter({
  comment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { postId, content } }) => {
      const postInDb = await ctx.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (postInDb === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errorMessages.BAD_REQUEST,
        });
      }

      return await ctx.prisma.comment.create({
        data: {
          userId: ctx.session.user.id,
          postId: postId,
          content: content,
        },
      });
    }),
  deleteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { commentId } }) => {
      const commentInDb = await ctx.prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });

      if (commentInDb === null || commentInDb.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: errorMessages.UNAUTHORIZED,
        });
      }

      return await ctx.prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
    }),
  likeComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { commentId } }) => {
      const commentLikeInDb = await ctx.prisma.commentLike.findFirst({
        where: {
          AND: [{ commentId: commentId }, { userId: ctx.session.user.id }],
        },
      });

      if (commentLikeInDb === null) {
        return await ctx.prisma.commentLike.create({
          data: {
            userId: ctx.session.user.id,
            commentId: commentId,
          },
        });
      }
    }),
  unlikeComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { commentId } }) => {
      const commentLikeInDb = await ctx.prisma.commentLike.findFirst({
        where: {
          AND: [{ commentId: commentId }, { userId: ctx.session.user.id }],
        },
      });

      if (
        commentLikeInDb !== null &&
        commentLikeInDb.userId === ctx.session.user.id
      ) {
        return await ctx.prisma.commentLike.delete({
          where: {
            userId_commentId: {
              commentId: commentLikeInDb.commentId,
              userId: commentLikeInDb.userId,
            },
          },
        });
      }
    }),
  getCommentsByPostId: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 25;
      const { cursor } = input;
      const postId = input.postId;

      const commentsInDb = await ctx.prisma.comment.findMany({
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          {
            commentLike: { _count: "desc" },
          },
          {
            createdAt: "desc",
          },
        ],
        take: limit + 1,
        where: {
          postId: postId,
        },
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
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (commentsInDb.length > limit) {
        const nextItem = commentsInDb.pop();
        nextCursor = nextItem?.id;
      }

      return {
        nextCursor,
        comments: commentsInDb.map((c) => ({
          commentId: c.id,
          content: c.content,
          createdAt: moment(c.createdAt).format("MMMM Do YYYY, HH:mm:ss"),
          displayName: c.user.displayName ?? "",
          username: c.user.username ?? "",
          userImgUrl: c.user.avatar ?? "/defaultUserImage.webp",
          userId: c.userId ?? "",
          liked: ctx.session !== null && c.commentLike.length !== 0,
          likeAmount: c.commentLike.length,
        })),
      };
    }),
});
