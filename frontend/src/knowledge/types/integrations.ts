import { FieldError } from "react-hook-form";
import z from "zod";

export const integrationSchema = z.object({
  notionToken: z.string(),

  driveToken: z.string(),

  jiraSite: z.union([
    z.literal(""),
    z.url({
      message: "Invalid Jira URL",
    }),
  ]),

  jiraEmail: z.union([
    z.literal(""),
    z.email({
      message: "Invalid email format",
    }),
  ]),

  jiraToken: z.string(),

  jiraProject: z.string(),

  notionPageId: z.string(),

  driveFileId: z.string(),

  deptScope: z.string(),
});

export type IntegrationFormData = z.infer<typeof integrationSchema>;

export type IntegrationFormErrors = {
  [K in keyof IntegrationFormData]?: FieldError;
};
