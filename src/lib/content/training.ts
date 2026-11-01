import "server-only";
import {
  longRuns,
  termPlan,
  trainingGroups,
  type LongRun,
  type TermPlan,
  type TrainingGroup,
} from "@/lib/data/training";
import { readCollection, writeCollection } from "./store";

// Training groups, the term plan for Tuesdays and the monthly long runs.

export const getTrainingGroups = () => readCollection<TrainingGroup[]>("training-groups", () => trainingGroups);
export const saveTrainingGroups = (v: TrainingGroup[]) => writeCollection("training-groups", v);

export const getTermPlan = () => readCollection<TermPlan>("term-plan", () => termPlan);
export const saveTermPlan = (v: TermPlan) => writeCollection("term-plan", v);

export const getLongRuns = () => readCollection<LongRun[]>("long-runs", () => longRuns);
export const saveLongRuns = (v: LongRun[]) => writeCollection("long-runs", v);
