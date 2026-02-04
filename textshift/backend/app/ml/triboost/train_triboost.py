#!/usr/bin/env python3
"""
TriBoost Training Script - OPTIMIZED with 8-core multiprocessing
Trains XGBoost + CatBoost + LightGBM ensemble on 565 features extracted from text.

Training Data:
- AI Detector: 336,345 samples
- Humanizer: 118,961 samples  
- Plagiarism: 9,865 samples
Total: 465,171 samples

Optimizations:
- 8-core parallel feature extraction
- 10-minute checkpoint saving to iDrive e2
- Proper output flushing for real-time logs
"""

import json
import numpy as np
import pickle
import os
import sys
import subprocess
from datetime import datetime
from typing import Dict, List, Tuple, Any
from multiprocessing import Pool, cpu_count
import warnings
warnings.filterwarnings('ignore')

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

def log(msg):
    """Print with timestamp and flush."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}", flush=True)

# Add the feature extractor path
sys.path.insert(0, '/home/ubuntu/repos/Test/textshift/backend/app/services')
from feature_extractor import FeatureExtractor565

# ML Libraries
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import xgboost as xgb
import lightgbm as lgb

try:
    import catboost as cb
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False
    log("CatBoost not available, will use XGBoost + LightGBM only")

# Global extractor for multiprocessing
_extractor = None

def init_worker():
    """Initialize worker with feature extractor."""
    global _extractor
    _extractor = FeatureExtractor565()

def extract_single(text):
    """Extract features from a single text (for multiprocessing)."""
    global _extractor
    if _extractor is None:
        _extractor = FeatureExtractor565()
    return _extractor.extract_all(text)

def upload_to_idrive(local_path: str, s3_path: str):
    """Upload file to iDrive e2."""
    cmd = [
        'aws', 's3', 'cp', local_path, s3_path,
        '--endpoint-url', 'https://s3.us-west-1.idrivee2.com'
    ]
    env = os.environ.copy()
    env['AWS_ACCESS_KEY_ID'] = os.environ.get('IDRIVE_ACCESS_KEY', '')
    env['AWS_SECRET_ACCESS_KEY'] = os.environ.get('IDRIVE_SECRET_KEY', '')
    
    try:
        subprocess.run(cmd, env=env, check=True, capture_output=True)
        log(f"  Uploaded to {s3_path}")
        return True
    except Exception as e:
        log(f"  Upload failed: {e}")
        return False


def upload_dir_to_idrive(local_dir: str, s3_path: str):
    """Upload directory to iDrive e2."""
    cmd = [
        'aws', 's3', 'sync', local_dir, s3_path,
        '--endpoint-url', 'https://s3.us-west-1.idrivee2.com'
    ]
    env = os.environ.copy()
    env['AWS_ACCESS_KEY_ID'] = os.environ.get('IDRIVE_ACCESS_KEY', '')
    env['AWS_SECRET_ACCESS_KEY'] = os.environ.get('IDRIVE_SECRET_KEY', '')
    
    try:
        subprocess.run(cmd, env=env, check=True, capture_output=True)
        log(f"  Synced to {s3_path}")
        return True
    except Exception as e:
        log(f"  Sync failed: {e}")
        return False


class TriBoostTrainer:
    """Train TriBoost ensemble (XGBoost + CatBoost + LightGBM) on 565 features."""
    
    def __init__(self, output_dir: str = '/home/ubuntu/triboost_training/models', n_workers: int = 8):
        self.output_dir = output_dir
        self.s3_base = 's3://crop-spray-uploads/triboost-models'
        self.n_workers = n_workers
        os.makedirs(output_dir, exist_ok=True)
        log(f"Initializing TriBoostTrainer with {n_workers} CPU cores...")
        self.extractor = FeatureExtractor565()
        self.models = {}
        self.feature_names = self.extractor.get_feature_names()
        log(f"Feature extractor ready with {len(self.feature_names)} features")
        
    def load_ai_detector_data(self, filepath: str) -> Tuple[List[str], List[int]]:
        """Load AI detector training data."""
        log(f"Loading AI detector data from {filepath}...")
        texts = []
        labels = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                if i % 50000 == 0:
                    log(f"  Loaded {i} samples...")
                try:
                    data = json.loads(line.strip())
                    text = data.get('text', '')
                    label = int(data.get('label', 0))
                    if text and len(text) > 50:
                        texts.append(text)
                        labels.append(label)
                except:
                    continue
        
        log(f"  Total AI detector samples: {len(texts)}")
        return texts, labels
    
    def load_humanizer_data(self, filepath: str) -> Tuple[List[str], List[int]]:
        """Load humanizer training data (input=AI text label 1, output=humanized label 0)."""
        log(f"Loading humanizer data from {filepath}...")
        texts = []
        labels = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                if i % 20000 == 0:
                    log(f"  Loaded {i} samples...")
                try:
                    data = json.loads(line.strip())
                    # Input is AI text (label 1)
                    input_text = data.get('input', '')
                    if input_text and len(input_text) > 50:
                        texts.append(input_text)
                        labels.append(1)  # AI-generated
                    
                    # Output is humanized text (label 0)
                    output_text = data.get('output', '')
                    if output_text and len(output_text) > 50:
                        texts.append(output_text)
                        labels.append(0)  # Human-like
                except:
                    continue
        
        log(f"  Total humanizer samples: {len(texts)}")
        return texts, labels
    
    def load_plagiarism_data(self, filepath: str) -> Tuple[List[str], List[int]]:
        """Load plagiarism training data."""
        log(f"Loading plagiarism data from {filepath}...")
        texts = []
        labels = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                try:
                    data = json.loads(line.strip())
                    # Combine text1 and text2 for feature extraction
                    text1 = data.get('text1', '')
                    text2 = data.get('text2', '')
                    combined = f"{text1}\n\n{text2}"
                    label = int(data.get('label', 0))
                    
                    if len(combined) > 100:
                        texts.append(combined)
                        labels.append(label)
                except:
                    continue
        
        log(f"  Total plagiarism samples: {len(texts)}")
        return texts, labels
    
    def extract_features_parallel(self, texts: List[str], task: str) -> np.ndarray:
        """Extract features using multiprocessing for speed."""
        log(f"Extracting 565 features from {len(texts)} samples for {task} using {self.n_workers} cores...")
        
        checkpoint_dir = os.path.join(self.output_dir, f'{task.lower().replace(" ", "_")}_features')
        os.makedirs(checkpoint_dir, exist_ok=True)
        
        start_time = datetime.now()
        last_checkpoint = start_time
        last_log = start_time
        
        all_features = []
        batch_size = 5000  # Process in batches for progress reporting
        
        with Pool(processes=self.n_workers, initializer=init_worker) as pool:
            for batch_start in range(0, len(texts), batch_size):
                batch_end = min(batch_start + batch_size, len(texts))
                batch_texts = texts[batch_start:batch_end]
                
                # Extract features for this batch
                batch_features = pool.map(extract_single, batch_texts)
                all_features.extend(batch_features)
                
                # Progress update
                elapsed = (datetime.now() - start_time).total_seconds()
                progress = batch_end
                rate = progress / elapsed if elapsed > 0 else 0
                eta = (len(texts) - progress) / rate if rate > 0 else 0
                
                # Log every 30 seconds
                if (datetime.now() - last_log).total_seconds() > 30:
                    log(f"  {task}: {progress}/{len(texts)} samples ({progress*100/len(texts):.1f}%) - Rate: {rate:.1f}/s - ETA: {eta/60:.1f} min")
                    last_log = datetime.now()
                
                # Checkpoint every 10 minutes
                if (datetime.now() - last_checkpoint).total_seconds() > 600:
                    log(f"  Saving checkpoint at {progress} samples...")
                    checkpoint_path = os.path.join(checkpoint_dir, f'features_checkpoint_{progress}.npy')
                    np.save(checkpoint_path, np.array(all_features))
                    upload_to_idrive(checkpoint_path, f'{self.s3_base}/checkpoints/{task.lower().replace(" ", "_")}/features_checkpoint_{progress}.npy')
                    last_checkpoint = datetime.now()
        
        features = np.array(all_features)
        total_time = (datetime.now() - start_time).total_seconds()
        log(f"  Feature extraction complete: {features.shape} in {total_time/60:.1f} minutes ({len(texts)/total_time:.1f} samples/sec)")
        
        # Save final features
        final_path = os.path.join(checkpoint_dir, 'features_final.npy')
        np.save(final_path, features)
        upload_to_idrive(final_path, f'{self.s3_base}/{task.lower().replace(" ", "_")}/features_final.npy')
        
        return features
    
    def train_xgboost(self, X_train: np.ndarray, y_train: np.ndarray, 
                      X_val: np.ndarray, y_val: np.ndarray, task: str) -> xgb.XGBClassifier:
        """Train XGBoost classifier."""
        log(f"Training XGBoost for {task}...")
        
        n_classes = len(np.unique(y_train))
        
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='multi:softmax' if n_classes > 2 else 'binary:logistic',
            num_class=n_classes if n_classes > 2 else None,
            eval_metric='mlogloss' if n_classes > 2 else 'logloss',
            use_label_encoder=False,
            n_jobs=-1,
            random_state=42
        )
        
        model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=50
        )
        
        return model
    
    def train_lightgbm(self, X_train: np.ndarray, y_train: np.ndarray,
                       X_val: np.ndarray, y_val: np.ndarray, task: str) -> lgb.LGBMClassifier:
        """Train LightGBM classifier."""
        log(f"Training LightGBM for {task}...")
        
        n_classes = len(np.unique(y_train))
        
        model = lgb.LGBMClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='multiclass' if n_classes > 2 else 'binary',
            num_class=n_classes if n_classes > 2 else None,
            n_jobs=-1,
            random_state=42,
            verbose=-1
        )
        
        model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            callbacks=[lgb.early_stopping(50, verbose=False)]
        )
        
        return model
    
    def train_catboost(self, X_train: np.ndarray, y_train: np.ndarray,
                       X_val: np.ndarray, y_val: np.ndarray, task: str):
        """Train CatBoost classifier."""
        if not CATBOOST_AVAILABLE:
            return None
            
        log(f"Training CatBoost for {task}...")
        
        n_classes = len(np.unique(y_train))
        
        model = cb.CatBoostClassifier(
            iterations=200,
            depth=8,
            learning_rate=0.1,
            loss_function='MultiClass' if n_classes > 2 else 'Logloss',
            random_seed=42,
            verbose=50
        )
        
        model.fit(
            X_train, y_train,
            eval_set=(X_val, y_val),
            use_best_model=True
        )
        
        return model
    
    def ensemble_predict(self, models: Dict, X: np.ndarray) -> np.ndarray:
        """Make ensemble predictions using voting."""
        predictions = []
        
        for name, model in models.items():
            if model is not None:
                pred = model.predict(X)
                predictions.append(pred)
        
        # Majority voting
        predictions = np.array(predictions)
        ensemble_pred = np.apply_along_axis(
            lambda x: np.bincount(x.astype(int)).argmax(), 
            axis=0, 
            arr=predictions
        )
        
        return ensemble_pred
    
    def evaluate(self, y_true: np.ndarray, y_pred: np.ndarray, task: str) -> Dict:
        """Evaluate model performance."""
        metrics = {
            'accuracy': float(accuracy_score(y_true, y_pred)),
            'precision': float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
            'recall': float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
            'f1': float(f1_score(y_true, y_pred, average='weighted', zero_division=0))
        }
        
        log(f"{task} Results:")
        log(f"  Accuracy:  {metrics['accuracy']:.4f}")
        log(f"  Precision: {metrics['precision']:.4f}")
        log(f"  Recall:    {metrics['recall']:.4f}")
        log(f"  F1 Score:  {metrics['f1']:.4f}")
        print("\nClassification Report:", flush=True)
        print(classification_report(y_true, y_pred), flush=True)
        
        return metrics
    
    def save_checkpoint(self, task: str, models: Dict, metrics: Dict):
        """Save models and upload to iDrive."""
        task_dir = os.path.join(self.output_dir, task.lower().replace(' ', '_'))
        os.makedirs(task_dir, exist_ok=True)
        
        for name, model in models.items():
            if model is not None:
                model_path = os.path.join(task_dir, f'{name}_model.pkl')
                with open(model_path, 'wb') as f:
                    pickle.dump(model, f)
                log(f"Saved {name} model to {model_path}")
                upload_to_idrive(model_path, f'{self.s3_base}/{task.lower().replace(" ", "_")}/{name}_model.pkl')
        
        # Save metrics
        metrics_path = os.path.join(task_dir, 'metrics.json')
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)
        upload_to_idrive(metrics_path, f'{self.s3_base}/{task.lower().replace(" ", "_")}/metrics.json')
    
    def train_task(self, texts: List[str], labels: List[int], task: str) -> Dict:
        """Train TriBoost ensemble for a specific task."""
        log(f"{'='*60}")
        log(f"Training TriBoost for: {task}")
        log(f"{'='*60}")
        
        # Extract features using parallel processing
        X = self.extract_features_parallel(texts, task)
        y = np.array(labels)
        
        # Split data
        log("Splitting data into train/val/test...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.15, random_state=42, stratify=y
        )
        X_train, X_val, y_train, y_val = train_test_split(
            X_train, y_train, test_size=0.176, random_state=42, stratify=y_train
        )
        
        log(f"Data splits:")
        log(f"  Train: {len(y_train)} samples")
        log(f"  Val:   {len(y_val)} samples")
        log(f"  Test:  {len(y_test)} samples")
        
        # Train models
        models = {}
        models['xgboost'] = self.train_xgboost(X_train, y_train, X_val, y_val, task)
        models['lightgbm'] = self.train_lightgbm(X_train, y_train, X_val, y_val, task)
        if CATBOOST_AVAILABLE:
            models['catboost'] = self.train_catboost(X_train, y_train, X_val, y_val, task)
        
        # Evaluate individual models
        log("--- Individual Model Performance ---")
        for name, model in models.items():
            if model is not None:
                pred = model.predict(X_test)
                log(f"{name}:")
                self.evaluate(y_test, pred, f"{task} - {name}")
        
        # Evaluate ensemble
        log("--- TriBoost Ensemble Performance ---")
        ensemble_pred = self.ensemble_predict(models, X_test)
        metrics = self.evaluate(y_test, ensemble_pred, f"{task} - Ensemble")
        
        # Save and upload
        self.save_checkpoint(task, models, metrics)
        
        return {'models': models, 'metrics': metrics}
    
    def train_all(self, data_dir: str = '/home/ubuntu/triboost_training/data'):
        """Train TriBoost for all tasks."""
        log("Starting TriBoost training for all tasks...")
        log(f"Using {self.n_workers} CPU cores for parallel feature extraction")
        results = {}
        
        # AI Detector
        ai_texts, ai_labels = self.load_ai_detector_data(
            os.path.join(data_dir, 'ai_detector.jsonl')
        )
        results['ai_detector'] = self.train_task(ai_texts, ai_labels, 'AI Detector')
        
        # Humanizer
        hum_texts, hum_labels = self.load_humanizer_data(
            os.path.join(data_dir, 'humanizer.jsonl')
        )
        results['humanizer'] = self.train_task(hum_texts, hum_labels, 'Humanizer')
        
        # Plagiarism
        plag_texts, plag_labels = self.load_plagiarism_data(
            os.path.join(data_dir, 'plagiarism.jsonl')
        )
        results['plagiarism'] = self.train_task(plag_texts, plag_labels, 'Plagiarism')
        
        # Save overall results
        summary = {
            'timestamp': datetime.now().isoformat(),
            'n_workers': self.n_workers,
            'tasks': {
                'ai_detector': results['ai_detector']['metrics'],
                'humanizer': results['humanizer']['metrics'],
                'plagiarism': results['plagiarism']['metrics']
            }
        }
        
        summary_path = os.path.join(self.output_dir, 'training_summary.json')
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Upload summary
        upload_to_idrive(summary_path, f'{self.s3_base}/training_summary.json')
        
        # Sync entire models directory
        log("Syncing all models to iDrive...")
        upload_dir_to_idrive(self.output_dir, self.s3_base)
        
        log(f"{'='*60}")
        log("Training Complete!")
        log(f"{'='*60}")
        log(f"Models saved to: {self.output_dir}")
        log(f"Models uploaded to: {self.s3_base}")
        log(f"Summary saved to: {summary_path}")
        
        return results


if __name__ == '__main__':
    log("="*60)
    log("TriBoost Training Script Started (8-core optimized)")
    log("="*60)
    log(f"Available CPU cores: {cpu_count()}")
    trainer = TriBoostTrainer(n_workers=8)
    trainer.train_all()
    log("Script completed successfully!")
