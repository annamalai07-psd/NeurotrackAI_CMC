NeuroTrackAI

AI Assistant for Early Detection of Ischemic Stroke from CT Scans

Overview

NeuroTrackAI is an AI-powered assistant designed to support medical staff in detecting ischemic stroke from CT brain scans. The system analyzes CT images and predicts whether stroke indicators are present, helping provide a rapid preliminary assessment during emergency situations.

Problem

In many hospitals, radiologists may not always be available 24/7 to immediately interpret CT scans. When a patient arrives with stroke symptoms, delays in identifying stroke can affect treatment outcomes. Nurses or assistants may not have the expertise to accurately detect stroke patterns in CT scans.

Solution

NeuroTrackAI provides an AI-based assistant that analyzes CT brain scans and predicts the presence of ischemic stroke. This enables faster preliminary detection and helps medical staff identify potential stroke cases until a radiologist reviews the scan.

How It Works

Upload CT scan image

Image preprocessing

AI model analysis

Stroke detection prediction

Features

CT scan upload interface

AI-based ischemic stroke detection

Rapid preliminary assessment

Assistive decision support prototype

Tech Stack

Python

TensorFlow / PyTorch

OpenCV

FastAPI / Flask

React

Dataset

The CT scan dataset used for model development was collected from clinical imaging records at:

Coimbatore Medical College Hospital (CMCH)

Government Hospital (GH)

Due to medical data privacy and ethical considerations, the dataset and trained model weights are not publicly included in this repository.

Repository Structure
backend/
frontend/
README.md
.gitignore
Future Improvements

Support for DICOM medical imaging format

Automatic DICOM to PNG preprocessing

Integration with hospital PACS systems

Improved model accuracy with larger datasets

Important Note

NeuroTrackAI is designed to assist healthcare professionals, not replace radiologists. Final medical decisions must always be made by qualified medical experts.