import { ATTRIBUTES, COMBAT, calculate } from "./kernel.mjs";
import { SKILLS } from "./rules.mjs";
import { ITEM_PROFILES, ACTOR_PROFILES } from './sheet-profiles.mjs';
import {migrateItemSystem} from './migrations.mjs';
import {characteristicEffects,applyResourceMaximum,migrateSupportingChakra} from './characteristic-effects.mjs';
const { SchemaField, NumberField, StringField, BooleanField, ArrayField, HTMLField } = foundry.data.fields;
const integer = (extra = {}) => new NumberField({ required: true, nullable: false, integer: true, initial: 0, ...extra });
const text = () => new StringField({ required: true, blank: true, initial: "" });
const modifier = () => new SchemaField({ value: integer(), origin: text() });
const specialResources=()=>new ArrayField(new SchemaField({id:text(),sourceId:text(),kind:new StringField({required:true,choices:['bijuu','vision','health']}),value:integer({nullable:true,initial:null,min:0}),history:new ArrayField(new SchemaField({from:integer({nullable:true,initial:null,min:0}),to:integer({nullable:true,initial:null,min:0}),note:text(),user:text(),at:text()}))}));
const damageState=()=>new SchemaField({hardness:integer({min:0}),hardnessSource:text(),head:text(),externalRevision:integer({min:0}),armorPools:new ArrayField(new SchemaField({itemId:text(),value:integer({nullable:true,initial:null,min:0}),max:integer({nullable:true,initial:null,min:0}),source:text()}))});
const durationRule=()=>new SchemaField({mode:new StringField({initial:'manual',choices:['manual','turns','scene']}),turns:integer({initial:1,min:1,max:100}),phase:new StringField({initial:'end',choices:['start','end']}),anchor:new StringField({initial:'recipient',choices:['recipient','caster']})});
const durationClock=()=>new SchemaField({combatId:text(),combatantId:text(),remaining:integer({min:0}),firstRound:integer({min:0}),lastRound:integer({min:0})});
const activeAptitudes=()=>new ArrayField(new SchemaField({id:text(),sourceId:text(),rule:new StringField({required:true,choices:['sharingan','byakugan','manual','transplanted']}),cost:integer({nullable:true,initial:null,min:0}),note:text(),active:new BooleanField({initial:false}),history:new ArrayField(new SchemaField({event:text(),from:new BooleanField({initial:false}),to:new BooleanField({initial:false}),chakraCost:integer({min:0}),eventKey:text(),user:text(),at:text()}))}));
export class ShinobiData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      nc: integer({ initial: 4, min: 4, max: 20 }),
      phase: new StringField({ initial: "creation", choices: ["creation", "evolution"], required: true }),
      traits: new ArrayField(text()),
      specialResources:specialResources(),damageState:damageState(),
      activeAptitudes:activeAptitudes(),
      attributes: new SchemaField(Object.fromEntries(ATTRIBUTES.map(([k]) => [k, integer({ min: 0 })]))),
      bases: new SchemaField(Object.fromEntries(COMBAT.map(([k]) => [k, integer({ initial: 3, min: 0 })]))),
      identity: new SchemaField(Object.fromEntries(["clan", "rank", "origin", "village", "gender", "age", "size", "hand", "nature", "nature2", "tendency", "languages", "senses"].map(k => [k, text()]))),
      resources: new SchemaField({
        vitality: new SchemaField({ value: integer({ nullable: true, initial: null }), max: integer({ persisted: false }), temp: integer({ min: 0 }) }),
        chakra: new SchemaField({ value: integer({ nullable: true, initial: null }), max: integer({ persisted: false }) })
      }),
      movement: new SchemaField({ available: integer({ nullable: true, initial: null, min: 0 }) }),
      skills: new SchemaField(Object.fromEntries(SKILLS.map(s => [s.key, new SchemaField({ bought: integer({ min: 0 }) })]))),
      modifiers: new SchemaField(Object.fromEntries([...COMBAT.map(([k]) => k), "movement", "initiative", ...SKILLS.map(s => "skill_" + s.key)].map(k => [k, modifier()]))),
      access: new SchemaField({ quimico: new BooleanField({ initial: false }), voo: new BooleanField({ initial: false }), basesOverride: new BooleanField({ initial: false }) }),
      budgets: new SchemaField({
        powersSpent: integer({ min: 0 }),
        investmentReviewed: new BooleanField({initial:false}),
        grants: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          category: new StringField({ required: true, choices: ["attributes", "skills", "powers", "social"] }),
          amount: integer({ min: 1 }), note: text()
        }))
      }),
      finances: new SchemaField({ ryo: integer({ nullable: true, initial: null, min: 0 }) }),
      biography: new SchemaField(Object.fromEntries(["appearance", "history", "personality", "allies", "notes"].map(k => [k, text()])))
    };
  }
  prepareDerivedData() {
    this.derived = calculate(this.toObject(),characteristicEffects(this.parent),this.parent?.items??[]);
    this.resources.vitality.max = this.derived.vitalityMax;
    this.resources.chakra.max = this.derived.chakraMax;
  }
}
export class ReferenceItemData extends foundry.abstract.TypeDataModel {
  static migrateData(source,options){return super.migrateData(migrateItemSystem(source,options),options);}
  static defineSchema() {
    return {
      description: new HTMLField({initial:''}), personalNotes:text(), category: text(), ruleId:text(), contentId:text(),
      choice:new SchemaField({kind:text(),key:text()}),
      tags: new ArrayField(text()), level: integer({min:0}),
      schemaVersion: integer({initial:2,min:0}),traits:new ArrayField(text()),
      power:new SchemaField({definitionId:text(),choices:new ArrayField(new SchemaField({id:text(),slot:integer({min:1,initial:1}),effectId:text(),stage:integer({min:1,initial:1}),note:text()}))}),
      jutsu:new SchemaField({effectId:text(),grantSourceId:text(),selectionId:text(),usedLevel:integer({min:1,initial:1}),variant:text(),overrides:new ArrayField(new SchemaField({key:text(),value:text(),reason:text(),author:text()}))}),
      targetEffects:new ArrayField(new SchemaField({id:text(),conditionId:text(),trigger:text(),recipient:text(),degree:integer({initial:1,min:1,max:3}),scope:text(),resistance:text(),dcMode:text(),dc:integer({min:0}),duration:text(),durationRule:durationRule(),note:text(),source:text()})),
      appliedCondition:new SchemaField({managed:new BooleanField({initial:false}),active:new BooleanField({initial:false}),scope:text(),origin:text(),sourceUuid:text(),casterUuid:text(),duration:text(),durationRule:durationRule(),durationClock:durationClock(),note:text(),applicationKey:text(),appliedBy:text(),appliedAt:text(),endedAt:text()}),
      equipped: new BooleanField({initial:false}),
      details: new SchemaField({accessRule:text(),...Object.fromEntries([...new Map(Object.values(ITEM_PROFILES).flatMap(p=>p.details).map(f=>[f.key,f])).values()].map(f=>[f.key,f.kind==='number'?integer({nullable:true,initial:null}):text()]))}),
      quantity: integer({ initial: 1, min: 0 }),
      compartments: integer({ nullable: true, initial: null, min: 0 }),
      source: new SchemaField({ id: text(), edition: text(), pages: text() })
    };
  }
}
export class SupportingActorData extends foundry.abstract.TypeDataModel {
 static migrateData(source,options){return super.migrateData(migrateSupportingChakra(source),options);}
 static defineSchema(){
  const resource=(derived=false)=>new SchemaField({value:integer({nullable:true,initial:null}),max:integer({nullable:true,initial:null,min:0,persisted:!derived}),...(derived?{baseMax:integer({nullable:true,initial:null,min:0})}:{})});
  return {
   contentId:text(),description:new HTMLField({initial:''}),tags:new ArrayField(text()),traits:new ArrayField(text()),nc:integer({nullable:true,initial:null,min:0}),
   resources:new SchemaField({vitality:resource(),chakra:resource(true)}),
   specialResources:specialResources(),damageState:damageState(),
   activeAptitudes:activeAptitudes(),
   attributes:new SchemaField(Object.fromEntries(ATTRIBUTES.map(([k])=>[k,integer({nullable:true,initial:null})]))),
   stats:new SchemaField(Object.fromEntries(['cc','cd','esq','lm','initiative','movement'].map(k=>[k,integer({nullable:true,initial:null})]))),
   statsOriginal:new SchemaField(Object.fromEntries(['cc','cd','esq','lm','initiative'].map(k=>[k,integer({nullable:true,initial:null,min:0})]))),
   skillLevels:new SchemaField(Object.fromEntries(SKILLS.map(s=>[s.key,integer({nullable:true,initial:null,min:0})]))),
   recordedSkills:new ArrayField(new SchemaField({key:new StringField({required:true,choices:SKILLS.map(s=>s.key)}),precision:integer({nullable:true,initial:null}),untrained:new BooleanField({initial:false})})),
   recordedSkillsConfigured:new BooleanField({initial:false}),
   details:new SchemaField(Object.fromEntries([...new Map(Object.values(ACTOR_PROFILES).flatMap(p=>p.sections.flatMap(s=>s[1])).map(f=>[f.key,f])).values()].map(f=>[f.key,f.kind==='number'?integer({nullable:true,initial:null}):text()]))),
   members:new ArrayField(text()),activities:new ArrayField(new SchemaField({member:text(),name:text(),item:text()})),source:new SchemaField({id:text(),edition:text(),pages:text()})
  };
 }
 prepareDerivedData(){this.resources.chakra.max=applyResourceMaximum(this.resources.chakra.baseMax,characteristicEffects(this.parent));}
}
