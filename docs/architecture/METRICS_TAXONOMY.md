# VOXIQ Metrics Taxonomy & Scientific Methodology

For every metric calculated and displayed in VOXIQ, this document specifies:
1. What is measured
2. Mathematical formula and calculation
3. Underlying data
4. Practical utility
5. Scientific limitations

---

### 1. Active Speaking Rate (WPM)
* **What is measured**: The velocity of verbal word delivery during active speech intervals.
* **Calculation**:
  $$\\text{WPM} = \\frac{\\text{total\\_words}}{\\text{active\\_speech\\_duration\\_seconds} / 60}$$
* **Data used**: Word tokens from Speech-to-Text; speech intervals from Voice Activity Detection (excluding pauses $> 0.5s$).
* **Why useful**: Traditional gross WPM skews downward when a speaker pauses deliberately. Active WPM measures actual articulation rate.
* **Limitations**: Does not normalize for phonetic syllable length (e.g. polysyllabic technical vocabulary vs monosyllabic words).

---

### 2. Acoustic Pauses
* **What is measured**: Silent intervals between vocalized speech frames.
* **Calculation**:
  $$\\text{Pause Duration} = t_{\\text{speech\\_onset}} - t_{\\text{speech\\_offset}}$$
  Classified as normal ($0.5s \\le \\Delta t < 1.2s$) or long ($\\Delta t \\ge 1.2s$).
* **Data used**: Short-time log energy and adaptive thresholding via Voice Activity Detection.
* **Why useful**: Identifies hesitation clusters, cognitive retrieval pauses, and breathing dynamics.
* **Limitations**: Background ambient noise or microphone clipping can sometimes mask short breath pauses.

---

### 3. Filler Word Density
* **What is measured**: The frequency of lexical hesitation tokens relative to total words spoken.
* **Calculation**:
  $$\\text{Filler Density (\\%)} = \\frac{\\text{filler\\_count}}{\\text{total\\_words}} \\times 100$$
* **Data used**: Configurable multi-word and single-word filler dictionary matched against timestamped transcript tokens.
* **Why useful**: Highlights excessive filler usage that dilutes conciseness.
* **Limitations**: Some words (e.g. 'like', 'actually') serve legitimate semantic functions depending on grammatical context.

---

### 4. Lexical Repetition Rate
* **What is measured**: Immediate or near-immediate recurrence of 1-gram, 2-gram, and 3-gram phrases.
* **Calculation**:
  $$\\text{Repetition Rate (\\%)} = \\frac{\\text{repeated\\_phrase\\_token\\_count}}{\\text{total\\_words}} \\times 100$$
* **Data used**: Tokenized and normalized transcript words.
* **Why useful**: Captures verbal restarts and lexical false-starts.
* **Limitations**: Deliberate rhetorical repetition or repeating proper nouns is not necessarily poor communication.

---

### 5. Type-Token Ratio (Vocabulary Diversity)
* **What is measured**: The proportion of distinct lexical items relative to sample size.
* **Calculation**:
  $$\\text{TTR} = \\frac{V}{N}, \\quad \\text{Root TTR} = \\frac{V}{\\sqrt{N}}$$
  where $V$ is unique vocabulary count and $N$ is total token count.
* **Data used**: Normalized transcript tokens.
* **Why useful**: Measures breadth of vocabulary and lexical richness.
* **Limitations**: Raw TTR declines as total text length increases; Root TTR is provided to mitigate length dependency.

---

### 6. Semantic Coherence
* **What is measured**: Conceptual continuity and topical consistency across adjacent spoken sentences.
* **Calculation**:
  $$\\text{Coherence}(s_i, s_{i+1}) = \\frac{\\mathbf{e}_i \\cdot \\mathbf{e}_{i+1}}{\\\|\\mathbf{e}_i\\| \\|\\mathbf{e}_{i+1}\\|}$$
  where $\\mathbf{e}_i$ is the 384-dimensional dense sentence embedding from `all-MiniLM-L6-v2`.
* **Data used**: Sentence boundary segmentation and Sentence-Transformers embeddings.
* **Why useful**: Detects sudden disjoint jumps, topic drift, or rambling explanations.
* **Limitations**: Low coherence is expected during natural, intended transitions between distinct outline topics.
