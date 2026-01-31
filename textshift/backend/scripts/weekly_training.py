#!/usr/bin/env python3
"""
Weekly Training Cron Script for TextShift Self-Learning ML System.

This script is designed to be run via cron job every Sunday at 3 AM UTC.
It triggers the incremental training pipeline if sufficient feedback samples
have been collected.

Cron entry (add to /etc/crontab or use crontab -e):
0 3 * * 0 /opt/textshift/backend/venv/bin/python /opt/textshift/backend/scripts/weekly_training.py >> /var/log/textshift/training.log 2>&1

Usage:
    python weekly_training.py [--force] [--dry-run]
    
Options:
    --force     Run training even if minimum samples not reached
    --dry-run   Show what would be done without actually training
"""
import os
import sys
import argparse
import logging
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.services.training_pipeline import TrainingPipeline
from app.models.training_run import TrainingTrigger

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/var/log/textshift/training.log', mode='a')
    ]
)
logger = logging.getLogger('weekly_training')


def setup_database():
    """Create database session."""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


def run_weekly_training(force: bool = False, dry_run: bool = False):
    """
    Execute the weekly training pipeline.
    
    Args:
        force: Run training even if minimum samples not reached
        dry_run: Show what would be done without actually training
    """
    logger.info("=" * 60)
    logger.info(f"Weekly Training Started at {datetime.utcnow().isoformat()}")
    logger.info("=" * 60)
    
    db = setup_database()
    
    try:
        pipeline = TrainingPipeline(db)
        
        # Check if training should run
        status = pipeline.get_training_status()
        
        logger.info(f"Current Status:")
        logger.info(f"  - Samples ready: {status['samples_ready']}")
        logger.info(f"  - Minimum required: {status['minimum_samples']}")
        logger.info(f"  - Should train: {status['should_train']}")
        logger.info(f"  - Training in progress: {status['training_in_progress']}")
        
        if status['training_in_progress']:
            logger.warning("Training already in progress. Skipping.")
            return {'status': 'skipped', 'reason': 'training_in_progress'}
        
        if not status['should_train'] and not force:
            logger.info(f"Not enough samples for training. Need {status['minimum_samples']}, have {status['samples_ready']}.")
            logger.info("Use --force to train anyway.")
            return {'status': 'skipped', 'reason': 'insufficient_samples'}
        
        if dry_run:
            logger.info("DRY RUN: Would start training with the following:")
            logger.info(f"  - Trigger: {TrainingTrigger.SCHEDULED}")
            logger.info(f"  - Samples: {status['samples_ready']}")
            return {'status': 'dry_run', 'would_train': True}
        
        # Run the training
        logger.info("Starting incremental training...")
        result = pipeline.run_incremental_training(
            trigger=TrainingTrigger.SCHEDULED,
            triggered_by='cron_weekly'
        )
        
        logger.info(f"Training completed!")
        logger.info(f"  - Training Run ID: {result.get('training_run_id')}")
        logger.info(f"  - Status: {result.get('status')}")
        logger.info(f"  - Duration: {result.get('duration_minutes', 0):.2f} minutes")
        
        if result.get('models_trained'):
            logger.info("  - Models trained:")
            for model_type, model_info in result.get('models_trained', {}).items():
                logger.info(f"    - {model_type}: {model_info.get('version_name')} (accuracy: {model_info.get('accuracy', 0):.2f}%)")
        
        return result
        
    except Exception as e:
        logger.error(f"Training failed with error: {e}", exc_info=True)
        return {'status': 'error', 'error': str(e)}
        
    finally:
        db.close()
        logger.info("=" * 60)
        logger.info(f"Weekly Training Finished at {datetime.utcnow().isoformat()}")
        logger.info("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='TextShift Weekly Training Script')
    parser.add_argument('--force', action='store_true', help='Force training even with insufficient samples')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without training')
    
    args = parser.parse_args()
    
    # Ensure log directory exists
    os.makedirs('/var/log/textshift', exist_ok=True)
    
    result = run_weekly_training(force=args.force, dry_run=args.dry_run)
    
    # Exit with appropriate code
    if result.get('status') == 'error':
        sys.exit(1)
    sys.exit(0)


if __name__ == '__main__':
    main()
