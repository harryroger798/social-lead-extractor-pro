"""
HuggingFace Training Service for real LoRA fine-tuning.
Part of Phase 3: Self-Learning ML System.

This service handles:
1. Preparing training data from feedback samples
2. Uploading training data to HuggingFace
3. Triggering LoRA fine-tuning via HuggingFace API
4. Downloading trained adapters to iDrive e2
5. Loading adapters for inference
"""
import os
import json
import logging
import tempfile
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any, List
import boto3
from huggingface_hub import HfApi, hf_hub_download, upload_file, create_repo

from app.core.config import settings

logger = logging.getLogger(__name__)


class HuggingFaceTrainingService:
    """Real LoRA training using HuggingFace infrastructure."""
    
    # Base models for each task
    BASE_MODELS = {
        'detector': 'roberta-base',
        'humanizer': 't5-base',
        'plagiarism': 'sentence-transformers/all-MiniLM-L6-v2'
    }
    
    # LoRA configuration
    LORA_CONFIG = {
        'r': 8,  # LoRA rank
        'lora_alpha': 16,
        'lora_dropout': 0.1,
        'target_modules': ['query', 'value'],  # For RoBERTa/T5
        'bias': 'none',
        'task_type': 'SEQ_CLS'  # Sequence classification
    }
    
    # Training configuration (optimized for free tier)
    TRAINING_CONFIG = {
        'num_train_epochs': 3,
        'per_device_train_batch_size': 2,
        'gradient_accumulation_steps': 8,
        'learning_rate': 2e-4,
        'warmup_ratio': 0.1,
        'max_seq_length': 512,
        'fp16': True,  # Use mixed precision
        'save_strategy': 'epoch',
        'evaluation_strategy': 'epoch',
        'load_best_model_at_end': True
    }
    
    def __init__(self):
        self.hf_api = HfApi(token=settings.HUGGINGFACE_API_KEY)
        self.hf_token = settings.HUGGINGFACE_API_KEY
        self.repo_id = settings.HUGGINGFACE_MODEL_REPO
        
        # S3 client for iDrive e2
        self._s3_client = None
    
    def _get_s3_client(self):
        """Get or create S3 client for iDrive e2."""
        if self._s3_client is None:
            self._s3_client = boto3.client(
                's3',
                endpoint_url=settings.S3_ENDPOINT,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY
            )
        return self._s3_client
    
    def prepare_training_dataset(
        self,
        samples: List[Dict[str, Any]],
        model_type: str
    ) -> str:
        """
        Prepare training dataset in HuggingFace format.
        
        Args:
            samples: List of training samples with 'input_text' and 'correct_label'
            model_type: 'detector', 'humanizer', or 'plagiarism'
            
        Returns:
            Path to the prepared dataset file
        """
        
        # Create dataset in JSONL format
        dataset_lines = []
        
        for sample in samples:
            if model_type == 'detector':
                # Binary classification: AI vs Human
                label = 1 if sample['correct_label'].lower() in ['ai', 'ai generated', 'ai_generated'] else 0
                dataset_lines.append({
                    'text': sample['input_text'],
                    'label': label
                })
            elif model_type == 'humanizer':
                # Text-to-text: AI text -> Human-like text
                dataset_lines.append({
                    'input_text': sample['input_text'],
                    'target_text': sample.get('target_text', sample['input_text'])
                })
            elif model_type == 'plagiarism':
                # Binary classification: Plagiarized vs Original
                label = 1 if sample['correct_label'].lower() in ['plagiarized', 'copied', 'partially plagiarized'] else 0
                dataset_lines.append({
                    'text': sample['input_text'],
                    'label': label
                })
        
        # Write to temp file
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        dataset_path = f'/tmp/textshift_training_{model_type}_{timestamp}.jsonl'
        
        with open(dataset_path, 'w') as f:
            for line in dataset_lines:
                f.write(json.dumps(line) + '\n')
        
        logger.info(f"Prepared {len(dataset_lines)} samples for {model_type} training")
        
        return dataset_path
    
    def upload_dataset_to_hub(self, dataset_path: str, model_type: str) -> str:
        """
        Upload training dataset to HuggingFace Hub.
        
        Returns:
            Dataset path on Hub
        """
        
        try:
            # Ensure repo exists
            try:
                create_repo(
                    repo_id=self.repo_id,
                    token=self.hf_token,
                    repo_type='model',
                    exist_ok=True,
                    private=True
                )
            except Exception as e:
                logger.warning(f"Repo creation warning (may already exist): {e}")
            
            # Upload dataset
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            hub_path = f"datasets/{model_type}/train_{timestamp}.jsonl"
            
            upload_file(
                path_or_fileobj=dataset_path,
                path_in_repo=hub_path,
                repo_id=self.repo_id,
                token=self.hf_token
            )
            
            logger.info(f"Uploaded dataset to {self.repo_id}/{hub_path}")
            
            return hub_path
            
        except Exception as e:
            logger.error(f"Failed to upload dataset: {e}")
            raise
    
    def trigger_training(
        self,
        model_type: str,
        dataset_hub_path: str,
        version_name: str
    ) -> Dict[str, Any]:
        """
        Trigger LoRA fine-tuning on HuggingFace.
        
        For production, this would use HuggingFace AutoTrain or a custom Space.
        For now, we create the training script and config that can be run on HF Spaces.
        
        Returns:
            Training job info
        """
        
        base_model = self.BASE_MODELS.get(model_type)
        
        # Create training configuration
        training_config = {
            'base_model': base_model,
            'model_type': model_type,
            'dataset_path': dataset_hub_path,
            'version_name': version_name,
            'lora_config': self.LORA_CONFIG,
            'training_args': self.TRAINING_CONFIG,
            'output_dir': f"adapters/{model_type}/{version_name}",
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Upload training config
        config_path = f'/tmp/training_config_{version_name}.json'
        with open(config_path, 'w') as f:
            json.dump(training_config, f, indent=2)
        
        try:
            upload_file(
                path_or_fileobj=config_path,
                path_in_repo=f"training_configs/{version_name}.json",
                repo_id=self.repo_id,
                token=self.hf_token
            )
            
            logger.info(f"Training config uploaded for {version_name}")
            
            # In production, this would trigger an AutoTrain job or HF Space
            # For now, we return the config info
            return {
                'status': 'config_uploaded',
                'version_name': version_name,
                'base_model': base_model,
                'config_path': f"training_configs/{version_name}.json",
                'message': 'Training configuration uploaded. Run training script on HF Space.'
            }
            
        except Exception as e:
            logger.error(f"Failed to trigger training: {e}")
            raise
        finally:
            # Cleanup temp files
            if os.path.exists(config_path):
                os.remove(config_path)
    
    def create_training_script(self, model_type: str) -> str:
        """
        Create a training script that can be run on HuggingFace Spaces.
        
        Returns:
            Path to the training script
        """
        
        script_content = f'''#!/usr/bin/env python3
"""
TextShift LoRA Training Script for {model_type}
Run this on HuggingFace Spaces with GPU runtime.
"""
import os
import json
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding
)
from peft import LoraConfig, get_peft_model, TaskType
from huggingface_hub import HfApi, upload_folder
import boto3

# Configuration
HF_TOKEN = os.environ.get('HF_TOKEN')
S3_ENDPOINT = os.environ.get('S3_ENDPOINT', 'https://s3.us-west-1.idrivee2.com')
S3_BUCKET = os.environ.get('S3_BUCKET', 'crop-spray-uploads')
S3_ACCESS_KEY = os.environ.get('S3_ACCESS_KEY')
S3_SECRET_KEY = os.environ.get('S3_SECRET_KEY')

BASE_MODEL = "{self.BASE_MODELS.get(model_type)}"
MODEL_TYPE = "{model_type}"

def load_training_config(config_path: str) -> dict:
    """Load training configuration from HuggingFace Hub."""
    api = HfApi(token=HF_TOKEN)
    config_file = api.hf_hub_download(
        repo_id="harryroger798/textshift-lora-adapters",
        filename=config_path,
        token=HF_TOKEN
    )
    with open(config_file) as f:
        return json.load(f)

def train_lora(config: dict):
    """Run LoRA fine-tuning."""
    
    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL,
        num_labels=2,
        torch_dtype=torch.float16
    )
    
    # Configure LoRA
    lora_config = LoraConfig(
        r=config['lora_config']['r'],
        lora_alpha=config['lora_config']['lora_alpha'],
        lora_dropout=config['lora_config']['lora_dropout'],
        target_modules=config['lora_config']['target_modules'],
        bias=config['lora_config']['bias'],
        task_type=TaskType.SEQ_CLS
    )
    
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    # Load dataset
    dataset = load_dataset(
        'json',
        data_files={{
            'train': f"hf://harryroger798/textshift-lora-adapters/{{config['dataset_path']}}"
        }},
        token=HF_TOKEN
    )
    
    # Tokenize
    def tokenize_function(examples):
        return tokenizer(
            examples['text'],
            padding='max_length',
            truncation=True,
            max_length=config['training_args']['max_seq_length']
        )
    
    tokenized_dataset = dataset.map(tokenize_function, batched=True)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=config['output_dir'],
        num_train_epochs=config['training_args']['num_train_epochs'],
        per_device_train_batch_size=config['training_args']['per_device_train_batch_size'],
        gradient_accumulation_steps=config['training_args']['gradient_accumulation_steps'],
        learning_rate=config['training_args']['learning_rate'],
        warmup_ratio=config['training_args']['warmup_ratio'],
        fp16=config['training_args']['fp16'],
        save_strategy=config['training_args']['save_strategy'],
        logging_steps=10,
        push_to_hub=False
    )
    
    # Train
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset['train'],
        data_collator=DataCollatorWithPadding(tokenizer)
    )
    
    trainer.train()
    
    # Save adapter
    model.save_pretrained(config['output_dir'])
    tokenizer.save_pretrained(config['output_dir'])
    
    # Upload to HuggingFace Hub
    upload_folder(
        folder_path=config['output_dir'],
        repo_id="harryroger798/textshift-lora-adapters",
        path_in_repo=config['output_dir'],
        token=HF_TOKEN
    )
    
    # Upload to iDrive e2
    s3 = boto3.client(
        's3',
        endpoint_url=S3_ENDPOINT,
        aws_access_key_id=S3_ACCESS_KEY,
        aws_secret_access_key=S3_SECRET_KEY
    )
    
    for root, dirs, files in os.walk(config['output_dir']):
        for file in files:
            local_path = os.path.join(root, file)
            s3_key = f"textshift/adapters/{{config['version_name']}}/{{file}}"
            s3.upload_file(local_path, S3_BUCKET, s3_key)
            print(f"Uploaded {{s3_key}}")
    
    print(f"Training complete! Adapter saved to {{config['output_dir']}}")
    return config['output_dir']

if __name__ == '__main__':
    import sys
    config_path = sys.argv[1] if len(sys.argv) > 1 else 'training_configs/latest.json'
    config = load_training_config(config_path)
    train_lora(config)
'''
        
        script_path = f'/tmp/train_{model_type}_lora.py'
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        return script_path
    
    def download_adapter_from_hub(self, version_name: str, model_type: str) -> str:
        """
        Download trained LoRA adapter from HuggingFace Hub.
        
        Returns:
            Local path to adapter
        """
        
        adapter_path = f"adapters/{model_type}/{version_name}"
        local_dir = f"/opt/textshift/models/{model_type}_adapters/{version_name}"
        
        os.makedirs(local_dir, exist_ok=True)
        
        try:
            # Download adapter files
            for filename in ['adapter_config.json', 'adapter_model.bin']:
                try:
                    hf_hub_download(
                        repo_id=self.repo_id,
                        filename=f"{adapter_path}/{filename}",
                        local_dir=local_dir,
                        token=self.hf_token
                    )
                except Exception as e:
                    logger.warning(f"Could not download {filename}: {e}")
            
            logger.info(f"Downloaded adapter to {local_dir}")
            return local_dir
            
        except Exception as e:
            logger.error(f"Failed to download adapter: {e}")
            raise
    
    def download_adapter_from_s3(self, version_name: str) -> str:
        """
        Download trained LoRA adapter from iDrive e2.
        
        Returns:
            Local path to adapter
        """
        
        local_dir = f"/opt/textshift/models/adapters/{version_name}"
        os.makedirs(local_dir, exist_ok=True)
        
        s3 = self._get_s3_client()
        
        try:
            # List objects in adapter folder
            response = s3.list_objects_v2(
                Bucket=settings.S3_BUCKET,
                Prefix=f"textshift/adapters/{version_name}/"
            )
            
            for obj in response.get('Contents', []):
                key = obj['Key']
                filename = os.path.basename(key)
                local_path = os.path.join(local_dir, filename)
                
                s3.download_file(settings.S3_BUCKET, key, local_path)
                logger.info(f"Downloaded {key} to {local_path}")
            
            return local_dir
            
        except Exception as e:
            logger.error(f"Failed to download adapter from S3: {e}")
            raise
    
    def upload_adapter_to_s3(self, local_dir: str, version_name: str) -> str:
        """
        Upload trained adapter to iDrive e2 for persistence.
        
        Returns:
            S3 path
        """
        
        s3 = self._get_s3_client()
        s3_prefix = f"textshift/adapters/{version_name}"
        
        try:
            for filename in os.listdir(local_dir):
                local_path = os.path.join(local_dir, filename)
                if os.path.isfile(local_path):
                    s3_key = f"{s3_prefix}/{filename}"
                    s3.upload_file(local_path, settings.S3_BUCKET, s3_key)
                    logger.info(f"Uploaded {filename} to s3://{settings.S3_BUCKET}/{s3_key}")
            
            return f"s3://{settings.S3_BUCKET}/{s3_prefix}"
            
        except Exception as e:
            logger.error(f"Failed to upload adapter to S3: {e}")
            raise
    
    def get_adapter_info(self, version_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a trained adapter."""
        
        try:
            # Try to get from HuggingFace Hub
            config_path = f"adapters/{version_name.split('_')[-1]}/adapter_config.json"
            
            local_config = hf_hub_download(
                repo_id=self.repo_id,
                filename=config_path,
                token=self.hf_token
            )
            
            with open(local_config) as f:
                config = json.load(f)
            
            return {
                'version_name': version_name,
                'config': config,
                'hub_path': f"{self.repo_id}/{config_path}",
                'status': 'available'
            }
            
        except Exception as e:
            logger.warning(f"Could not get adapter info: {e}")
            return None
    
    def list_available_adapters(self, model_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all available adapters on HuggingFace Hub."""
        
        try:
            # List files in repo
            files = self.hf_api.list_repo_files(
                repo_id=self.repo_id,
                token=self.hf_token
            )
            
            adapters = []
            seen_versions = set()
            
            for file_path in files:
                if file_path.startswith('adapters/') and 'adapter_config.json' in file_path:
                    parts = file_path.split('/')
                    if len(parts) >= 3:
                        adapter_model_type = parts[1]
                        version = parts[2]
                        
                        if model_type and adapter_model_type != model_type:
                            continue
                        
                        if version not in seen_versions:
                            seen_versions.add(version)
                            adapters.append({
                                'model_type': adapter_model_type,
                                'version': version,
                                'path': f"adapters/{adapter_model_type}/{version}"
                            })
            
            return adapters
            
        except Exception as e:
            logger.error(f"Failed to list adapters: {e}")
            return []
