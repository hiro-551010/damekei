import { ChampionRepository } from "../domain/ports";
import { AACritOverride, ChampionPassiveSpec, ChampionSpecies, ChampionStateModifier, SkillVariantSpec } from "../domain/models";
import { SkillSlot } from "../domain/types";
import championsData from "./data/champions.json";
import championPassivesData from "./data/champion-passives.json";

type SkillOverrideEntry = Partial<Omit<ChampionSpecies["skills"][0], "slot">>;

type ChampionPassiveEntry = {
  passiveSpec?: ChampionPassiveSpec;
  skillVariants?: Partial<Record<SkillSlot, SkillVariantSpec[]>>;
  skillOverrides?: Partial<Record<SkillSlot, SkillOverrideEntry>>;
  stateModifiers?: ChampionStateModifier[];
  aaCritOverride?: AACritOverride;
};

const passivesMap = championPassivesData as Record<string, ChampionPassiveEntry>;

const champions: ChampionSpecies[] = (championsData as unknown as ChampionSpecies[]).map((c) => {
  const entry = passivesMap[c.id];
  if (!entry) return c;

  const skills = c.skills.map((skill) => {
    const override = entry.skillOverrides?.[skill.slot];
    const variantSpecs = entry.skillVariants?.[skill.slot];
    const mergedSkill = { ...skill, ...(override ?? {}) };

    const variants: SkillVariantSpec[] | undefined = variantSpecs?.map((v) => {
      if (!v.formula && v.multiplier !== undefined) {
        return {
          ...v,
          formula: { kind: "mul" as const, operands: [mergedSkill.damageFormula, { kind: "const" as const, value: v.multiplier }] },
        };
      }
      return v;
    });

    return { ...mergedSkill, ...(variants ? { variants } : {}) };
  });

  return {
    ...c,
    skills,
    ...(entry.passiveSpec && { passiveSpec: entry.passiveSpec }),
    ...(entry.stateModifiers && { stateModifiers: entry.stateModifiers }),
    ...(entry.aaCritOverride && { aaCritOverride: entry.aaCritOverride }),
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
