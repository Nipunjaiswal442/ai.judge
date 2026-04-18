export const CASE_CATEGORIES = [
  { id: "DEFECTIVE_GOODS", label: "Defective goods" },
  { id: "DEFICIENT_SERVICES", label: "Deficient services" },
  { id: "UNFAIR_TRADE_PRACTICES", label: "Unfair trade practices" },
  { id: "ECOMMERCE_DISPUTES", label: "E-commerce disputes" },
  { id: "MISLEADING_ADVERTISEMENTS", label: "Misleading advertisements" },
  { id: "MEDICAL_NEGLIGENCE_CONSUMER", label: "Medical negligence (consumer angle)" },
];

export const CATEGORY_QUESTIONS: Record<string, { complainant: string[], opposing: string[] }> = {
  DEFECTIVE_GOODS: {
    complainant: [
      "What is the exact nature of the defect in the goods purchased?",
      "When was the defect first noticed, and when was the purchase made?",
      "Do you have the original invoice and warranty card?",
      "Has the product been altered, repaired, or tampered with since purchase?",
      "Did you communicate the defect to the seller/manufacturer? What was their response?",
      "What specific relief are you seeking (replacement, refund, or compensation for damages)?",
    ],
    opposing: [
      "Are you the manufacturer or the seller of the product?",
      "Is the condition described by the complainant covered under warranty?",
      "Was the defect a manufacturing defect, or caused by wear and tear / misuse?",
      "Did the complainant follow all usage instructions and guidelines?",
      "What steps, if any, have you taken to remedy the defect since the complaint was raised?",
      "Do you have documentation showing the product was quality tested before sale?",
    ],
  },
  DEFICIENT_SERVICES: {
    complainant: [
      "What specific service was promised, and what was actually delivered?",
      "Was there a written agreement outlining the terms of service?",
      "When did the deficiency in service occur?",
      "How did this deficiency directly impact or cause loss to you?",
      "What communication occurred between you and the service provider regarding the deficiency?",
      "What compensation or remedy are you seeking?",
    ],
    opposing: [
      "What are the agreed terms of the service contract?",
      "Were all obligations under the contract fulfilled on your part?",
      "Did any external factors beyond your control delay or affect the service?",
      "Were there any actions by the complainant that hindered the delivery of service?",
      "How do you justify the level of service provided against the complainant's claims?",
      "What is your proposed resolution to this dispute?",
    ],
  },
  UNFAIR_TRADE_PRACTICES: {
    complainant: [
      "What specific practice do you consider unfair?",
      "Was there any false representation of the goods/services standard, quality, or grade?",
      "Did the seller hoard or refuse to sell goods to raise prices?",
      "Can you provide evidence of the deceptive practice (e.g., brochures, emails)?",
      "How did this practice unfairly influence your decision to purchase?",
      "What monetary loss did you suffer due to this practice?",
    ],
    opposing: [
      "Do you deny the allegations of false representation or deceptive practices?",
      "Are your current trade practices compliant with industry standards and the CPA 2019?",
      "Is there any misunderstanding or misinterpretation by the complainant regarding the offer?",
      "Can you provide evidence supporting the accuracy of your representations?",
      "Did the complainant receive the exact goods/services advertised?",
      "What defenses do you rely on to justify your business practice?",
    ],
  },
  ECOMMERCE_DISPUTES: {
    complainant: [
      "On which platform was the transaction conducted?",
      "Was the issue related to non-delivery, delayed delivery, or delivery of incorrect items?",
      "Did the platform clearly display the seller's details and return policies?",
      "Have you raised a grievance with the platform's designated grievance officer?",
      "If the seller refused a return/refund, what reason was given?",
      "Are you holding the platform, the seller, or both liable?",
    ],
    opposing: [
      "Are you acting as an inventory e-commerce entity or a marketplace e-commerce entity?",
      "Was the disputed transaction completed in accordance with your platform's Terms of Use?",
      "How was the grievance addressed when first raised by the complainant?",
      "Did the third-party seller fail to meet their obligations, and are you protected by intermediary safe harbor?",
      "Was the cancellation / refund policy clearly communicated to the buyer before purchase?",
      "What evidence demonstrates diligent resolution efforts on your part?",
    ],
  },
  MISLEADING_ADVERTISEMENTS: {
    complainant: [
      "What specific advertisement are you referring to, and where was it published/broadcast?",
      "What guarantee or promise did the advertisement make that proved false?",
      "Did the advertisement conceal important information deliberately?",
      "How did this advertisement induce you to make the purchase?",
      "Can you provide a copy or recording of the advertisement?",
      "What damages or losses occurred as a result of relying on this advertisement?",
    ],
    opposing: [
      "Did the advertisement contain all required disclaimers clearly?",
      "Is the claim made in the advertisement scientifically or factually substantiated?",
      "Was the statement mere 'puffery' (exaggeration not meant to be taken literally) rather than a factual guarantee?",
      "Did you run a corrective advertisement once you became aware of the issue?",
      "Who endorsed the advertisement, and were they aware of the facts?",
      "How do you justify that the advertisement is not misleading under the CPA 2019?",
    ],
  },
  MEDICAL_NEGLIGENCE_CONSUMER: {
    complainant: [
      "What medical service was sought, and from which specific professional/hospital?",
      "What standard of care was breached during the treatment?",
      "Can you provide medical records detailing the negligence?",
      "Did you seek a second opinion that confirmed the negligence?",
      "What direct physical, emotional, or financial harm resulted from the alleged negligence?",
      "Was informed consent properly obtained before the procedure?",
    ],
    opposing: [
      "Are the services provided covered under the definition of 'service' in CPA 2019?",
      "Did you exercise the reasonable degree of skill and care expected of a medical professional?",
      "Was the outcome a known risk or complication of the procedure, clearly explained beforehand?",
      "Did the patient fail to follow post-treatment medical advice?",
      "Can you provide complete medical logs and consent forms?",
      "Are there expert opinions supporting that your actions aligned with accepted medical protocols?",
    ],
  },
};
