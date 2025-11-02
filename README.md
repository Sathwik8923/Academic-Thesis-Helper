The Academic Thesis Helper (ATH) is a specialized web application engineered to address the core challenge of using generative AI in academic writing: maintaining structural coherence and focus.
It transforms generic AI output into usable research drafts by implementing a secure, two-step, context-aware workflow.
Our solution bypasses the limitations of single-prompt generators by enforcing a clear pipeline:
Structured Outline Generation: The user first defines their Thesis Topic and Key Ideas. The Gemini 2.5 Flash model is then instructed to produce a formal, multi-level academic outline (e.g., I., II. A., B., etc.). This vital step establishes the entire paper's logical argument upfront.

Contextual Section Drafting: The user selects a specific line from that outline. The application uses this precise selection, along with the full outline and the main topic, as context for the next generation request. This guarantees the output is a single, highly focused, academic paragraph that fits perfectly within the overall thesis structure.

Built using Node.js, Express, and the Google Gemini API, the ATH demonstrates an innovative, collaborative approach to AI-assisted writing, ensuring the final output is structurally sound and academically relevant.
