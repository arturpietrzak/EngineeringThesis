import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { errorMessages } from "~/utils/errorMessages";

export const templateRouter = createTRPCRouter({
  getTemplates: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const templatesInDb = await ctx.prisma.template.findMany({
        where: { userId: ctx.session.user.id },
      });

      return {
        templates: [
          { content: "<p>Test</p>", name: "test", id: "idtest" },
          ...templatesInDb.map(({ content, name, id }) => ({
            content,
            name,
            id,
          })),
        ],
      };
    }),
  getTemplateById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input: { id } }) => {
      const templateInDb = await ctx.prisma.template.findUnique({
        where: { id },
      });

      if (templateInDb?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: errorMessages.UNAUTHORIZED,
        });
      }

      return {
        template: {
          content: templateInDb.content,
          name: templateInDb.name,
          id: templateInDb.id,
        },
      };
    }),
  createTemplate: protectedProcedure
    .input(z.object({ content: z.string(), name: z.string().max(32) }))
    .mutation(async ({ ctx, input: { content, name } }) => {
      const templatesInDb = await ctx.prisma.template.findMany({
        where: { userId: ctx.session.user.id },
      });

      if (templatesInDb.length >= 25) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have reached the limit of templates",
        });
      }

      const newTemplateInDb = await ctx.prisma.template.create({
        data: { content, name, userId: ctx.session.user.id },
      });

      return {
        template: {
          id: newTemplateInDb.id,
        },
      };
    }),
  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      const templateInDb = await ctx.prisma.template.findUnique({
        where: { id },
      });

      if (templateInDb?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: errorMessages.UNAUTHORIZED,
        });
      }

      const removedTemplate = await ctx.prisma.template.delete({
        where: { id },
      });

      return { template: { content: removedTemplate.content } };
    }),
  updateTemplate: protectedProcedure
    .input(z.object({ id: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input: { id, content } }) => {
      const templateInDb = await ctx.prisma.template.findUnique({
        where: { id },
      });

      if (templateInDb?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: errorMessages.UNAUTHORIZED,
        });
      }

      const updatedTemplate = await ctx.prisma.template.update({
        where: { id },
        data: { content },
      });

      return { template: { content: updatedTemplate.content } };
    }),
});
