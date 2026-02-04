import { Page } from "@playwright/test";

export interface ConsoleError {
  type: "error" | "warning";
  message: string;
  url: string;
}

export async function collectConsoleErrors(
  page: Page,
  action: () => Promise<void>,
): Promise<ConsoleError[]> {
  const errors: ConsoleError[] = [];

  const handler = (msg: any) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push({
        type: msg.type(),
        message: msg.text(),
        url: page.url(),
      });
    }
  };

  page.on("console", handler);

  await action();

  page.off("console", handler);

  return errors;
}
