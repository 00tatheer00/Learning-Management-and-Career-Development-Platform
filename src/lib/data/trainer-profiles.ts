import { trainers } from "@/lib/data/trainers";
import type { Trainer } from "@/types";

export function getStaticTrainerByKey(key: string): Trainer | undefined {
  if (key === "trainer-fazal") {
    return trainers.find((trainer) => trainer.id === "trainer-faisal");
  }
  return trainers.find((trainer) => trainer.id === key);
}
