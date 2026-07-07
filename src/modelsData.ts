export type InputType = "dna" | "rna" | "protein" | "smiles" | "genes" | "chat";

export interface ModelInfo {
  id: string;
  name: string;
  developer: string;
  paperUrl: string;
  category: string;
  oneLiner: string;
  description: string;
  applications: string[];
  inputType: InputType;
  inputPlaceholder: string;
  inputLabel: string;
  exampleInput: string;
  architecture: string;
  parameters: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "genomics",
    name: "Genomics & DNA",
    iconName: "Dna",
    description: "Foundation models trained on genomic sequences, predicting promoters, enhancers, structural variants, and long-range regulation."
  },
  {
    id: "transcriptomics",
    name: "Transcriptomics & RNA",
    iconName: "FileSpreadsheet",
    description: "Models analyzing gene expression profiles, single-cell transcriptomes, and RNA structure/splicing patterns."
  },
  {
    id: "proteins",
    name: "Proteins & Enzymes",
    iconName: "Activity",
    description: "Sequence models trained on millions of amino acids to predict protein secondary/tertiary structures, mutations, and activity."
  },
  {
    id: "molecules",
    name: "Molecules & Chemistry",
    iconName: "Hexagon",
    description: "Chemical representations like SMILES optimized to predict molecular properties, solubility, toxicity, and drug-likeness."
  },
  {
    id: "biomedical-llm",
    name: "Biomedical LLMs (Chat)",
    iconName: "MessageSquare",
    description: "Generative text models fine-tuned on PubMed, clinical guidelines, and research papers for healthcare Q&A and reasoning."
  }
];

export const MODELS: ModelInfo[] = [
  // Genomics & DNA
  {
    id: "dnabert2",
    name: "DNABERT-2",
    developer: "Zhou et al. (Tsinghua University)",
    paperUrl: "https://arxiv.org/abs/2306.15006",
    category: "genomics",
    oneLiner: "Multi-species genome sequence foundation model using Byte Pair Encoding (BPE).",
    description: "DNABERT-2 utilizes BPE tokenization to overcome the vocabulary limits of standard k-mer representation, allowing it to generalize robustly across diverse species' genomes. It captures local genetic contexts and structural motifs.",
    applications: [
      "Promoter identification and regulatory region prediction",
      "Transcription factor binding site (TFBS) classification",
      "Splice site detection",
      "Chromatin accessibility and methylation profiling"
    ],
    inputType: "dna",
    inputLabel: "DNA Sequence (A, C, G, T, N)",
    inputPlaceholder: "Enter a DNA sequence, e.g., ATGCGT...",
    exampleInput: "ATGCGTCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGACTAGCTAGCTAGCTAGCTAGCTGCTAGCTAGCTAGC",
    architecture: "BERT-style Masked Language Model (Transformer Encoder) with BPE tokenization",
    parameters: "117 Million"
  },
  {
    id: "hyenadna",
    name: "HyenaDNA",
    developer: "Nguyen et al. (Stanford University)",
    paperUrl: "https://arxiv.org/abs/2306.15794",
    category: "genomics",
    oneLiner: "Ultra-long context DNA foundation model utilizing Hyena operator convolutions.",
    description: "HyenaDNA replaces traditional attention layers with implicit long convolutions, enabling single-nucleotide resolution DNA processing for context lengths up to 1 million base pairs with O(N log N) complexity.",
    applications: [
      "Long-range regulatory interaction prediction",
      "Species classification and evolutionary dynamics mapping",
      "Structural variant analysis (long insertions/deletions)",
      "Whole-plasmid or bacterial genome characterization"
    ],
    inputType: "dna",
    inputLabel: "DNA Sequence (A, C, G, T, N)",
    inputPlaceholder: "Enter a long DNA sequence...",
    exampleInput: "GAAATTTGCGCGCGCGATATATATACCCCCGGGGGTAAAAAATTTTTTGGCCAAATTTAAACCCGGGTTTAAACCCGGGAAATTTG",
    architecture: "Hyena Operator (implicit deep convolutional neural networks)",
    parameters: "10 Million - 100 Million"
  },
  {
    id: "nucleotide-transformer",
    name: "Nucleotide Transformer",
    developer: "InstaDeep & TUM",
    paperUrl: "https://arxiv.org/abs/2304.05343",
    category: "genomics",
    oneLiner: "Multi-species genome foundation model trained on hundreds of organisms.",
    description: "Trained on the reference genomes of 3,200 diverse humans plus 1,000+ species, this model provides rich embeddings that reflect global genomic architecture, codon biases, and evolutionary selection.",
    applications: [
      "Variant effect prediction (clinical pathogenicity score)",
      "Histone modification and chromatin accessibility mapping",
      "Gene expression level zero-shot prediction",
      "Species-specific regulatory motif hunting"
    ],
    inputType: "dna",
    inputLabel: "DNA Sequence (A, C, G, T, N)",
    inputPlaceholder: "Enter a DNA sequence...",
    exampleInput: "ATGCAAAAAATTTGGGCCCAAAATTTTCCCGGGAAACCCGGGTTAAAGGGCCCAAATTTGGGCCCAAAATTTTCCCGGGAAACCC",
    architecture: "Transformer Encoder (similar to ESM/RoBERTa) with multi-species training",
    parameters: "500 Million - 2.5 Billion"
  },

  // Transcriptomics & RNA
  {
    id: "rnafm",
    name: "RNA-FM",
    developer: "Chen et al. (Fudan University)",
    paperUrl: "https://arxiv.org/abs/2208.06288",
    category: "transcriptomics",
    oneLiner: "RNA foundation model for secondary structure and functional representation.",
    description: "RNA-FM is pre-trained on millions of non-coding RNA (ncRNA) sequences. It reconstructs the spatial and structural rules of RNA molecule folding directly from primary nucleotide sequences.",
    applications: [
      "RNA secondary structure prediction (base pairing probabilities)",
      "RNA-protein binding interaction profiling",
      "RNA modification (e.g., m6A) hot-spot prediction",
      "Functional ncRNA family classification"
    ],
    inputType: "rna",
    inputLabel: "RNA Sequence (A, C, G, U, N)",
    inputPlaceholder: "Enter an RNA sequence, e.g., AUGCGU...",
    exampleInput: "AUGCGGACUUAGCGAGCUUACGGGCCCAAAUUUCCGGGAACCCGGUUAAAGGGCCCAAAUGGCCCAAAUUUCCGGGAACCC",
    architecture: "Transformer Encoder with RNA-specific positional embeddings",
    parameters: "100 Million"
  },
  {
    id: "geneformer",
    name: "Geneformer",
    developer: "Theodora et al. (Broad Institute / Harvard)",
    paperUrl: "https://www.nature.com/articles/s41586-023-06139-9",
    category: "transcriptomics",
    oneLiner: "Attention-based model of single-cell gene expression networks.",
    description: "Geneformer is trained on a massive corpus of 30 million single-cell transcriptomes. It encodes gene expression as ranked lists of genes, capturing the underlying regulatory networks and cell-type constraints.",
    applications: [
      "Cell state and cell type classification",
      "In silico gene deletion or overexpression dosage simulations",
      "Chromatin dynamics and transcription factor perturbations",
      "Target discovery for cardiological and oncological diseases"
    ],
    inputType: "genes",
    inputLabel: "Gene List (Comma-separated Gene Symbols)",
    inputPlaceholder: "Enter a list of gene symbols (e.g., GAPDH, TP53, BRCA1...)",
    exampleInput: "GAPDH, TP53, BRCA1, EGFR, STAT3, AKT1, TNF, IL6, VEGFA, MTOR",
    architecture: "Rank-based Transformer Encoder of cellular transcriptome lists",
    parameters: "58 Million"
  },

  // Proteins & Enzymes
  {
    id: "esm2",
    name: "ESM-2",
    developer: "Meta AI",
    paperUrl: "https://www.biorxiv.org/content/10.1101/2022.07.20.500902v1",
    category: "proteins",
    oneLiner: "SOTA evolutionary-scale protein language model for sequence and structure.",
    description: "Meta's ESM-2 leverages millions of protein sequences from UniRef to learn the 'grammar' of protein sequences. It is the core engine behind ESMFold, providing atomic-resolution tertiary structure prediction.",
    applications: [
      "Atomic-resolution 3D structure prediction (via ESMFold)",
      "Zero-shot variant effect and mutational stability scoring",
      "Enzyme classification and functional annotation",
      "De novo protein binder design"
    ],
    inputType: "protein",
    inputLabel: "Amino Acid Sequence (standard single-letter codes)",
    inputPlaceholder: "Enter a protein sequence, e.g., MASEK...",
    exampleInput: "MNGTEGPNFYVPFSNKTGVVRSPFEAPQYYLAEPWQFSMLAAYMFLLIMLGFPINFLTLYVTVQHKKLRTPLNYILLNLAVADLFMVFGGFTTTLYTSLHGYFVFGPTGCNLEGFFATLGGEIALWSLVVLAIERYVVVCKPMSNFRFGENHAIMGVAFTWVMALACAAPPLVGWSRYIPEGMQCSCGIDYYTPHEETNNESFVIYMFVVHFIIPLIVIFFCYGQLVFTVKEAAAQQQESATTQKAEKEVTRMVIIMVIAFLICWLPYAGVAFYIFTHQGSDFGPIFMTIPAFFAKSAAIYNPVIYIMMNKQFRNCMLTTICCGKNPLGDDEASATASKTETSQVAPA",
    architecture: "High-capacity Transformer Encoder with Rotary Position Embeddings (RoPE)",
    parameters: "8 Million - 15 Billion"
  },
  {
    id: "ankh",
    name: "Ankh",
    developer: "Universitat de Barcelona & Rost Lab",
    paperUrl: "https://arxiv.org/abs/2301.06568",
    category: "proteins",
    oneLiner: "Protein language model optimized with sequence-structure-function embeddings.",
    description: "Ankh is designed to be highly computational-efficient while retaining superb performance on down-stream protein engineering. It blends structural and functional constraints directly during pre-training.",
    applications: [
      "Enzyme thermostability and catalytic activity engineering",
      "Protein-protein binding affinity optimization",
      "Expression rate and solubility optimization",
      "Functional domain clustering and mapping"
    ],
    inputType: "protein",
    inputLabel: "Amino Acid Sequence (standard single-letter codes)",
    inputPlaceholder: "Enter an amino acid sequence...",
    exampleInput: "MPRLVIVVDDDRDMRRVLQALIEKDPNVEVVGEAGDGEEALALVREKRPDLVLMDVNMPGMNGLELLKRLKADKIDLIPVLVMTASTEEEKKRIVGLEAGAADDYVPKPFSPRELIARVKALLRRQ",
    architecture: "Transformer Encoder with structural-functional training constraints",
    parameters: "450 Million - 1.5 Billion"
  },

  // Molecules & Chemistry
  {
    id: "chemberta2",
    name: "ChemBERTa-2",
    developer: "DeepChem",
    paperUrl: "https://arxiv.org/abs/2209.01712",
    category: "molecules",
    oneLiner: "Transformer designed for molecular property prediction from SMILES strings.",
    description: "ChemBERTa-2 treats chemical SMILES representations as text sentences. By masking and predicting molecular tokens, it gains an implicit understanding of molecular valence, functional groups, and atomic bonds.",
    applications: [
      "Zero-shot toxicity and safety screening (ClinTox, Tox21)",
      "Blood-brain barrier penetration (BBBP) probability",
      "Aqueous solubility (ESOL) estimation",
      "High-throughput screening library filtering"
    ],
    inputType: "smiles",
    inputLabel: "SMILES String",
    inputPlaceholder: "Enter a SMILES string, e.g., CC(=O)OC1=CC=CC=C1C(=O)O...",
    exampleInput: "CC(=O)OC1=CC=CC=C1C(=O)O", // Aspirin
    architecture: "RoBERTa-style Transformer Encoder optimized for chemical sub-structures",
    parameters: "4 Million - 10 Million"
  },
  {
    id: "molformer",
    name: "Molformer",
    developer: "IBM Research & RPI",
    paperUrl: "https://arxiv.org/abs/2106.09553",
    category: "molecules",
    oneLiner: "Large-scale molecular transformer using linear attention mechanism.",
    description: "Molformer is pre-trained on 1.1 Billion chemical structures from PubChem and ZINC databases. Using custom linear attention, it accurately represents full-scale molecular structures without high computational costs.",
    applications: [
      "Molecular physical-chemical property regression",
      "Drug-target binding affinity (DTA) predictions",
      "Lead generation and molecular optimization gradients",
      "De novo molecular design"
    ],
    inputType: "smiles",
    inputLabel: "SMILES String",
    inputPlaceholder: "Enter a SMILES string...",
    exampleInput: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", // Caffeine
    architecture: "Linear Attention Transformer trained on over 1.1 billion molecules",
    parameters: "45 Million"
  },

  // Biomedical LLMs
  {
    id: "biogpt",
    name: "BioGPT",
    developer: "Microsoft Research",
    paperUrl: "https://academic.oup.com/bib/article/23/6/elac036/6710411",
    category: "biomedical-llm",
    oneLiner: "Domain-specific generative Transformer language model for biomedical literature.",
    description: "BioGPT is pre-trained on millions of PubMed articles and abstracts. It excels at relation extraction, biomedical question answering, and clinical text classification.",
    applications: [
      "Biomedical relation extraction (e.g., drug-gene interactions)",
      "Medical text parsing and entity annotation",
      "Document classification and academic summarizing",
      "General biological Q&A"
    ],
    inputType: "chat",
    inputLabel: "Natural Language Prompt",
    inputPlaceholder: "Ask a biomedical research question...",
    exampleInput: "What are the primary target genes of metformin in colorectal cancer?",
    architecture: "GPT-2-style Autoregressive Decoder pre-trained exclusively on biomedical literature",
    parameters: "347 Million"
  },
  {
    id: "biomedlm",
    name: "BioMedLM (PubMedGPT)",
    developer: "Stanford CRFM",
    paperUrl: "https://crfm.stanford.edu/2022/12/15/biomedlm.html",
    category: "biomedical-llm",
    oneLiner: "Compact and powerful GPT-style model trained on PubMed literature.",
    description: "A 2.7 Billion parameter model trained strictly on PubMed documents, offering exceptional performance in biomedical question answering, clinical summary generation, and ontology matching.",
    applications: [
      "Biomedical search indexing and synonym mapping",
      "PubMed abstract summarization",
      "Medical board exam style question answering",
      "Terminology ontology parsing"
    ],
    inputType: "chat",
    inputLabel: "Natural Language Prompt",
    inputPlaceholder: "Ask BioMedLM a medical paper question...",
    exampleInput: "Explain the role of the BCR-ABL1 fusion gene in chronic myeloid leukemia.",
    architecture: "Autoregressive GPT Transformer optimized for clinical term structures",
    parameters: "2.7 Billion"
  },
  {
    id: "meditron",
    name: "Meditron",
    developer: "EPFL (Switzerland)",
    paperUrl: "https://arxiv.org/abs/2311.16089",
    category: "biomedical-llm",
    oneLiner: "Open-source LLM suite aligned with clinical guidelines and textbooks.",
    description: "Meditron builds on LLaMA-2, further pre-trained on clinical guidelines, international medical textbooks, and peer-reviewed papers. It acts as an expert clinical helper.",
    applications: [
      "Clinical guideline search and translation",
      "Medical differential diagnosis assistance",
      "Symptom-to-guideline matchmaking and reporting",
      "Global health standard reference Q&A"
    ],
    inputType: "chat",
    inputLabel: "Natural Language Prompt",
    inputPlaceholder: "Ask Meditron a clinical question...",
    exampleInput: "What is the recommended first-line pharmacological treatment for a patient diagnosed with hypertension and Type 2 Diabetes according to ACC/AHA guidelines?",
    architecture: "Autoregressive LLM (LLaMA-2 based) with extensive clinical instruction tuning",
    parameters: "7 Billion - 70 Billion"
  },
  {
    id: "pmcllama",
    name: "PMC-LLaMA",
    developer: "Wu et al. (SJTU & Shanghai AI Lab)",
    paperUrl: "https://arxiv.org/abs/2304.14454",
    category: "biomedical-llm",
    oneLiner: "LLaMA model fine-tuned on PubMed Central academic papers.",
    description: "PMC-LLaMA is fine-tuned on 4.8 million full-text biomedical papers from PMC, providing deep understanding of scientific experiments, clinical trial results, and figures.",
    applications: [
      "Scientific paper analysis and structured summaries",
      "Hypothesis generation and clinical trail literature synthesis",
      "Advanced molecular biology reasoning",
      "Medical dialogue and terminology translation"
    ],
    inputType: "chat",
    inputLabel: "Natural Language Prompt",
    inputPlaceholder: "Ask PMC-LLaMA to explain a scientific concept...",
    exampleInput: "Detail the molecular mechanism of CRISPR-Cas9-mediated double-strand breaks and the repair pathways involved.",
    architecture: "LLaMA-1 / LLaMA-2 autoregressive model fine-tuned on full-text papers",
    parameters: "7 Billion - 13 Billion"
  }
];

export function validateInput(type: InputType, input: string): { isValid: boolean; message: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, message: "Input cannot be empty." };
  }

  switch (type) {
    case "dna": {
      // Matches A, C, G, T, N (case insensitive) plus whitespace
      const dnaRegex = /^[ACGTN\s]+$/i;
      if (!dnaRegex.test(trimmed)) {
        return {
          isValid: false,
          message: "Invalid DNA sequence. It must only contain the bases A, C, G, T, and N."
        };
      }
      return { isValid: true, message: "" };
    }
    case "rna": {
      // Matches A, C, G, U, N (case insensitive) plus whitespace
      const rnaRegex = /^[ACGUN\s]+$/i;
      if (!rnaRegex.test(trimmed)) {
        return {
          isValid: false,
          message: "Invalid RNA sequence. It must only contain the bases A, C, G, U, and N."
        };
      }
      return { isValid: true, message: "" };
    }
    case "protein": {
      // Standard amino acid single-letter codes: ARNDCQEGHILKMFPSTWYV plus X, B, Z, J, U, O, *
      // Let's use the standard 20 letters plus common degenerate ones like X and B
      const proteinRegex = /^[ARNDCQEGHILKMFPSTWYVXBZJ\s]+$/i;
      if (!proteinRegex.test(trimmed)) {
        return {
          isValid: false,
          message: "Invalid amino acid sequence. It must contain standard single-letter protein codes."
        };
      }
      return { isValid: true, message: "" };
    }
    case "smiles": {
      // Basic SMILES validation: check that it contains common SMILES characters and no invalid ones
      // Valid SMILES letters include C, N, O, P, S, F, Cl, Br, I, B, H, Na, K, Mg, Ca, Zn, Sn, Pb, Al, etc., brackets, parenthesis, bonds, double bonds, etc.
      // We can do a basic character checks to prevent plain random text
      const invalidChars = /[^A-Za-z0-9#=\-\[\]\(\)\+\\\/:\.\@\*%%\$]/g;
      if (invalidChars.test(trimmed)) {
        return {
          isValid: false,
          message: "Invalid characters in SMILES string. SMILES should only contain chemical symbols and structural markers."
        };
      }
      return { isValid: true, message: "" };
    }
    case "genes": {
      // Gene list: comma-separated symbols
      const genes = trimmed.split(",").map(g => g.trim()).filter(Boolean);
      if (genes.length === 0) {
        return { isValid: false, message: "Please enter at least one gene symbol." };
      }
      return { isValid: true, message: "" };
    }
    case "chat":
    default:
      return { isValid: true, message: "" };
  }
}
