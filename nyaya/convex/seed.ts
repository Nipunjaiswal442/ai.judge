import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { CATEGORY_QUESTIONS } from "../lib/caseCategories";

// Prototype matters used to exercise the full pipeline: both sides' Q&A is
// pre-filled and submitted, so the case lands READY_FOR_BRIEF and the brief /
// bench-assistant flows can be demonstrated immediately.
const PROTOTYPES = [
  {
    category: "DEFECTIVE_GOODS",
    complainantName: "Suresh Menon",
    opposingPartyName: "Zenith Electronics Pvt. Ltd.",
    claimAmount: 84990,
    jurisdiction: "Ernakulam, Kerala",
    reliefSought:
      "Full refund of ₹84,990 for the defective refrigerator, ₹15,000 compensation for spoiled goods and mental agony, and litigation costs.",
    complainantAnswers: [
      "The double-door refrigerator (Zenith FrostPro 450L) stopped cooling entirely within six weeks of purchase. The compressor makes a loud clicking sound and the cabinet temperature never falls below 19°C.",
      "The unit was purchased on 12 March 2026 from Zenith's authorised dealer in Kochi. The cooling failure was first noticed on 25 April 2026 and reported the same day.",
      "Yes. I hold the original tax invoice (No. ZEN/KOC/2026/1174 dated 12/03/2026) and the stamped 2-year comprehensive warranty card.",
      "No. The unit has not been moved, repaired, or opened by anyone except Zenith's own authorised technician, who inspected it on 28 April 2026.",
      "I raised service request SR-88213 on 25 April 2026. The technician acknowledged a compressor fault in writing, but the company has since only offered a paid repair, claiming 'voltage damage' without any test report.",
      "I seek a full refund of the purchase price with 9% interest, ₹15,000 as compensation for spoiled perishables and mental agony, and costs of this complaint.",
    ],
    opposingAnswers: [
      "We are the manufacturer of the product. The retail sale was made through an independent authorised dealer.",
      "The product carries a 2-year comprehensive warranty. However, clause 7(c) excludes damage caused by abnormal voltage conditions.",
      "Our technician's inspection report dated 28 April 2026 records burn marks on the compressor relay consistent with a voltage surge at the installation site, not a manufacturing defect.",
      "The warranty terms require use of a voltage stabiliser in areas with known fluctuation. The complainant confirmed to our technician that no stabiliser was installed.",
      "We offered a discounted repair (compressor and relay replacement at 40% of cost) as a goodwill gesture on 2 May 2026, which the complainant declined.",
      "Yes. Every unit undergoes a 14-point pre-dispatch quality check; the QC certificate for this serial number (ZF450-26-08811) is available and will be produced.",
    ],
  },
  {
    category: "ECOMMERCE_DISPUTES",
    complainantName: "Anita Deshpande",
    opposingPartyName: "QuickKart Marketplace Ltd.",
    claimAmount: 46500,
    jurisdiction: "Pune, Maharashtra",
    reliefSought:
      "Refund of ₹46,500 paid for the undelivered laptop, ₹10,000 compensation for deficiency in service, and an order directing the platform to disclose the seller's details.",
    complainantAnswers: [
      "The transaction was conducted on the QuickKart marketplace mobile application on 3 February 2026, order ID QK-2026-778812.",
      "Non-delivery. The order status showed 'Delivered' on 9 February 2026, but no package was ever received. The OTP-based delivery confirmation was never requested from me.",
      "No. The product listing showed only the storefront name 'MegaDeals Retail' with no registered address, and the return policy link led to a generic page.",
      "Yes. I raised ticket GRV-119043 with the grievance officer on 10 February 2026 and sent two follow-up emails on 17 and 24 February. Only automated acknowledgments were received.",
      "The seller rejected my refund request stating the courier's proof-of-delivery scan, but refused to share the delivery photo, signature, or OTP log despite repeated requests.",
      "I hold both liable: the seller for non-delivery and QuickKart as the marketplace for failing its grievance-redressal obligations under the e-commerce rules.",
    ],
    opposingAnswers: [
      "We operate as a marketplace e-commerce entity; the goods are sold by independent third-party sellers who list on our platform.",
      "Yes. The order was processed per our Terms of Use, and the logistics partner's records show a delivery scan at the complainant's pin code on 9 February 2026.",
      "Ticket GRV-119043 was escalated to the seller within 48 hours as required. The seller responded with proof-of-delivery, after which the ticket was closed with intimation to the buyer.",
      "The seller fulfilled dispatch obligations per courier records. As an intermediary we rely on safe-harbour protection, having exercised due diligence under the applicable rules.",
      "The cancellation and refund policy specific to this listing was displayed on the product page and at checkout, and was accepted by the buyer before payment.",
      "We produced the courier tracking log, escalated within SLA, and offered a ₹500 goodwill voucher. A re-investigation with the courier was opened once this complaint was received.",
    ],
  },
] as const;

function extractStateCode(jurisdiction: string): string {
  const trimmed = jurisdiction.trim().toUpperCase();
  const afterComma = trimmed.split(",").pop()?.trim() || trimmed;
  const words = afterComma.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "IN";
  if (words.length === 1) return words[0].slice(0, 2);
  return (words[0][0] + words[1][0]).slice(0, 2);
}

export const seedPrototypeCase = mutation({
  args: { lawyerId: v.id("users") },
  handler: async (ctx, args) => {
    const lawyer = await ctx.db.get(args.lawyerId);
    if (!lawyer) throw new Error("Lawyer not found");
    if (lawyer.role !== "LAWYER") throw new Error("Only counsel accounts can load prototype cases.");

    const mySide = lawyer.counselType === "OPPOSING" ? "OPPOSING" : "COMPLAINANT";

    // Demo counterpart counsel for the other side of the bar.
    const counterpartEmail =
      mySide === "COMPLAINANT" ? "demo.opposing@nyaya.demo" : "demo.complainant@nyaya.demo";
    let counterpart = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", counterpartEmail))
      .unique();
    if (!counterpart) {
      const counterpartId = await ctx.db.insert("users", {
        email: counterpartEmail,
        name: mySide === "COMPLAINANT" ? "Adv. Kavya Nair (Demo)" : "Adv. Rohan Gupta (Demo)",
        role: "LAWYER",
        counselType: mySide === "COMPLAINANT" ? "OPPOSING" : "COMPLAINANT",
        barCouncilId: mySide === "COMPLAINANT" ? "KAR/2214/2015" : "MAH/1873/2012",
        jurisdiction: "DCDRC",
        authId: `demo-${mySide === "COMPLAINANT" ? "opposing" : "complainant"}`,
      });
      counterpart = await ctx.db.get(counterpartId);
    }
    if (!counterpart) throw new Error("Could not prepare demo counterpart counsel.");

    const all = await ctx.db.query("cases").collect();
    const proto = PROTOTYPES[all.length % PROTOTYPES.length];

    const year = new Date().getFullYear();
    const prefix = `CPA-${year}-DCDRC-${extractStateCode(proto.jurisdiction)}-`;
    const nextSeq = (all.filter((c) => c.humanId.startsWith(prefix)).length + 1)
      .toString()
      .padStart(4, "0");

    const caseId = await ctx.db.insert("cases", {
      humanId: `${prefix}${nextSeq}`,
      category: proto.category,
      complainantLawyerId: mySide === "COMPLAINANT" ? args.lawyerId : counterpart._id,
      opposingLawyerId: mySide === "OPPOSING" ? args.lawyerId : counterpart._id,
      complainantName: proto.complainantName,
      opposingPartyName: proto.opposingPartyName,
      claimAmount: proto.claimAmount,
      jurisdiction: proto.jurisdiction,
      reliefSought: proto.reliefSought,
      status: "READY_FOR_BRIEF",
      deadline: Date.now() + 1000 * 60 * 60 * 24 * 30,
    });

    const questions = CATEGORY_QUESTIONS[proto.category];
    const sides = [
      { side: "COMPLAINANT" as const, qs: questions.complainant, answers: proto.complainantAnswers },
      { side: "OPPOSING" as const, qs: questions.opposing, answers: proto.opposingAnswers },
    ];

    for (const s of sides) {
      const sessionId = await ctx.db.insert("qaSessions", {
        caseId,
        side: s.side,
        status: "SUBMITTED",
        submittedAt: Date.now(),
      });
      for (let i = 0; i < s.qs.length; i++) {
        await ctx.db.insert("qaEntries", {
          sessionId,
          orderIndex: i,
          questionText: s.qs[i],
          answerText: s.answers[i],
          attachmentIds: [],
          aiFollowUpNeeded: false,
        });
      }
    }

    await ctx.db.insert("auditLogs", {
      userId: args.lawyerId,
      action: "PROTOTYPE_CASE_SEEDED",
      entityType: "case",
      entityId: caseId,
      timestamp: Date.now(),
    });

    return caseId;
  },
});
