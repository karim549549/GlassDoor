# 📘 Master Product Requirements Document (PRD) & Technical Blueprint
**Project**: Devs Arena Platform  
**Document Version**: 10.0 (Positioning Correction — Community First, Marketplace Later)  
**Classification**: High-Priority Product & Architecture Specification  
**Lead Authors**: Senior Business Developer & Principal Systems Architect  
**Status**: APPROVED FOR IMPLEMENTATION  

> **v10.0 changes positioning, not architecture.** No schema, endpoint or enum in sections 2–11 is altered. What changed is what the platform is *sold as*, and to whom, in which order — see **§1.2** and **§1.3**. Versions up to 9.0 described a skill-based hiring platform; the product that exists is a community coding-challenge platform, and the hiring machinery is its future revenue rather than its current pitch. Every implementer who read 9.0 built employer-facing copy for a developer-facing audience, which is the drift §1.2 exists to stop.

---

## 1. Document Overview & Strategic Mission

### 1.1 Executive Summary & Target Market Focus (Egypt)
**Devs Arena** is a **community coding-challenge platform** for the **Egyptian tech ecosystem** — anyone can create a timed team arena around a playful brief, run it online or at a physical venue, and have entries judged by named engineers who explain their verdicts in writing.

In one line: **Codeforces, for playful build challenges, community-run.**

Following the **Codeforces/Kaggle philosophy**, it runs on **time-boxed coding execution ("Build, Not Claim")**. Every judged result also produces a durable, verifiable record of what a developer built — which is the foundation of the platform's future revenue, but is **not** how the platform is sold to the people who enter it.

---

### 1.2 Positioning & Phasing — READ BEFORE WRITING PRODUCT COPY

> **This section overrides the emphasis of the rest of this document.** Sections 2–11 specify the credential, rating and employer machinery in depth because that engineering is intricate and needed writing down. That depth is not a statement of priority, and it has repeatedly misled implementers into leading with a hiring pitch on surfaces aimed at competitors.

#### The audience, today

The people arriving now are developers who want a fun, competitive Saturday — the **Codeforces / Kaggle / Advent of Code** audience. **They are not job hunting.** They enter for the fun of the brief, a team to enter with, the people they meet, prize money and a rating to climb.

#### Why the ordering is load-bearing

A hiring credential has no value without a critical mass of competitors producing judged work. Telling a casual entrant that everything they do becomes a permanent public record, judged by named judges, that recruiters will read, describes a job interview with an audience — and it suppresses precisely the participation the credential depends on.

The sequence is therefore **game → density → marketplace**, which is the order Codeforces, Kaggle, TopCoder and Advent of Code all followed. None of them opened with an employer pitch; companies arrived after the community existed.

#### What the differentiator actually is

Not a show — there isn't one (§1.3). Against pure-algorithm sites the difference is the **kind of thing you build and who you build it with**: a playful open-ended brief instead of an algorithm puzzle, a team instead of a solo submission, and a human verdict that explains itself instead of a green checkmark.

**Human judges with mandatory written reasoning were specified for scoring integrity, but that reasoning is also the platform's only native content.** An auto-graded competitor has no equivalent — there is nothing to read after a test suite passes. Judge reasoning is already stored and already mandatory; it is the cheapest content the platform will ever have, and it is currently visible only inside a proof packet framed for recruiters.

#### Phase map

| Phase | Sold as | Primary surfaces | Employer machinery |
|---|---|---|---|
| **1 — now** | A community challenge board with prize money | Arenas, briefs, teams, leaderboard, connections | Built and working, kept out of primary nav and off the hero |
| **2 — at density** | Same, plus "your record is worth something" | Adds prominent proof packets | Employer surfaces surfaced, feature-flagged on |
| **3 — revenue** | Hiring pipeline as a paid product | `/companies`, `/recruiter` promoted | Monetised |

**Nothing in phase 2 or 3 is deleted or deferred in code.** It is built, tested and reachable — it simply must not dominate what a first-time visitor reads.

#### Copy rules that follow from this

- Lead with the brief itself, teams, people, prize money, rating and rivalry. **Never with employability, and never with a show that does not exist.**
- The proof packet is a **souvenir the entrant may keep**, not the reason to enter. Mention once, framed as theirs.
- Never describe the platform to a developer as a hiring, screening or assessment tool.
- Employer-facing language belongs on employer-facing pages, and nowhere else.

---

### 1.3 The Format — What an Arena Actually Is

#### The reference

The product's format follows **CodeTV's _Web Dev Challenge_** (`https://codetv.dev/series/web-dev-challenge`) — an independent show, referenced here as a format model only; there is no affiliation. Its shape:

- A **brief** is given to the teams
- A window to **plan**, then a window to **build** (the show's own example is 30 minutes then 4 hours — an example, not a specification)
- Small **teams**, not solo
- The episode ends with teams **demoing what they made**
- Briefs are deliberately playful — *"the most devious video player"*, *"a site with zero business value"*, *"build a game playable on at least 2 devices"*, *"indulge your worst developer impulses"*

**Episodes do not map one-to-one onto `Arena` records.** The show is the *template for what an arena is*, not a catalogue to mirror. Do not model an `Episode` entity against it.

#### What Devs Arena adds — and this is the whole positioning

_Web Dev Challenge_ is something you **watch**. Its participants are invited.

**Devs Arena is that format, open to enter, run both online across the platform and offline at physical venues.** That is the product in one sentence, and it is why the Egypt-centric venue and geocoding architecture in §2 exists — offline arenas are a first-class mode, not an afterthought.

The line to lead with is closer to: *you cannot join Web Dev Challenge — you can join this one.*

#### The phase windows already are the format

`ideaPhaseStart/End` followed by `implPhaseStart/End` is not generic scheduling — it is the plan window and the build window, already modelled. Format presets belong in those existing windows rather than in new fields.

**The lengths are set by whoever creates the arena.** This is a marketplace, not a single fixed-length product. An earlier draft of this section read as though "30 minutes then 4 hours" were the specification; it is the reference show's example. That misreading reached nineteen user-facing strings — including the page title, meta description, OG image, JSON-LD and the homepage's largest sentence — all of which described a four-hour platform. Duration is **per-arena data**, and the board showing a real spread of clocks is better product than a uniform claim. `lib/arena/schedule-presets.ts` ships Classic (30/240), Sprint, Marathon and Custom.

#### The tone gap — the most actionable finding in this document

The reference format's briefs are jokes. The platform's own copy currently reads *"unforgeable hiring credentials"*, *"rubric frozen before entry"*, *"a conflict-of-interest database trigger"*. These describe the same activity from opposite universes, and the second one is what a first-time visitor currently sees.

**Arena briefs and platform copy should sound like those briefs**: playful, specific, a little absurd. The integrity machinery is real and worth keeping, but it is plumbing — it belongs in documentation and on employer surfaces, not in the voice the product speaks to entrants.

Note also that the reference format barely emphasises winning; it ends in a **demo**, and the interest is in what people made. The platform has built an elaborate scoring, rating and appeals apparatus. That apparatus is correct for the phase-2 credential and should be kept, but it should not be presented to entrants as the point of taking part. **The demo is the point.**

#### There is no Devs Arena show, and the product is not one

**Devs Arena has no YouTube channel and no episodes.** An earlier draft of this section claimed a live series that was the primary acquisition channel; that was wrong and is retracted. Nothing in the product or its copy may imply a back catalogue, a broadcast, or footage that does not exist.

The relationship to _Web Dev Challenge_ is **tone and format only**: the kind of brief, the plan-then-build shape, the team size, the demo at the end. Not the production.

#### What the product is instead

**Codeforces, for playful build challenges — community-run.**

Anyone can create an arena. The platform supplies the format, the clock, the teams, the judging and the board; the community supplies the briefs and the entries. There is no producer, no invite list, and no filming.

What developers come for, in order: **fun, people, and a reason to build something silly on a weekend.** Networking is an explicit product goal, not a side effect — see §6.2's connection graph, which is a phase-1 concern and currently under-surfaced.

#### Content still accrues, without a camera

An arena that has ended is currently a dead record, and that is the real gap — not missing video. A finished arena already contains everything worth revisiting: the brief, what each team shipped, and the judges' reasoning.

`JudgeVerdict.feedbackText` and every `JudgeScore.justification` are already captured, already mandatory and cannot be empty. They are the most interesting prose the platform produces, and they are currently visible only inside a proof packet, framed as evidence for recruiters — when they are also, simply, **good reading**.

Surfacing them costs almost nothing, uses data that already exists, needs no channel, and answers the cold-start problem: a board with no history is unconvincing, whereas an archive of past challenges and what judges said about them is evidence the thing is real — and it reads as evidence to entrants and companies at once, without claiming any scale.

| Surface | Cost | Purpose |
|---|---|---|
| Judge reasoning as readable content | Low — data already stored | The archive; the best writing on the platform |
| Past arenas as browsable challenges | Low | Cold-start answer; every brief is a reason to visit |
| Community brief creation, made prominent | Low — `/arena/create` exists | The core loop; the platform's supply |
| Connection graph surfaced (§6.2) | Medium | "Network with people" is a stated goal, currently buried |

---

### 1.4 Revenue Model — Developers Never Pay

**Two sides, one of which is monetised:**

| Side | Pays | Role |
|---|---|---|
| **Developers** | Never | The supply. Free forever, in every phase. |
| **Companies** | Yes — the only revenue | The customer. Hiring access, hosted arenas, sponsorship. |

This is the sharpest reason the phasing in §1.2 is not a matter of taste.

**Developers are not customers; they are the inventory.** What a company eventually pays for is access to a population of developers with judged work attached. That population is the asset, and it is built by participation volume — so every developer-facing decision optimises for **participation and retention**, never for conversion-to-payment, because there is no payment to convert to.

It follows that copy which suppresses participation destroys revenue *upstream*, before any company is ever asked for money. Framing arenas as assessed, permanent and recruiter-visible is precisely such copy: it is unattractive to someone deciding how to spend a Saturday, and it is the single most expensive mistake available here — it damages the only asset the business sells, in order to advertise a product that is not yet for sale.

**Sell fun to developers. Sell developers to companies. Never the reverse, and never both on the same page.**

---

## 2. Egypt-Centric Geocoding & Venue Resolution Architecture

Instead of rigid, static city enums, locations across Egypt (for In-Person Arenas, Companies, and Developers) are dynamically resolved via **Google Places / Map Geocoding Services**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Host selects "IN_PERSON" & provides Google Maps Pin URL  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Automated Geocoding Service parses the location details: │
│    • locationName: "Smart Village, Building B12, Giza"      │
│    • governorate: "Giza"                                    │
│    • country: "Egypt"                                       │
│    • googleMapsUrl: "https://maps.google.com/?q=..."       │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Supported Egyptian Tech Hubs & Venues
- **Cairo Hubs**: New Cairo, Maadi Tech Ridge, Nasr City, Downtown Greek Campus.
- **Giza Hubs**: Smart Village, 6th of October, Dokki.
- **Alexandria Hubs**: Smouha, Sidi Gaber, Borg El Arab Tech Park.
- **Delta & Upper Egypt**: Mansoura Tech Hub, Tanta, Assiut Silicon Waha.
- **Remote / Online**: Virtual arenas across all Egyptian governorates.

---

## 3. Standardized Platform Enums & Taxonomy Catalog

### 3.1 Industry & Vertical Classification (`IndustryType`)
```prisma
enum IndustryType {
  FINTECH
  ARTIFICIAL_INTELLIGENCE
  HEALTH_TECH
  E_COMMERCE
  ED_TECH
  LOGISTICS_SUPPLY_CHAIN
  CYBERSECURITY
  DEVELOPER_TOOLS
  GAMING_ENTERTAINMENT
  ENTERPRISE_SAAS
  TELECOMMUNICATIONS
  GREEN_TECH
  OTHER
}
```

### 3.2 Company Size & Scale (`CompanySize`)
```prisma
enum CompanySize {
  SEED          // 1–10 employees
  STARTUP       // 11–50 employees
  GROWTH        // 51–200 employees
  MID_MARKET    // 201–1,000 employees
  ENTERPRISE    // 1,000+ employees
}
```

### 3.3 Arena Technical Domain (`ArenaDomain`)
```prisma
enum ArenaDomain {
  FULL_STACK_WEB
  BACKEND_DISTRIBUTED
  FRONTEND_MOBILE
  AI_MACHINE_LEARNING
  DATA_ENGINEERING
  CYBERSECURITY_ETHICAL_HACKING
  SYSTEMS_DEV_OPS
  EMBEDDED_IOT
  BLOCKCHAIN_WEB3
}
```

### 3.4 Developer Seniority Level (`SeniorityLevel`)
```prisma
enum SeniorityLevel {
  ENTRY_LEVEL   // 0–2 years
  MID_LEVEL     // 2–5 years
  SENIOR_LEVEL  // 5–8 years
  LEAD_STAFF    // 8+ years
}
```

### 3.5 Work Availability Status (`WorkAvailability`)
```prisma
enum WorkAvailability {
  ACTIVELY_LOOKING      // Ready for immediate interview & hire
  OPEN_TO_OFFERS        // Passively exploring
  OPEN_TO_SQUADS_ONLY   // Competing for XP / Fun only
  NOT_AVAILABLE         // Employed / Unavailable
}
```

### 3.6 Prize Currency (`PrizeCurrency`)
```prisma
enum PrizeCurrency {
  EGP
  USD
  EUR
  SAR
  AED
}
```

### 3.7 Dispute & Report Category (`DisputeCategory`)
```prisma
enum DisputeCategory {
  PLAGIARISM_STOLEN_CODE
  RULE_VIOLATION
  BROKEN_OR_FAKE_SUBMISSION
  ABUSIVE_HARASSMENT
  SPAM_OR_OFF_TOPIC
}
```

---

## 4. Multi-Tenant Corporate Architecture & Context Switching

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ACTIVE USER CONTEXT SWITCHER                       │
│                                                                         │
│  [ Active Context: Coon Cluster AI (Enterprise) ▾ ]                     │
│  ├── 🏢 Coon Cluster (Role: Recruiter)                                  │
│  ├── 🏢 Vodafone Egypt (Role: Billing Manager)                          │
│  └── 👤 Personal Profile (Role: Developer / Contestant)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Multi-Company Membership
A single developer account can be associated with multiple companies simultaneously while retaining an independent personal contestant profile.

### 4.2 Company Corporate Sub-Roles
1. **`COMPANY_OWNER` / `COMPANY_ADMIN`**: Full company settings control, hiring arena creation, recruiter seat allocation, member management.
2. **`RECRUITER`**: Access to candidate pipelines (`/recruiter/pipeline`), code inspection, candidate tagging, and contact export.
3. **`BILLING_MANAGER`**: Access to subscription invoices, seat limits, plan upgrades, and payment settings.

---

## 5. Granular Roles & Permissions Architecture (RBAC 2.0)

### 5.1 Granular Permissions Catalog
- **Arena Permissions**: `arena:create_official`, `arena:create_company`, `arena:create_community`, `arena:edit`, `arena:delete`, `arena:manage_disputes`.
- **Recruiter CRM Permissions**: `recruiter:view_pipeline`, `recruiter:inspect_code`, `recruiter:export_contacts`, `recruiter:tag_candidates`.
- **Company Management Permissions**: `company:manage_profile`, `company:invite_members`, `company:remove_members`, `company:assign_roles`.
- **Billing Permissions**: `billing:view_invoices`, `billing:manage_subscription`, `billing:upgrade_seats`.

### 5.2 Endpoint: `/api/auth/me`
Returns the active session authorization payload:
```json
{
  "user": { "id": "uuid", "handle": "alex_dev", "email": "alex@coon.ai" },
  "activeCompany": { "id": "uuid", "name": "Coon Cluster", "role": "RECRUITER" },
  "permissions": [
    "arena:create_company",
    "recruiter:view_pipeline",
    "recruiter:inspect_code",
    "recruiter:export_contacts"
  ]
}
```

---

## 6. Developer Profile Standards & The "Dev Graph"

### 6.1 Developer Profile Standards (`/profile/[handle]`)
1. **Verified OAuth Connections**: GitHub OAuth (commits, repos) + LinkedIn OAuth (verified identity).
2. **Yearly Activity Heatmap**: Punch-card grid visualizing contest participation, problem solutions, and code submissions.
3. **Arena Placements & Trophies**: Digital trophy cabinet (`🥇 1st Place - Cairo Cyberpunk Battle`, `🥈 Top 5% System Architect`).
4. **Verified Skill Radar**: Verified skill ratings automatically derived from completed arena tech tags.
5. **Work Availability Status**: `WorkAvailability` enum.

### 6.2 The Developer Connection Graph (`[ ⚡ CONNECT ]`)
- **1-Click Connect**: Connect with developer peers across Egypt.
- **Squad Auto-Suggest**: Connected peers appear at the top of squad matchmaking invite lists.
- **Viral FOMO Alerts**: Notifications when connections register for high-stakes arenas (`"Ahmed and 2 connections registered for Cairo Battle!"`).

---

## 7. Arena Architecture, Governance & Prize Pools

### 7.1 Three-Tier Authority Matrix

| Authority Tier | Permitted Creator | Visual Badge | Global XP? | Cash Prize Eligible? |
| :--- | :--- | :--- | :---: | :---: |
| **`OFFICIAL`** | Platform Superadmins | Gold `[ OFFICIAL ARENA ]` | 🟢 **FULL XP** | 🟢 **YES** |
| **`COMPANY`** | Verified Corporate Accounts | Blue `[ COMPANY ARENA ]` | 🟢 **FULL XP** | 🟢 **YES** (Paid Tier) |
| **`COMMUNITY`** | Any Developer Contestant | Neutral `[ COMMUNITY ARENA ]` | 🔴 **0 XP** (Anti-Cheat) | 🔴 **BLOCKED (V1)** |

### 7.2 Non-Custodial Prize Pool Legal Shield
- **Prize Fields**: `hasPrizePool`, `totalPrizePool`, `prizeCurrency` (`PrizeCurrency` enum, default: `EGP`), `firstPlacePrize`, `secondPlacePrize`, `thirdPlacePrize`.
- **Non-Custodial Legal Disclaimer**:
  > ⚖️ **Legal Notice**: *Prize fulfillment, tax obligations, and monetary disbursements are sponsored and managed directly by the Arena Organizer/Company. Devs Arena operates strictly as the technical evaluation and leaderboard platform.*

---

## 8. Mathematical Difficulty Scale & Real-Time State Machine

### 8.1 Mathematical XP Formula
$$\text{Total Earned XP} = \Big( \text{Base XP} \times \text{Difficulty Multiplier} \times \text{Placement Multiplier} \Big) + \text{Participation Bonus}$$

```
┌──────────────────┬──────────┬────────────┬────────────────────────────────────────────┐
│ Difficulty Tier  │ Base XP  │ Multiplier │ Technical Complexity & Scope               │
├──────────────────┼──────────┼────────────┼────────────────────────────────────────────┤
│ NOVICE           │ 100 XP   │ 1.0x       │ Basic CRUD, Algorithmic Katas, UI Design   │
│ INTERMEDIATE     │ 250 XP   │ 1.5x       │ Full-stack integrations, Auth, Caching     │
│ ADVANCED         │ 600 XP   │ 2.5x       │ Distributed microservices, WebSockets      │
│ GRANDMASTER      │ 1,500 XP │ 4.0x       │ Consensus algorithms, High-throughput systems│
└──────────────────┴──────────┴────────────┴────────────────────────────────────────────┘
```

### 8.2 Automated Timestamp State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Host creates arena
    DRAFT --> REGISTRATION_OPEN: now >= registrationStart
    REGISTRATION_OPEN --> IDEA_PHASE: now >= registrationEnd
    IDEA_PHASE --> IMPLEMENTATION_PHASE: now >= ideaPhaseEnd (Live Coding Battle)
    IMPLEMENTATION_PHASE --> UNDER_JUDGING: now >= implPhaseEnd (Submissions Locked)
    UNDER_JUDGING --> COMPLETED: Judges publish scores & leaderboard
    COMPLETED --> [*]
```

---

## 9. Comprehensive Database Schema (Prisma Data Model)

```prisma
enum Role {
  USER
  ADMIN
}

enum CompanyRole {
  OWNER
  ADMIN
  RECRUITER
  BILLING_MANAGER
}

enum ArenaAuthority {
  OFFICIAL
  COMPANY
  COMMUNITY
}

enum ArenaIntent {
  HIRING_ASSESSMENT
  BRAND_HACKATHON
  COMMUNITY_FUN
}

enum DifficultyTier {
  NOVICE
  INTERMEDIATE
  ADVANCED
  GRANDMASTER
}

enum IndustryType {
  FINTECH
  ARTIFICIAL_INTELLIGENCE
  HEALTH_TECH
  E_COMMERCE
  ED_TECH
  LOGISTICS_SUPPLY_CHAIN
  CYBERSECURITY
  DEVELOPER_TOOLS
  GAMING_ENTERTAINMENT
  ENTERPRISE_SAAS
  TELECOMMUNICATIONS
  GREEN_TECH
  OTHER
}

enum CompanySize {
  SEED
  STARTUP
  GROWTH
  MID_MARKET
  ENTERPRISE
}

enum ArenaDomain {
  FULL_STACK_WEB
  BACKEND_DISTRIBUTED
  FRONTEND_MOBILE
  AI_MACHINE_LEARNING
  DATA_ENGINEERING
  CYBERSECURITY_ETHICAL_HACKING
  SYSTEMS_DEV_OPS
  EMBEDDED_IOT
  BLOCKCHAIN_WEB3
}

enum SeniorityLevel {
  ENTRY_LEVEL
  MID_LEVEL
  SENIOR_LEVEL
  LEAD_STAFF
}

enum WorkAvailability {
  ACTIVELY_LOOKING
  OPEN_TO_OFFERS
  OPEN_TO_SQUADS_ONLY
  NOT_AVAILABLE
}

enum PrizeCurrency {
  EGP
  USD
  EUR
  SAR
  AED
}

enum LocationType {
  ONLINE
  IN_PERSON
}

enum ArenaStatus {
  DRAFT
  REGISTRATION_OPEN
  IDEA_PHASE
  IMPLEMENTATION_PHASE
  UNDER_JUDGING
  COMPLETED
}

model Company {
  id               String            @id @default(uuid()) @db.Uuid
  name             String
  slug             String            @unique
  domain           String            @unique
  logoUrl          String?
  bio              String?           @db.Text
  websiteUrl       String?
  locationName     String?           // e.g. "Smart Village, Building B12, Giza"
  governorate      String?           @default("Cairo")
  country          String            @default("Egypt")
  industry         IndustryType      @default(DEVELOPER_TOOLS)
  size             CompanySize       @default(STARTUP)
  techStack        String[]
  isVerified       Boolean           @default(false)
  
  // Subscriptions & Limits
  subscriptionTier String            @default("FREE")
  maxRecruiters    Int               @default(2)
  
  // Relations
  members          CompanyMember[]
  arenas           Arena[]
  isDeleted        Boolean           @default(false)
  deletedAt        DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  @@map("companies")
}

model CompanyMember {
  id          String        @id @default(uuid()) @db.Uuid
  companyId   String        @db.Uuid
  company     Company       @relation(fields: [companyId], references: [id], onDelete: Cascade)
  userId      String        @db.Uuid
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        CompanyRole   @default(RECRUITER)
  
  inviteToken String?       @unique
  isAccepted  Boolean       @default(false)
  isApproved  Boolean       @default(true)
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@unique([companyId, userId])
  @@map("company_members")
}

model Arena {
  id                       String            @id @default(uuid()) @db.Uuid
  title                    String
  description              String            @db.Text
  authority                ArenaAuthority    @default(COMMUNITY)
  intent                   ArenaIntent       @default(COMMUNITY_FUN)
  difficulty               DifficultyTier    @default(INTERMEDIATE)
  domain                   ArenaDomain       @default(FULL_STACK_WEB)
  
  // Location Architecture
  locationType             LocationType      @default(ONLINE)
  locationName             String?           // e.g. "Greek Campus, Downtown Cairo"
  governorate              String?           @default("Cairo")
  country                  String            @default("Egypt")
  googleMapsUrl            String?
  
  // Host & Access
  creatorId                String            @db.Uuid
  creator                  User              @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  companyId                String?           @db.Uuid
  company                  Company?          @relation(fields: [companyId], references: [id], onDelete: SetNull)
  isPrivate                Boolean           @default(false)
  inviteCode               String?           @unique
  requireHiringConsent     Boolean           @default(false)
  
  // Prize Pool Configuration
  hasPrizePool             Boolean           @default(false)
  totalPrizePool           Float?
  prizeCurrency            PrizeCurrency     @default(EGP)
  firstPlacePrize          Float?
  secondPlacePrize         Float?
  thirdPlacePrize          Float?
  prizeDisbursementTerms   String?           @db.Text
  
  // Timeline Windows
  registrationStart        DateTime
  registrationEnd          DateTime
  ideaPhaseStart           DateTime
  ideaPhaseEnd             DateTime
  implPhaseStart           DateTime
  implPhaseEnd             DateTime
  
  // Squad Limits
  isTeam                   Boolean           @default(false)
  minTeamSize              Int               @default(1)
  maxTeamSize              Int               @default(1)
  maxParticipants          Int?
  allowLeaderAccessControl Boolean?          @default(true)
  
  // Deliverable Checklist
  requireGithubUrl         Boolean           @default(true)
  requireFigmaUrl          Boolean           @default(false)
  requireVideoUrl          Boolean           @default(false)
  requireWriteup           Boolean           @default(true)
  rulesText                String            @db.Text

  // Relations & Soft Delete
  comments                 ArenaComment[]
  teams                    ArenaTeam[]
  submissions              ArenaSubmission[]
  tags                     TagOnArena[]
  isDeleted                Boolean           @default(false)
  deletedAt                DateTime?
  createdAt                DateTime          @default(now())
  updatedAt                DateTime          @updatedAt

  @@map("arenas")
}

model ArenaComment {
  id        String         @id @default(uuid()) @db.Uuid
  arenaId   String         @db.Uuid
  arena     Arena          @relation(fields: [arenaId], references: [id], onDelete: Cascade)
  authorId  String         @db.Uuid
  author    User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parentId  String?        @db.Uuid
  parent    ArenaComment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   ArenaComment[] @relation("CommentReplies")
  content   String         @db.Text
  likes     Int            @default(0)
  isPinned  Boolean        @default(false)
  isDeleted Boolean        @default(false)
  deletedAt DateTime?
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  @@map("arena_comments")
}

model ArenaSubmission {
  id           String     @id @default(uuid()) @db.Uuid
  arenaId      String     @db.Uuid
  arena        Arena      @relation(fields: [arenaId], references: [id], onDelete: Cascade)
  teamId       String?    @db.Uuid
  team         ArenaTeam? @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId       String     @db.Uuid
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  githubUrl    String
  figmaUrl     String?
  videoUrl     String?
  writeupText  String     @db.Text
  score        Float?
  rank         Int?
  feedbackText String?    @db.Text
  
  isDeleted    Boolean    @default(false)
  deletedAt    DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([arenaId, userId])
  @@map("arena_submissions")
}

model UserFollow {
  id          String   @id @default(uuid()) @db.Uuid
  followerId  String   @db.Uuid
  follower    User     @relation("UserFollowers", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String   @db.Uuid
  following   User     @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@unique([followerId, followingId])
  @@map("user_follows")
}
```

---

## 10. REST API Contracts & Endpoints

| Method | Endpoint | Auth Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/me` | `GUEST` / `USER` | Returns current user, active company, roles, and granular permissions list. |
| `POST` | `/api/auth/switch-context` | `USER` | Switches active company context for the session. |
| `GET` | `/api/companies` | `GUEST` | Dynamic directory listing with `IndustryType` and location search filters. |
| `POST` | `/api/companies` | `USER` | Creates a new company with domain verification token. |
| `POST` | `/api/companies/[id]/invite` | `COMPANY_ADMIN`| Invites a recruiter/billing manager via email double-handshake. |
| `POST` | `/api/arena` | `USER` | Creates an arena with authority, difficulty, domain, prize pool, and timeline. |
| `GET` | `/api/arena` | `GUEST` | Dynamic listing with keyword search, authority, and domain filters. |
| `GET` | `/api/arena/[id]/comments` | `GUEST` | Fetches nested discussion threads with upvotes and host pins. |
| `POST` | `/api/arena/[id]/comments` | `USER` | Posts a top-level comment or nested reply. |
| `POST` | `/api/arena/[id]/teams` | `USER` | Creates a squad lobby with privacy mode and meeting URL. |
| `POST` | `/api/arena/[id]/submit` | `USER` | Submits final deliverables (GitHub, Video, Writeup). |
| `POST` | `/api/user/[id]/follow` | `USER` | Connects/Follows another developer in the Dev Network. |
| `GET` | `/api/recruiter/pipeline` | `RECRUITER` | Retrieves candidate code submissions, scores, and contacts. |

---

## 11. Explicit Non-Goals (Scope Boundary)

To protect solo founder bandwidth and guarantee rapid launch:
- ❌ Built-in WebSocket Text/Voice Chat (delegated to unlocked external meeting rooms).
- ❌ In-App Payment Processing Gateways (monetized via direct enterprise invoice/sponsorship).
- ❌ Video Transcoding Servers (handled via external YouTube/Loom demo links).
- ❌ Two-Factor SMS Authentication (deferred to Post-MVP).
