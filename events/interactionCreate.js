import { InteractionType } from "discord.js"
import { client } from "../NusaSekai.js"

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isCommand() || interaction.user.bot || !interaction.guild) return

    const commandName = interaction.commandName
    const command = client.scommands.get(commandName)

    if (!command) {
      await client.send(interaction, {
        content: `\`${commandName}\` is not a valid command !!`,
        ephemeral: true
      })
      return
    }

    const { member, guild } = interaction
    const { userPermissions, botPermissions } = command

    const missingUserPerms = userPermissions.filter(
      (perm) => !member.permissions.has(perm)
    )

    if (missingUserPerms.length > 0) {
      await client.sendEmbed(
        interaction,
        `You are missing the following permissions: \`${missingUserPerms.join(", ")}\``
      )
      return
    }

    const missingBotPerms = botPermissions.filter(
      (perm) => !guild.me.permissions.has(perm)
    )

    if (missingBotPerms.length > 0) {
      await client.sendEmbed(
        interaction,
        `I am missing the following permissions: \`${missingBotPerms.join(", ")}\``
      )
      return
    }

    await executeCommandWithRetry(command, interaction)

  } catch (error) {
    console.error("An error occurred in interactionCreate event:", error)
    await client.sendEmbed(
      interaction,
      "An error occurred while processing your command. Please try again later."
    )
  }
})

async function executeCommandWithRetry(command, interaction, retryCount = 3) {
  let retries = 0
  while (retries < retryCount) {
    try {
      await preprocessCommand(command, interaction)
      await command.run({ client, interaction })
      break
    } catch (error) {
      console.error(`Error executing command '${command.name}':`, error)
      await client.sendEmbed(
        interaction,
        `An error occurred while executing the command '${command.name}'. Retrying... (${retries + 1}/${retryCount})`
      )
      retries++
    }
  }

  if (retries === retryCount) {
    console.error(`Command '${command.name}' failed after ${retryCount} retries.`)
    await client.sendEmbed(
      interaction,
      `Failed to execute the command '${command.name}' after ${retryCount} retries. Please try again later.`
    )
  }
}

async function preprocessCommand(command, interaction) {
  if (command.requiresAdditionalParams && !interaction.options) {
    throw new Error(`Command '${command.name}' requires additional parameters.`)
  }
}
