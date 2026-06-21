import { trainers } from "@/lib/data/trainers";
import type { Trainer } from "@/types";

export function getStaticTrainerByKey(key: string): Trainer | undefined {
  return trainers.find((trainer) => trainer.id === key);
}
