export const moodPrompts = {
  tired: `Summarize this in max 5 bullet points. 
          Each bullet under 10 words. 
          Add one funny analogy at the end.`,

  stressed: `Give me ONLY the 3 most important points.
             Number them. Nothing else. Be calm.`,

  annoyed: `Be blunt. No fluff. Tell me what I need 
            to know in the fewest words possible.`,

  curious: `Give a thorough summary with key insights,
            interesting details, and real world context.`
}

export const flashcardPrompts = {
  tired: `Create 5 simple flashcards from this content. 
          Keep questions and answers super short.
          Return ONLY a raw JSON array like this, no explanation, no markdown, no backticks:
          [{"question": "...", "answer": "..."}]`,

  stressed: `Create 3 flashcards covering only the most critical points.
             Return ONLY a raw JSON array like this, no explanation, no markdown, no backticks:
             [{"question": "...", "answer": "..."}]`,

  annoyed: `Create 5 flashcards. Be blunt and short.
            Return ONLY a raw JSON array like this, no explanation, no markdown, no backticks:
            [{"question": "...", "answer": "..."}]`,

  curious: `Create 10 detailed flashcards covering everything deeply.
            Return ONLY a raw JSON array like this, no explanation, no markdown, no backticks:
            [{"question": "...", "answer": "..."}]`
}

export const cramPrompts = {
  tired: `Give me the bare minimum I need to know. 
          3 words per point max. 
          No sentences. Just fragments.`,

  stressed: `One sentence. That's it. 
             The single most important thing to know.`,

  annoyed: `Bottom line only. 
            If it's more than 2 lines you've said too much.`,

  curious: `Cram sheet style. Key terms, key dates, key people. 
            Dense but organized. No fluff.`
}