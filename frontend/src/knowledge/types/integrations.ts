import { z } from "zod";

export const integrationSchema = z.object({
  notionToken: z.string().optional(),
  driveToken: z.string().optional(),
  jiraSite: z.string().optional(),
  jiraEmail: z.string().optional(),
  jiraToken: z.string().optional(),
  jiraProject: z.string(),
  notionPageId: z.string().optional(),
  driveFileId: z.string().optional(),
  deptScope: z.string().optional(),
});

export const validationSchema = integrationSchema.extend({
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
});

export type IntegrationFormData =
    z.infer<typeof validationSchema>;