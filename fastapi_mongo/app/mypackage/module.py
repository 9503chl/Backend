from pymongo import MongoClient
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from bson import json_util
import hashlib
from datetime import datetime, timedelta