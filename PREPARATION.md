# NeuroTrackAI: Guide for Doctors and Medical Students

This guide explains what NeuroTrackAI does, how to set it up on a computer, how to prepare CT images, and how to read its results. No programming knowledge is needed.

> ⚠️ **Important**
> NeuroTrackAI is a **research prototype that assists, but does not replace, a radiologist**.
> It is **not a certified medical device**. Never use its output as the sole basis for diagnosis, thrombolysis, or any other treatment decision.

---

## 1. What is NeuroTrackAI?

NeuroTrackAI looks at a **single brain CT image** and answers one question:

> *Does this slice show signs of ischemic stroke?*

It returns:

| Output | Meaning |
|---|---|
| **Stroke Detected** (red banner) | The model found features it associates with ischemic stroke |
| **Normal** (green banner) | The model did not find such features |
| **Confidence %** | How strongly the model leans towards the result shown (see Section 6) |
| **Red-shaded image** (only for Stroke) | The area the model thinks is affected |

It was developed using CT scans from **Coimbatore Medical College Hospital (CMCH)** and **Government Hospital (GH)**.

### Where it can help

- A quick **second look** in the emergency department while waiting for the radiologist's report
- **Teaching**: comparing the model's highlighted region with your own reading of the scan
- **Triage support**: flagging scans that may need urgent radiology review

### Where it must not be used

- As a replacement for a radiologist's report
- To decide on thrombolysis or thrombectomy
- On patients or scan types it was not designed for (see Section 7)

---

## 2. What you need

| Item | Details |
|---|---|
| Computer | Windows 10/11 or macOS, at least 8 GB RAM |
| Disk space | About 3 GB free |
| Internet | Only for the one-time installation |
| Model file | `finalbest_stroke_system.pth` (about 96 MB), obtained from the project team |
| Software | Node.js and Python (installed in Section 3) |

> 💡 If your department has IT support, ask them to do Section 3 once. After that, you only need Section 4 each day.

---

## 3. One-time setup

### Step 1: Install the required software

1. **Python 3.11**: download from https://www.python.org/downloads/
   - During installation, **tick "Add Python to PATH"**.
2. **Node.js (LTS version)**: download from https://nodejs.org/ and install with the default options.

### Step 2: Get the project

Download the project from GitHub:
https://github.com/annamalai07-psd/NeurotrackAI_CMC

Click the green **Code** button, then **Download ZIP**, and extract the ZIP to a folder such as `Documents\NeuroTrackAI`.

### Step 3: Add the model file

The model file is **not included in the download** because it was trained on patient data. Request it from the project team, then place it here:

```
NeuroTrackAI\
  backend\
    model\
      finalbest_stroke_system.pth
```

Create the `model` folder inside `backend` if it does not exist. The file name must match exactly.

### Step 4: Install the components

Open **PowerShell** inside the `NeuroTrackAI` folder: hold **Shift**, right-click an empty area of the folder, and choose **Open PowerShell window here**. Then run these commands one at a time:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
npm install
```

This downloads about 2 GB and can take 10–20 minutes.

> If PowerShell says *"running scripts is disabled"*, run this once and then try again:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

---

## 4. Starting NeuroTrackAI (every time)

You need **two PowerShell windows**, both opened inside the `NeuroTrackAI` folder.

**Window 1: start the analysis engine**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python app.py
```

Wait until you see **`Models loaded successfully`**. Keep this window open.

**Window 2: start the app**

```powershell
npm run start:frontend
```

Then open **http://localhost:8080** in Chrome or Edge.

To stop NeuroTrackAI, close both PowerShell windows.

---

## 5. Preparing the CT image

The quality of the result depends heavily on the image you give it.

### Accepted formats

| Format | Notes |
|---|---|
| **DICOM (.dcm)** | ✅ Preferred. Exported directly from PACS or the CT console. The app applies the brain window automatically (W 80 / L 40). |
| **PNG / JPG / JPEG** | Accepted. Export the slice **already in brain window** (W 80 / L 40), without annotations or measurement overlays. |

### What kind of image

- **Non-contrast CT (NCCT) of the brain**
- **Axial** slice
- **One slice per upload**. Choose a slice through the region of clinical concern, for example at the level of the basal ganglia or the suspected vascular territory
- Whole head visible, not cropped or zoomed
- No arrows, text, rulers or other markings drawn on the image

### Avoid

- Contrast-enhanced CT, CT angiography or CT perfusion maps
- MRI images
- Photos of a monitor or of printed film taken with a phone
- Bone-window or lung-window images

### Protect patient privacy

Before using or sharing any image:

- Use **anonymized** files. Remove the patient's name, hospital number and date of birth.
- When exporting DICOM from PACS, choose the **anonymize / de-identify** option if it is available.
- Never upload patient images to public websites or personal cloud storage.

NeuroTrackAI runs **entirely on your own computer**. Images are processed in memory and are **not saved or sent anywhere**.

---

## 6. Using the app and reading the result

### Steps

1. Click **Choose File** and select the CT image.
2. Click **Start Analysis**. The result appears within a few seconds.
3. Read the result banner and images.
4. Click **New Analysis** to check another image.

### Understanding the result

**🟢 Normal**
The model did not detect features of ischemic stroke **on this slice**. This does **not** rule out stroke (see Section 7).

**🔴 Stroke Detected**
The model found features it associates with ischemic stroke. Two images are shown:
- **Left:** the slice as the model saw it
- **Right:** the same slice with the suspected region **shaded red**

Always compare the red region with your own reading. Ask yourself whether it matches the patient's clinical deficit and a plausible vascular territory.

### About the confidence percentage

The confidence shows how strongly the model leans towards the result. It is **not** a clinical probability.

- The model is deliberately **sensitive**. It flags *Stroke* even at a fairly low internal score, so as not to miss cases.
- A **Stroke result with low confidence** (for example 30–50%) means *"possible, needs careful review"*, not *"definite stroke"*.
- A **Normal result with high confidence** still does not exclude early or small infarcts.

---

## 7. Limitations: please read

| Limitation | What it means for you |
|---|---|
| **Analyses one 2D slice** | A stroke on other slices can be missed. Check several representative slices. |
| **Early (hyperacute) ischemia** | CT can look normal in the first hours after onset. A *Normal* result early on is expected and does not exclude stroke. |
| **Trained for ischemic stroke only** | It is not designed to detect haemorrhage, tumour, abscess, trauma or other pathology. Do not rely on it for these. |
| **Old infarcts and other hypodensities** | Chronic infarcts, gliosis, white-matter changes or artefacts may be flagged as stroke. |
| **Limited training data** | Trained on scans from two hospitals. Performance may differ with other CT scanners, protocols or patient groups. |
| **Children** | Not validated for paediatric scans. |
| **Image quality** | Motion, beam-hardening or metal artefacts reduce reliability. |

**The clinical picture always takes priority.** Time of onset, NIHSS score, examination findings and the radiologist's report come first.

---

## 8. Suggested uses for medical students

- **Before** running the model, write down your own reading: *Is there an infarct? Where? Which territory?* Then compare it with the model's output.
- Look for the **early CT signs of ischemia** and check whether the red region overlaps them:
  - loss of grey–white matter differentiation
  - insular ribbon sign
  - obscured lentiform nucleus
  - sulcal effacement
  - hyperdense MCA sign (the model may not highlight this)
- Practise **ASPECTS** scoring on the same slices and compare.
- Discuss **false positives and false negatives** with your faculty. Learning why the model was wrong is as valuable as when it is right.

---

## 9. Troubleshooting

| Problem | Solution |
|---|---|
| Page at http://localhost:8080 does not open | Check that Window 2 is still running. Run `npm run start:frontend` again. |
| An error appears when you click *Start Analysis* | Window 1 (the analysis engine) is not running or has not finished loading. Wait for *Models loaded successfully*. |
| `FileNotFoundError ... finalbest_stroke_system.pth` | The model file is missing or in the wrong folder. See Section 3, Step 3. |
| *"Select a PNG, JPG, JPEG, or DCM file"* | The file type is not supported. Export the image again as DICOM or PNG. |
| *"Unable to read DICOM file"* | The file may be damaged or compressed in an unsupported way. Export it again from PACS, or save the slice as PNG in brain window. |
| `python` or `npm` is "not recognized" | Python or Node.js is not installed, or *Add to PATH* was not ticked. Reinstall them, then restart the computer. |

---

## 10. Glossary

| Term | Meaning |
|---|---|
| **AI model** | A computer program that learned patterns from many example CT scans |
| **DICOM** | The standard file format for medical images, used by PACS and CT scanners |
| **PACS** | The hospital system that stores and displays radiology images |
| **Brain window (W 80 / L 40)** | The CT display setting that best shows brain tissue |
| **NCCT** | Non-contrast CT |
| **False positive** | The model says *Stroke* when there is none |
| **False negative** | The model says *Normal* when a stroke is present |
| **Segmentation / red overlay** | The model's outline of the region it thinks is affected |

---

## 11. Contact and feedback

If you have questions, need the model file, or find a case where the result was clearly wrong, please contact the project team through the GitHub repository:
https://github.com/annamalai07-psd/NeurotrackAI_CMC

When reporting a case, **never share patient-identifying information**. Describe the case or send an anonymized image only.

---

*NeuroTrackAI is a research and educational prototype developed with data from CMCH and GH. It is intended to support, not replace, clinical judgement and radiological reporting.*
