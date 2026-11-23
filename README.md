# NeuroTrackAI

**AI assistant for early detection of ischemic stroke from brain CT scans.**

NeuroTrackAI analyzes a brain CT image, predicts whether ischemic stroke is present and, when it is, highlights the suspected stroke region in red. It is built to give emergency staff a rapid preliminary assessment while they wait for a radiologist.

> ⚠️ **Assistive tool only.** NeuroTrackAI does not replace a radiologist. Final medical decisions must always be made by qualified medical professionals.

---

## Why

In many hospitals a radiologist is not available around the clock. When a patient arrives with stroke symptoms, every minute matters, and nurses or duty staff may not be trained to read stroke patterns on CT. NeuroTrackAI gives them an immediate second opinion so likely stroke cases can be escalated faster.

## Features

- Upload a CT scan as **PNG, JPG, JPEG or DICOM (.dcm)**
- DICOM files are converted to Hounsfield units and windowed for brain tissue (center 40, width 80)
- Stroke / Normal classification with a confidence score
- Red overlay of the predicted stroke region
- Runs as a web app or as a desktop app (Electron)

## How it works

```
CT image ──► Preprocessing ──► Classifier ──► Normal
             (grayscale,        │
              256×256, 0–1)     └─ Stroke ──► Segmentation model ──► Red overlay of stroke region
```

The backend uses two models stored in a single checkpoint:

| Model | Role |
|---|---|
| `CNN_ViT_AttnSeg` | U-Net-style encoder/decoder with attention gates and a Vision Transformer bottleneck; outputs a stroke-region mask |
| `StrokeClassifier` | Reuses the frozen segmentation encoder and fuses its multi-scale features to classify Stroke vs Normal |

A scan is labeled **Stroke** when the classifier probability is at least `0.25`; the mask threshold is `0.5`. Both values are set at the top of `backend/app.py`.

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Python, Flask, PyTorch, OpenCV, pydicom, Pillow |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Desktop | Electron |

## Project structure

```
backend/
  app.py              Flask API (/predict, /health)
  model.py            Model architectures
  preprocessing.py    Image and DICOM preprocessing
  requirements.txt    Python dependencies
  model/              ← put the model weights here (not in the repo)
src/                  React frontend
public/               Static assets
electron.cjs          Desktop app window
```

---

## Model setup

The trained model weights are **not included in this repository**. They were trained on clinical CT scans from Coimbatore Medical College Hospital (CMCH) and Government Hospital (GH), so they are shared only on request for privacy and ethical reasons.

### 1. Get the weights

Request the file **`finalbest_stroke_system.pth`** (≈ 96 MB) by opening an issue on this repository or contacting the repository owner.

### 2. Place the file

Create the `model` folder inside `backend/` and put the file there:

```
backend/
  model/
    finalbest_stroke_system.pth
```

The backend loads it from `backend/model/finalbest_stroke_system.pth` (set by `MODEL_PATH` in `backend/app.py`). If you rename or move the file, update `MODEL_PATH` to match.

### 3. Checkpoint format

The `.pth` file is a PyTorch dictionary with two state dicts:

```python
{
    "segmentation_model":   CNN_ViT_AttnSeg().state_dict(),
    "classification_model": StrokeClassifier(seg_model).state_dict(),
}
```

If you train your own model, save it in the same format so `app.py` can load it.

### 4. Verify

Start the backend (see below). You should see:

```
🔄 Loading models...
Models loaded successfully
```

Then open http://127.0.0.1:5002/health. It should return `"status": "ok"`.

If you see `FileNotFoundError: model/finalbest_stroke_system.pth`, the file is missing or in the wrong folder, or the backend was not started from inside `backend/`.

> 🔒 Never commit the weights. `backend/model/` and `*.pth` are already in `.gitignore`.

---

## Installation

### Requirements

- **Node.js** 18 or newer
- **Python** 3.10 – 3.12
- About 3 GB of free disk space (PyTorch and Electron)
- A GPU is optional; the model runs on CPU

### Backend

**Windows (PowerShell)**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**macOS / Linux**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

For a smaller CPU-only install, run `pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu` before installing the requirements.

### Frontend

From the project root:

```bash
npm install
```

## Running

Start each part in its own terminal, from the project root.

**1. Backend** (http://127.0.0.1:5002)

```powershell
cd backend
.\.venv\Scripts\Activate.ps1      # macOS/Linux: source .venv/bin/activate
python app.py
```

**2. Frontend** (http://localhost:8080)

```bash
npm run start:frontend
```

**3. Desktop app (optional)**

```bash
npm run electron
```

Or simply open http://localhost:8080 in a browser.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Backend status |
| `POST` | `/predict` | Form field `file`: a `.png`, `.jpg`, `.jpeg` or `.dcm` CT image |

Example response:

```json
{
  "prediction": "Stroke",
  "confidence": 87.4,
  "color": "red",
  "original_image_base64": "...",
  "overlayed_image_base64": "..."
}
```

`overlayed_image_base64` is returned only when a stroke is detected.

---

## Dataset

The CT scan dataset was collected from clinical imaging records at:

- Coimbatore Medical College Hospital (CMCH)
- Government Hospital (GH)

Because of medical data privacy and ethical considerations, the dataset and trained weights are not publicly available.

## Future improvements

- Integration with hospital PACS systems
- Multi-slice (3D) CT analysis
- Higher accuracy with a larger, multi-centre dataset
- User login and audit logging for clinical deployment

## Disclaimer

NeuroTrackAI is a research prototype intended to assist healthcare professionals. It is not a certified medical device and must not be used as the sole basis for diagnosis or treatment.
