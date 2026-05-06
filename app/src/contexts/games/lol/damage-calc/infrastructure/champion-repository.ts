import { ChampionRepository } from "../domain/ports";
import { ChampionPassiveSpec, ChampionSpecies, ChampionStateModifier, SkillVariantSpec } from "../domain/models";
import { SkillSlot } from "../domain/types";
import championsData from "./data/champions.json";
import championPassivesData from "./data/champion-passives.json";

type ChampionPassiveEntry = {
  passiveSpec?: ChampionPassiveSpec;
  skillVariants?: Partial<Record<SkillSlot, SkillVariantSpec[]>>;
  stateModifiers?: ChampionStateModifier[];
};

const passivesMap = championPassivesData as Record<string, ChampionPassiveEntry>;

const champions: ChampionSpecies[] = (championsData as ChampionSpecies[]).map((c) => {
  const entry = passivesMap[c.id];
  if (!entry) return c;

  const skills = c.skills.map((skill) => {
    const variants = entry.skillVariants?.[skill.slot];
    return variants ? { ...skill, variants } : skill;
  });

  return {
    ...c,
    skills,
    ...(entry.passiveSpec && { passiveSpec: entry.passiveSpec }),
    ...(entry.stateModifiers && { stateModifiers: entry.stateModifiers }),
  };
});

const byId = new Map(champions.map((c) => [c.id, c]));

export const championRepository: ChampionRepository = {
  async findAll() {
    return champions;
  },
  async findById(id: string) {
    return byId.get(id) ?? null;
  },
};
