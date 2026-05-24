import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import silhouette_score
import json
import logging

logger = logging.getLogger(__name__)


class DataProcessor:
    """Handles data preprocessing and feature engineering."""

    def process(self, df: pd.DataFrame) -> pd.DataFrame:
        df = self._handle_missing(df)
        df = self._encode_categoricals(df)
        return df

    def _handle_missing(self, df: pd.DataFrame) -> pd.DataFrame:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(include=['object']).columns

        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0] if len(df) > 0 else 'unknown')
        return df

    def _encode_categoricals(self, df: pd.DataFrame) -> pd.DataFrame:
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if df[col].nunique() <= 10:
                dummies = pd.get_dummies(df[col], prefix=col, drop_first=True)
                df = pd.concat([df.drop(col, axis=1), dummies], axis=1)
            else:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
        return df


class ClusteringService:
    """K-Means clustering with elbow method support."""

    def __init__(self):
        self.scaler = StandardScaler()

    def find_optimal_k(self, features: np.ndarray, max_k: int = 10) -> dict:
        inertias = []
        silhouettes = []
        k_range = range(2, min(max_k + 1, len(features)))

        for k in k_range:
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = km.fit_predict(features)
            inertias.append(float(km.inertia_))
            silhouettes.append(float(silhouette_score(features, labels)))

        optimal_k = list(k_range)[np.argmax(silhouettes)]
        return {"optimal_k": optimal_k, "inertias": inertias, "silhouettes": silhouettes}

    def cluster(self, df: pd.DataFrame, k: int) -> dict:
        features = self.scaler.fit_transform(df.values)
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(features)

        clusters = []
        for i in range(k):
            mask = labels == i
            cluster_data = df[mask]
            summary = {col: _summarize_column(cluster_data[col]) for col in df.columns}
            clusters.append({
                "cluster_id": i,
                "size": int(mask.sum()),
                "centroid": km.cluster_centers_[i].tolist(),
                "summary": summary,
            })

        return {
            "k": k,
            "clusters": clusters,
            "silhouette_score": float(silhouette_score(features, labels)),
            "labels": labels.tolist(),
        }


def _summarize_column(series: pd.Series) -> dict:
    if pd.api.types.is_numeric_dtype(series):
        return {"mean": float(series.mean()), "std": float(series.std()), "min": float(series.min()), "max": float(series.max())}
    return {"top_values": series.value_counts().head(5).to_dict()}
