import { adminRouter } from "./routers/admin";
import { commentRouter } from "./routers/comment";
import { postRouter } from "./routers/post";
import { templateRouter } from "./routers/template";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  comment: commentRouter,
  user: userRouter,
  template: templateRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
