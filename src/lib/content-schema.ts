import { z } from 'astro/zod';
export const bindingSchema = z.object({ sourceKey: z.string(), sourceSha256: z.string().regex(/^[a-f0-9]{64}$/), startLine: z.number().int().positive(), endLine: z.number().int().positive(), excerptSha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const entrySchema = z.object({
  id: z.string(), route: z.string(), title: z.string(), description: z.string(), revision: z.number().int().positive(),
  kind: z.enum(['definition','assumption','derivation','conjecture','evidence','prediction','falsification','open-problem','intro','concept','example','framework','mathematics','research-status','open-problems','article','about','contribute','library','licensing']),
  lang: z.enum(['en']), audience: z.enum(['general','technical']), researchEdition: z.string(),
  publicationState: z.enum(['draft','published','superseded','withdrawn']), publishedAt: z.string().nullable(), updatedAt: z.string(),
  sourceRefs: z.array(z.string()), dependsOn: z.array(z.string()), related: z.array(z.string()).default([]), bibRefs: z.array(z.string()).default([]),
  contentOrigin: z.enum(['source-bound','proposed','authored']), sourceBinding: bindingSchema.nullable(), statement: z.string().nullable(),
  plainLanguage: z.string().default(''), scope: z.string(), evidenceState: z.enum(['not-applicable','external-supported','project-reported','project-reproduced','proposed','contested']),
  body: z.string().default(''), sourceMapping: z.string().default(''), adapter: z.enum(['markdown/1','rrg-escaped-addendum/1','rrg-proof-table/1','rrg-document/1','rrg-math-document/1']).default('markdown/1'),
  assumptions: z.array(z.string()).default([]), testRefs: z.array(z.string()).default([]), evidenceRefs: z.array(z.string()).default([]), limits: z.string().default(''),
  observables: z.string().optional(), conditions: z.string().optional(), targetId: z.string().optional(), procedure: z.string().optional(), rejectionCriterion: z.string().optional(),
  proposalProvenance: z.string().optional(), adopted: z.literal(false).optional(), correctionRef: z.string().optional(), supersedes: z.string().optional(), supersededBy: z.string().optional(), withdrawalReason: z.string().optional(),
  tags: z.array(z.string()).optional(), authorIdentity: z.string().optional(), rightsRef: z.string().nullable().default(null)
}).strict();
export type Entry = z.infer<typeof entrySchema>;
export const sourceSchema = z.object({ key: z.string(), path: z.string(), sha256: z.string().regex(/^[a-f0-9]{64}$/), edition: z.string(), date: z.string().nullable(), role: z.string(), declaredCurrent: z.boolean(), availability: z.literal('bytes-available'), inspectionScope: z.string(), authorityNoticeOnly: z.boolean() }).strict();
export type Source = z.infer<typeof sourceSchema>;
export const referenceSchema = z.object({ id: z.string().regex(/^BIB-[0-9]{4,}$/), identity: z.url(), title: z.string().min(1), url: z.url(), sourceRefs: z.array(z.string()), supportScope: z.string().min(1), verificationScope: z.string().min(1), sourceCitation:z.string().optional(), doi:z.string().optional(), authors:z.array(z.string()).optional(), publication:z.string().optional(), year:z.number().int().optional(), checkedAt:z.string().optional(), metadataEvidence:z.object({path:z.string(),sha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict().optional(), primaryId:z.string().optional(), linkRole:z.string().optional() }).strict();
export type Reference = z.infer<typeof referenceSchema>;
export const aliasSchema = z.object({ sourceKey: z.string(), localCitationKey: z.string(), bibliographyId: z.string() }).strict();
export const reviewSchema = z.object({ entryId: z.string(), fingerprint: z.string().regex(/^[a-f0-9]{64}$/), reviewerKind: z.enum(['agent','human']), reviewedAt: z.string(), outcome: z.enum(['accepted','pending','rejected']), evidenceRef: z.string() }).strict();
export type Review = z.infer<typeof reviewSchema>;

export const executionEvidenceSchema=z.object({id:z.string().regex(/^EXEC-[A-Z0-9-]+$/),path:z.string(),sha256:z.string().regex(/^[a-f0-9]{64}$/),supportScope:z.string().min(1),limitations:z.string().min(1)}).strict();
export type ExecutionEvidence=z.infer<typeof executionEvidenceSchema>;
