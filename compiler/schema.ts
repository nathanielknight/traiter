import { Storylet } from "../storylet.ts";
import {z} from "./deps.ts";

const qualitySchema = z.object({
  name: z.string(),
  number: z.number().optional(),
  text: z.string().optional(),
});

const requirementSchema = z.union([
  z.object({
    pred: z.literal("eq"),
    quality: z.string(),
    value: z.number(),
  }),
  z.object({
    pred: z.literal("neq"),
    quality: z.string(),
    value: z.number(),
  }),
  z.object({
    pred: z.literal("lt"),
    quality: z.string(),
    value: z.number(),
  }),
  z.object({
    pred: z.literal("le"),
    quality: z.string(),
    value: z.number(),
  }),
  z.object({
    pred: z.literal("gt"),
    quality: z.string(),
    value: z.number(),
  }),
  z.object({
    pred: z.literal("ge"),
    quality: z.string(),
    value: z.number(),
  }),
  z.object({
    pred: z.literal("is"),
    quality: z.string(),
    value: z.string(),
  }),
  z.object({
    pred: z.literal("isnot"),
    quality: z.string(),
    value: z.string(),
  }),
  z.object({
    pred: z.literal("set"),
    quality: z.string(),
  }),
  z.object({
    pred: z.literal("unset"),
    quality: z.string(),
  }),
]);

const changeSchema = z.union([
  z.object({
    op: z.literal("set"),
    quality: z.string(),
    number: z.number().optional(),
    text: z.string().optional(),
  }),
  z.object({
    op: z.literal("clear"),
    quality: z.string(),
  }),
  z.object({
    op: z.literal("gain"),
    quality: z.string(),
    amount: z.number(),
  }),
  z.object({
    op: z.literal("lose"),
    quality: z.string(),
    amount: z.number(),
  }),
]);

const outcomeSchema = z.object({
  body: z.string(),
  changes: z.array(changeSchema).optional(),
  goto: z.string().optional(),
});

const fixedActionSchema = z.object({
  kind: z.literal("fixed"),
  outcome: outcomeSchema,
});

const chanceActionSchema = z.object({
  kind: z.literal("chance"),
  successChance: z.number(),
  successOutcome: outcomeSchema,
  failureOutcome: outcomeSchema,
});

const checkActionSchema = z.object({
  kind: z.literal("check"),
  quality: z.string(),
  target: z.number(),
  successOutcome: outcomeSchema,
  failureOutcome: outcomeSchema,
});

const actionSchema = z.union([
  fixedActionSchema,
  chanceActionSchema,
  checkActionSchema,
]);

const choiceSchema = z.object({
  body: z.string(),
  requirements: z.array(requirementSchema).optional(),
  action: actionSchema,
})

const storyletSchema = z.object({
  id: z.string(),
  body: z.string(),
  choices: z.array(choiceSchema).nonempty(),
})


export function checkStorylet(s: unknown): Storylet {
  const storylet = storyletSchema.parse(s);
  return storylet;
}
