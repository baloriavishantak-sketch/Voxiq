"""Dense Semantic Embedding Engine using Sentence Transformers."""

from typing import List, Union, Optional
import numpy as np
import torch
from backend.app.utils.logger import logger


class EmbeddingEngine:
    _instance: Optional["EmbeddingEngine"] = None

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._model = None
        logger.info(f"Initialized Embedding Engine config: model={model_name}, device={self.device}")

    @classmethod
    def get_instance(cls, model_name: str = "all-MiniLM-L6-v2") -> "EmbeddingEngine":
        if cls._instance is None:
            cls._instance = cls(model_name=model_name)
        return cls._instance

    @property
    def model(self):
        """Lazy loader for SentenceTransformer model."""
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer '{self.model_name}' onto {self.device}...")
            self._model = SentenceTransformer(self.model_name, device=self.device)
            logger.info("SentenceTransformer loaded successfully.")
        return self._model

    def encode(self, texts: Union[str, List[str]], normalize: bool = True) -> np.ndarray:
        """Encodes one or more texts into L2-normalized 384-dimensional dense embeddings."""
        if isinstance(texts, str):
            texts = [texts]

        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        embeddings = self.model.encode(
            texts,
            normalize_embeddings=normalize,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        return embeddings.astype(np.float32)
