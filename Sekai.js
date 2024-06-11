import "dotenv/config";
import { Sekai } from "./func/Client.js";

export const client = new Bot();

client.build(client.config.TOKEN);


process.on("uncaughtException", (error) => {
  console.error("An uncaught exception occurred:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("An unhandled promise rejection occurred:", error);
});
￼Enter
