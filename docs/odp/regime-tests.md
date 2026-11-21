# Regime test suite: ODP-001 to ODP-009

| | |
|---|---|
| **Tests** | LOF-ODP-001 to 006 as released (001 to 004 at 0.2.0) with the 0.3.0 proposals, and LOF-ODP-007 to 009, as one ontology |
| **Status** | draft, for review by the founding coordinators |
| **Result** | round 1: 73 of 85 questions; round 2, after six fixes: 85 of 85; rerun on the released 0.2.0 patterns (20 November 2026): 85 of 85, and the three negative tests inconsistent as required |
| **Drafted by** | David R. Koepsell |

## Purpose

The Foundry's patterns are meant to be a general foundation for legal
ontologies: they should represent any legal system, in any tradition, and
reason about it without contradiction. Worked examples written alongside a
pattern cannot show this, because they are chosen to fit it. This suite applies
the patterns to fourteen legal regimes chosen to differ as much as possible:
common and civil law, constitutional, international, indigenous, Islamic,
canon, criminal, and ancient law, intellectual property, arbitration, and
artificial agents. It covers legal instances (acts, decisions, positions) and
legal objects (land, a river, an invention, an estate, charters and a stele).

## Method

1. **Only Foundry and BFO terms.** Each regime is modeled in a Turtle file
   using LOF and BFO terms only. A regime that needs a term the Foundry does
   not have is recorded as a gap, never patched with an ad hoc class.
2. **Real law.** Each case rests on real legal sources (statutes, decisions,
   treaties, codes), with hypothetical parties where a particular instance is
   needed. Sources are cited at the top of each file.
3. **Expected answers from the law.** Each case has competency questions whose
   expected answers state what the law says, written before the reasoner was
   run. Ten expected answers are negative (for example, a recognized
   customary rule does *not* thereby become Australian law), so that the
   ontology cannot pass by inferring too much.
4. **Three outcomes per question.** *Pass*; *fail* (the reasoner's answer
   differs from the law's); *not expressible* (the question needs a term the
   ontology lacks).
5. **Consistency.** Every case is merged with the ontology and reasoned with
   HermiT, merging first and reasoning second (ROBOT does not report
   inconsistency when the two are chained). Competency questions are answered
   with HermiT through owlready2, because ROBOT's export omits types that depend
   on property values.
6. **Placement.** Rounds 1 and 2 were run under both ODP-003 options then open
   (Option A+ and Option B). ODP-003 0.2.0 settled the question (legal positions
   are BFO roles), and the suite was rerun on the released 0.2.0 patterns with
   the proposed *legal relation* class.
7. **Negative tests.** Three further files record what the law says cannot
   be, and must make the ontology inconsistent. Each is run with a control
   showing that its base case alone is consistent.

## The regimes

| Case | Regime | Round 1 | Round 2 |
|---|---|---|---|
| R01 | England and Wales: negligence, stare decisis | 6/6 | 6/6 |
| R02 | France: delict, recodification, case law | 7/8 | 8/8 |
| R03 | United States: judicial review | 6/6 | 6/6 |
| R04 | International law: custom, treaty, jus cogens | 5/7 | 7/7 |
| R05 | Australia: native title | 5/7 | 7/7 |
| R06 | Malaysia: faraid in a plural system | 6/6 | 6/6 |
| R07 | Canon law and Texas: one wedding, two orders | 4/6 | 6/6 |
| R08 | Texas: theft, punishment, restitution | 4/5 | 5/5 |
| R09 | United States: patent | 7/8 | 8/8 |
| R10 | New Zealand: a river as legal person | 4/4 | 4/4 |
| R11 | Magna Carta: documents, versions, papal nullity | 5/7 | 7/7 |
| R12 | Artificial agents: UETA, DABUS | 6/6 | 6/6 |
| R13 | Laws of Hammurabi | 3/4 | 4/4 |
| R14 | International commercial arbitration | 5/5 | 5/5 |

| Case | What it tests | Sources |
|---|---|---|
| R01 | binding precedent, overruling as amendment, duty of care | *Donoghue v Stevenson* [1932] AC 562; *Anns v Merton* [1978] AC 728; *Murphy v Brentwood* [1991] 1 AC 398; Appellate Jurisdiction Act 1876 |
| R02 | delict without an *acte juridique*, recodification, delegated legislation, settled case law | Code civil arts. 1382 and 1240; Ordonnance 2016-131; Loi 2015-177; Constitution of 1958 Art. 38; *Teffaine* (1896), *Jand'heur* (1930) |
| R03 | constitutional supremacy, authoritative precedence, non-application without repeal | *Marbury v. Madison*, 5 U.S. 137 (1803); Judiciary Act 1789 s. 13 |
| R04 | custom, treaty under custom, peremptory norms, a void treaty | ICJ Statute Art. 38(1); VCLT Arts. 26, 53; *Armed Activities (DRC v. Rwanda)* (2006) |
| R05 | an indigenous order recognized by a state order, communal holding, rights in rem in land | *Mabo v Queensland (No 2)* (1992) 175 CLR 1; Native Title Act 1993 (Cth) |
| R06 | an embedded religious order with personal scope, succession by operation of law | Federal Constitution of Malaysia Art. 121(1A), Ninth Schedule List II; Qur'an 4:11 as received in Shafi'i fiqh |
| R07 | one act, two orders: canonical nullity and civil validity | Code of Canon Law 1983, cans. 11, 1095; Texas Family Code ch. 2 |
| R08 | offences owed to the state, punishment versus restitution | Texas Penal Code s. 31.03 |
| R09 | rights in rem over an intangible, patent term, cancellation after review, representation of the state | 35 U.S.C. ss. 154, 284, 318(b) |
| R10 | juristic personality of a natural feature, representation | Te Awa Tupua (Whanganui River Claims Settlement) Act 2017, ss. 14, 18-20; Constitution Act 1986 s. 15 |
| R11 | documents and exemplars, versions and succession, partial repeal, nullity declared by another order | Magna Carta 1215, 1225, 1297; bull of Innocent III, 24 August 1215 |
| R12 | contracts formed by software agents; an AI system as purported inventor | UETA s. 14 (Tex. Bus. & Com. Code ch. 322); *Thaler v. Vidal*, 43 F.4th 1207 (Fed. Cir. 2022) |
| R13 | an ancient order, personal scope by social class, talion, a monumental document | Laws of Hammurabi, law 196; the Louvre stele |
| R14 | adjudication grounded in contract, recognition of a foreign award | Arbitration Act 1996; New York Convention 1958 Art. III; 9 U.S.C. s. 201 |

All fourteen cases were consistent in both rounds under both options, and
results under Option A+ and Option B were identical, question by question. The
rerun on the released 0.2.0 patterns gives the same results.

## Round 1: what failed

| Problem | Cases | Questions | Diagnosis |
|---|---|---|---|
| A tort or offence cannot close the legal chain | R02 | 1 fail | ODP-004 *fully grounded* required node 5 to be a *legal act*. Careless riding is not an *acte juridique*, so no delictual or criminal chain could ever be complete. |
| Communal holders made legal persons | R05 | 1 fail | ODP-009's axiom *held by only legal person* classified the Meriam people as a legal person. In *Mabo* they hold native title communally, without personality. |
| No rights in rem | R05, R09 | 2 not expressible | Nothing distinguished a right "as against the whole world" from a right against one person. |
| No peremptory norms | R04 | 1 not expressible | Nothing could say that the prohibition of genocide is non-derogable. |
| Punishment classified as repair | R08, R13 | 2 not expressible | A sentence or talion could be linked to the breached duty only by *remedies*. |
| Nullity not relative to an order | R04, R07, R11 | 5 not expressible | A wedding void in canon law is valid in Texas; Magna Carta declared null by the Pope stood in England. *Void act* is absolute, and asserting it of the wedding is inconsistent (negative test N02). |

## The fixes

| Fix | Pattern | Terms | Effect |
|---|---|---|---|
| Node 5 is any process realizing a legal role | ODP-004 0.3.0 proposal | *fully grounded legal position* revised | R02 passes. Run in isolation, the round 1 ontology still fails R02 even with complete data, so the change is needed. |
| Holder axiom replaced by a SHACL warning | ODP-009 draft | axiom removed; `src/shapes/holder-personality.ttl` | R05 passes; the shape reports the Meriam people (communal, correct) and the mill company in R10 (personality not recorded). Natural personality is now recorded, not inferred (R06 data). |
| Rights in rem | ODP-003 (proposed) | *position in rem* `ODP003_0001012` | R05, R09 expressible. |
| Non-derogable content | ODP-006 (proposed) | *non-derogable content* `ODP006_0001003` | R04 expressible; derogating from it is inconsistent (N01). |
| Sanctions | ODP-004 0.3.0 proposal | *sanction* `ODP004_0001004`, *sanctions* `ODP004_0001112` | R08, R13 pass; the sentence is a sanction and not remedial; restitution remains remedial. |
| Relative nullity | ODP-007 | *void in* `ODP007_0001110`, inferred from declarations performed under the order's content | R04, R07, R11 pass, including the negative expectations (the wedding is *not* void in Texas; Magna Carta is *not* void in England). |

One round 2 failure was in the test, not the ontology: the R02 case omitted
the power under which the 2016 ordonnance was made (Constitution Art. 38).
Diagnosis showed that every other node of the chain was occupied; the power was
added to the case data and the question passed.

## Round 2: results

85 of 85 questions pass under both options; all three negative tests are
inconsistent as required, with consistent controls. The worked examples of
ODP-001 to 009 (the lease chain and the GDPR examples) remain consistent, and
their 26 expected inferences still hold. Removing the holder axiom changed one
earlier inference: the state legislature in ODP-004's example is no longer
inferred to be a legal person merely because it holds a power. That is now a
checked expectation.

## Boundaries the suite found but did not fix

These are commitments of the patterns, not defects. They are recorded for the
coordinators to decide.

1. **Origin of revealed law.** ODP-001 requires every item of legal content to
   arise from an act or a practice. The faraid rule (R06) can be represented
   only as arising from juristic practice (*ijma'*, the Shafi'i school), not
   from revelation as such; canon law's *ius divinum* is in the same position.
   This is a positivist commitment. It is defensible (the content that a
   legal order applies is the content its practice receives), but it should
   be stated in LOF-P-004 or relaxed (ODP-001 open question 4).
2. **Operation of law.** Positions arising from a death or the lapse of time
   (R06) can be represented, but never *fully grounded*, because no process
   realizes a legal role. The chain-closure class covers conduct and acts,
   not automatic effects (ODP-001 open question 6, ODP-004 open question 2).
3. **Ranking of sources.** *Non-derogable content* covers peremptory norms and
   entrenchment. A general ranking (constitution above statute above
   regulation), which *lex superior* presupposes, is still left to the rule
   layer (ODP-006).
4. **Succession of orders.** R11 treats England from 1215 to the present as one
   order. Succession of orders through union, revolution, or secession is not
   yet a pattern (ODP-007 open question 6).
5. **Omissions.** No case needed an omission as node 5 beyond what
   *undischarged during* gives. A case built around an omission (failure to
   rescue where a duty exists) should be added.

## Gaps in the suite itself

The suite does not yet include: a Roman-law or Byzantine order; Chinese,
Japanese, or Korean law; a socialist legal order; a non-state order without
courts (a merchant guild, an online platform's terms of service); public
administrative law (licences, permits); family status (adoption,
guardianship) beyond R07; secured transactions and trusts; and data protection
beyond the ODP-005 and 006 examples. Each would test something the current
fourteen do not.

## Running the suite

```
LOF_ROOT=<folder with lof-odp-001..006 and drafts/> ROBOT_JAR=<robot.jar>
bash drafts/build_foundations.sh                       # builds lof-foundations-A.owl and -B.owl
python3 drafts/regimes/run_suite.py drafts/tmp/lof-foundations-A.owl A
bash drafts/regimes/run_negative.sh drafts/tmp/lof-foundations-A.owl
```

Requires Java, ROBOT 1.9.7, Python with rdflib and owlready2.

## Results by question

**R01 England and Wales: negligence, stare decisis**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Neighbour holding is binding precedent | yes | pass | pass |
| Neighbour holding belongs to the English order (by chain through the Appellate Jurisdiction Act) | yes | pass | pass |
| Anns holding was binding precedent (it was overruled) | yes | pass | pass |
| Murphy is an amending act | yes | pass | pass |
| Stevenson's duty is directed at Donoghue | yes | pass | pass |
| Law lords bear adjudicator roles | yes | pass | pass |

**R02 France: delict, recodification, case law**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Art. 1240 belongs to the French order (ordonnance made under habilitation law) | yes | pass | pass |
| The 2016 ordonnance is an amending act | yes | pass | pass |
| Liability for things is settled case law (decisional practice) | yes | pass | pass |
| Case-law rule belongs to the French order | yes | pass | pass |
| Duty to make reparation is remedial | yes | pass | pass |
| Careless riding is a triggering occurrence | yes | pass | pass |
| Duty to make reparation is directed at the pedestrian | yes | pass | pass |
| Delictual liability is a complete legal chain (fully grounded): conduct of a road user, not an acte juridique | yes | **fail** | pass |

**R03 United States: judicial review**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Article III prevails over s. 13 | yes | pass | pass |
| Marbury determination is authoritative | yes | pass | pass |
| Judicial review holding is binding precedent | yes | pass | pass |
| Judicial review holding belongs to the federal order | yes | pass | pass |
| Section 13 still belongs to the federal order (not applied, not expunged) | yes | pass | pass |
| Section 13 does not prevail over Article III | no | pass | pass |

**R04 International law: custom, treaty, jus cogens**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Prohibition of genocide belongs to the international order (custom) | yes | pass | pass |
| VCLT Art. 53 belongs to the international order (treaty under pacta sunt servanda) | yes | pass | pass |
| Treaty X is not a legal act | no | pass | pass |
| ICJ judgment is a declaration of nullity | yes | pass | pass |
| Treaty X is void in the international order | yes | **not expressible** | pass |
| The prohibition of genocide is non-derogable (peremptory) | yes | **not expressible** | pass |
| State A is a legal person | yes | pass | pass |

**R05 Australia: native title**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Meriam land rule belongs to Meriam law | yes | pass | pass |
| Meriam land rule has effect in the Australian order (recognition) | yes | pass | pass |
| Meriam land rule does not thereby become Australian law | no | pass | pass |
| Native title holding is binding precedent in the Australian order | yes | pass | pass |
| Native title is directed at the islands | yes | pass | pass |
| Native title is a right in rem (as against the whole world) | yes | **not expressible** | pass |
| The Meriam people, holding communally, are not thereby a legal person | no | **fail** | pass |

**R06 Malaysia: faraid in a plural system**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Faraid rule belongs to Islamic law as administered in the state | yes | pass | pass |
| Faraid rule has effect in the state order | yes | pass | pass |
| Faraid rule has effect in the federal order (embedding is transitive) | yes | pass | pass |
| Faraid certificate belongs to the Syariah order | yes | pass | pass |
| Daughter's share is directed at the administrator | yes | pass | pass |
| Aisyah is a legal person | yes | pass | pass |

**R07 Canon law and Texas: one wedding, two orders**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| The wedding is a legal act (civil marriage) | yes | pass | pass |
| The tribunal sentence is a declaration of nullity | yes | pass | pass |
| The civil marriage belongs to the Texas order | yes | pass | pass |
| The wedding is void in the canonical order | yes | **not expressible** | pass |
| The wedding is not void in the Texas order | no | **not expressible** | pass |
| Can. 1095 belongs to the canonical order | yes | pass | pass |

**R08 Texas: theft, punishment, restitution**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Restitution is remedial | yes | pass | pass |
| Duty to serve the sentence is a sanction | yes | **not expressible** | pass |
| Duty to serve the sentence is not remedial | no | pass | pass |
| Judgment belongs to the Texas order | yes | pass | pass |
| Duty not to steal is owed to the State | yes | pass | pass |

**R09 United States: patent**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Patent claims belong to the federal order | yes | pass | pass |
| Grant was voidable (claims cancelled after review) | yes | pass | pass |
| Cancellation is an annulment | yes | pass | pass |
| Examiner acts in a representative role | yes | pass | pass |
| Right to exclude is directed at the invention | yes | pass | pass |
| Right to exclude is a right in rem | yes | **not expressible** | pass |
| Damages duty is remedial | yes | pass | pass |
| Infringer's duty is directed at the patentee | yes | pass | pass |

**R10 New Zealand: a river as legal person**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| The river is a legal person | yes | pass | pass |
| The enactment is an incorporation | yes | pass | pass |
| The mill's duty is directed at the river | yes | pass | pass |
| Section 14 belongs to the New Zealand order | yes | pass | pass |

**R11 Magna Carta: documents, versions, papal nullity**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Magna Carta 1215 belongs to the English order | yes | pass | pass |
| The papal bull is a declaration of nullity | yes | pass | pass |
| The 1215 grant is void in the papal order | yes | **not expressible** | pass |
| The 1215 grant is not void in the English order | no | **not expressible** | pass |
| The 1215 grant is a legal act | yes | pass | pass |
| Chapter 29 belongs to the English order | yes | pass | pass |
| The later Act is a repeal | yes | pass | pass |

**R12 Artificial agents: UETA, DABUS**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Shop LLC is a legal person | yes | pass | pass |
| The pricing agent is not a legal person | no | pass | pass |
| Sale terms belong to the Texas order | yes | pass | pass |
| The buyer's duty is directed at Shop LLC | yes | pass | pass |
| The DABUS applications are not legal acts | no | pass | pass |
| DABUS is not a legal person | no | pass | pass |

**R13 Laws of Hammurabi**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| Law 196 belongs to the Old Babylonian order | yes | pass | pass |
| The stele is a legal document | yes | pass | pass |
| Talionic liability is a sanction | yes | **not expressible** | pass |
| Talionic liability is directed at the victim | yes | pass | pass |

**R14 International commercial arbitration**

| Question | Expected | Round 1 | Round 2 |
|---|---|---|---|
| The award belongs to the English order (seat) | yes | pass | pass |
| The award has effect in the U.S. order (New York Convention) | yes | pass | pass |
| The arbitrator bears an adjudicator role | yes | pass | pass |
| The arbitrator's power is adjudicative | yes | pass | pass |
| The enforcement ruling belongs to the U.S. order | yes | pass | pass |
