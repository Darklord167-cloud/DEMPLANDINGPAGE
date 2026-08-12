import { BOT_COMMANDS } from "../app/api/telegram/webhook/route.js";

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not set in environment variables.");
    process.exit(1);
  }

  console.log("🔄 Registering 8 Telegram commands for @DarkEmpireGemeniBot...");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: BOT_COMMANDS
      })
    });

    const data = await res.json();
    if (data.ok) {
      console.log("✅ Successfully updated command list on @DarkEmpireGemeniBot!");
      console.log("List of registered commands:");
      BOT_COMMANDS.forEach((cmd) => {
        console.log(`  /${cmd.command.padEnd(10)} - ${cmd.description}`);
      });
    } else {
      console.error("❌ Telegram setMyCommands failed:", data);
    }
  } catch (err) {
    console.error("❌ Failed to call Telegram API:", err);
  }
}

main();
