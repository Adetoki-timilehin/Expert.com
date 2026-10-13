# SpeciaList MVP foundations

This document records the product decisions that the validation MVP will build against. Changes to these rules should be deliberate because they affect client copy, expert operations, payments, and trust.

## Core proposition

Clients can quickly reach a trustworthy expert, while qualified experts can efficiently earn from focused consultations.

## Roles and user-facing language

- **Client** — a person seeking expert help.
- **Expert Applicant** — a professional whose application is incomplete or under review.
- **Verified Expert** — an approved professional with category-specific evidence.
- **Academy Candidate** — a learner completing an eligible SpeciaList pathway.
- **Academy Expert** — a person who completed a named SpeciaList Academy pathway and its supervised requirements. This is always shown as an internal Academy achievement, never as an external professional qualification.

The initial role choices use actions instead of marketplace terminology:

- **I need expert help**
- **I provide expert help**

The expert journey then asks whether the person already has relevant professional expertise or wants to build expertise through a structured pathway. “Mini-expert” is not used publicly.

## Initial categories

| Category | Risk profile | Validation MVP purpose | Academy eligible |
| --- | --- | --- | --- |
| Childcare and nannies | Safeguarding-sensitive | Primary detailed client and expert journey | No platform-only qualification |
| Emergency plumbing | Safety-critical trade | Demonstrates urgent, category-aware intake | No platform-only qualification |
| Career application support | Lower-risk guidance | Demonstrates an Academy pathway | Yes |

## Consultation offer

- £25 one-off consultation.
- Up to 30 minutes of secure text consultation.
- Written summary and recommended next steps.
- One follow-up within 24 hours.
- No subscription is required.

Voice, video, in-person work, subscriptions, bidding, and negotiated pricing are outside the validation MVP.

## Payment lifecycle

1. The client submits a request and authorises £25.
2. SpeciaList searches for an eligible, available expert.
3. The payment is captured only when an expert accepts.
4. If no expert accepts, the authorisation is released.
5. Completed consultations create a pending expert payout.

The validation MVP simulates these states and does not take real payment.

## Client request lifecycle

`draft → reviewed → payment_authorised → matching → matched → active → completed`

Alternative terminal states are `cancelled`, `no_expert_available`, `payment_failed`, and `disputed`.

## Expert application lifecycle

`draft → submitted → under_review → approved`

Review can branch to `more_information_required`, `declined`, or `suspended`. Approval is category-specific and does not imply eligibility for every request.

## Trust rules

- A generic verified badge must not conceal what was checked.
- Each credential states whether it is self-reported, document-reviewed, registry-checked, or earned through SpeciaList.
- Academy Expert status does not replace regulated or external professional qualifications.
- Academy Candidates only handle eligible low-risk requests with clear client consent and defined supervision.
- Experts can decline any request that is outside their competence.
- Safety, reporting, dispute, and support routes remain visible during a consultation.

## Initial verification requirements

### Childcare and nannies

- Identity
- Enhanced DBS
- Paediatric first aid
- Safeguarding training
- Employment history and references
- Insurance where required

### Emergency plumbing

- Identity and business details
- Public liability insurance
- Relevant trade qualifications
- Gas Safe registration when gas work is offered
- Service area and emergency availability

### Career application support

- Identity
- Relevant experience or an eligible Academy pathway
- Scenario assessment
- Practical assignment
- Supervised consultations for Academy candidates

## Validation boundary

The first shared build uses deterministic demo identities, documents, messages, payment states, and application decisions. Testers are never asked to provide real identity documents, banking information, or payment credentials.
