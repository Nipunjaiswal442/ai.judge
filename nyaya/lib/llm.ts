import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export const generateBrief = async (caseDetails: any, precedents: any[]) => {
  const SYSTEM_INSTRUCTION = `You are a legal analysis assistant for Indian consumer dispute matters. You are not a judge, not a lawyer, and you do not give legal advice. Your role is to structure information. Never fabricate case citations. If you do not have grounded information, say so explicitly. All outputs are advisory only.
  
  You MUST return ONLY valid JSON matching this exact structure:
  {
    "caseSummary": "string",
    "agreedFacts": ["string"],
    "disputedFacts": [{ "point": "string", "complainantPosition": "string", "opposingPosition": "string" }],
    "applicableLaw": [{ "statute": "string", "section": "string", "relevance": "string" }],
    "citedPrecedentIds": [], // return empty array, we will map this later
    "proceduralFlags": ["string"],
    "evidentiaryGaps": ["string"],
    "confidenceScore": number (0-100),
    "caveats": ["string"]
  }
  
  IMPORTANT: You must include a 'caveats' array. If you do not have caveats, generate standard ones about advisory nature.`;

  const messages: any[] = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    { role: "user", content: `Case details:\n${JSON.stringify(caseDetails, null, 2)}\n\nAvailable Precedents:\n${JSON.stringify(precedents, null, 2)}` }
  ];

  try {
    const response = await client.chat.completions.create({
      model: "deepseek-ai/deepseek-v3.2",
      messages,
      temperature: 0.1,
      top_p: 0.95,
      max_tokens: 8192,
      response_format: { type: "json_object" }, // If supported. If not, text mode will still try.
    });

    const content = response.choices[0]?.message?.content || "{}";
    
    // Attempt to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // In case it wrapped in markdown
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    if (!parsed.caveats || !Array.isArray(parsed.caveats) || parsed.caveats.length === 0) {
      parsed.caveats = [
        "This brief was AI-generated and must not be used as a substitute for legal judgment.",
        "Verify all facts, applicable laws, and mentioned precedents manually."
      ];
    }
    
    return parsed;
  } catch (error) {
    console.error("LLM Generation Error:", error);
    throw error;
  }
};

export const generateJudgeCaseSynthesis = async ({
  caseDetails,
  qaSessions,
  brief,
  precedents,
  judgeQuestion,
}: {
  caseDetails: any;
  qaSessions: any[];
  brief: any;
  precedents: any[];
  judgeQuestion: string;
}) => {
  const SYSTEM_INSTRUCTION = `You are Nyaya Bench Assistant.
You assist judges by synthesizing lawyer-submitted material for one consumer dispute case.
You are strictly advisory and must not issue or suggest a verdict.
Only use the provided inputs. If something is missing, say "Not available in record."

Respond in this exact markdown structure:
### Synthesis
2-4 short paragraphs with a neutral synthesis of both sides.

### Key Record Points
- Bullet points grounded in the lawyer Q&A and brief

### Gaps or Ambiguities
- Bullet points describing missing evidence, contradictions, or unanswered questions

### Advisory Caveat
One short sentence reminding that this is not a verdict.`;

  const messages: any[] = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    {
      role: "user",
      content: `Judge question:
${judgeQuestion}

Case details:
${JSON.stringify(caseDetails, null, 2)}

Lawyer Q&A sessions:
${JSON.stringify(qaSessions, null, 2)}

Generated analysis brief:
${JSON.stringify(brief || {}, null, 2)}

Cited precedents metadata:
${JSON.stringify(precedents, null, 2)}`,
    },
  ];

  try {
    const response = await client.chat.completions.create({
      model: "deepseek-ai/deepseek-v3.2",
      messages,
      temperature: 0.1,
      top_p: 0.95,
      max_tokens: 1800,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Assistant returned an empty response.");
    }
    return content;
  } catch (error) {
    console.error("Judge synthesis error:", error);
    throw error;
  }
};
