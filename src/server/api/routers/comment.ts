import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { errorMessages } from "~/utils/errorMessages";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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
});
