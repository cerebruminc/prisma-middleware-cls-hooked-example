import { Prisma, PrismaClient } from "@prisma/client";
import { createNamespace } from "cls-hooked";

const clsSession = createNamespace("server");
const prisma = new PrismaClient();

const middleware: Prisma.Middleware = async (params, next) => {
  const ctx = clsSession.get("ctx");
  console.log(
    `user ${ctx.userId} is running action ${params.action} on model ${params.model}`
  ); // e.g. `user 123 is running action create on model User`
  return next(params);
};

prisma.$use(middleware);

async function main() {
  const user = await new Promise((resolve) => {
    clsSession.run(async () => {
      clsSession.set("ctx", {
        userId: "123",
      });

      const response = await prisma.user.create({
        data: {
          name: "Alice",
          email: "alice@prisma.io",
        },
      });
      resolve(response);
    });
  });

  console.log(user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
