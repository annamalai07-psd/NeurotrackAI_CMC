
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np
import cv2
from PIL import Image
import io, base64
import importlib.util
import sys

from model import CNN_ViT_AttnSeg, StrokeClassifier
from preprocessing import IMG_SIZE, load_processed_image


DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLS_THRESHOLD = 0.25
SEG_THRESHOLD = 0.5

MODEL_PATH = "model/finalbest_stroke_system.pth"


print("🔄 Loading models...")
ckpt = torch.load(MODEL_PATH, map_location=DEVICE)

seg_model = CNN_ViT_AttnSeg().to(DEVICE)
seg_model.load_state_dict(ckpt["segmentation_model"])
seg_model.eval()

cls_model = StrokeClassifier(seg_model).to(DEVICE)
cls_model.load_state_dict(ckpt["classification_model"])
cls_model.eval()

print("Models loaded successfully")

app = Flask(__name__)
CORS(app)


def pil_to_base64(img: Image.Image):
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def preprocess(batch: np.ndarray):
    x = torch.from_numpy(batch).permute(0, 3, 1, 2).float().to(DEVICE)
    return x


def create_red_overlay(img_gray, mask):
    img_rgb = cv2.cvtColor(
        np.array(img_gray.resize((IMG_SIZE, IMG_SIZE))),
        cv2.COLOR_GRAY2RGB
    )
    overlay = img_rgb.copy()
    overlay[mask == 1] = [255, 0, 0]
    blended = cv2.addWeighted(img_rgb, 0.6, overlay, 0.4, 0)
    return Image.fromarray(blended)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "python_executable": sys.executable,
        "pydicom_available": importlib.util.find_spec("pydicom") is not None,
    })


@app.route("/predict", methods=["POST"])
def predict():
    file = request.files.get("file")
    if file is None:
        return jsonify({"error": "No file provided."}), 400

    try:
        img_gray, batch = load_processed_image(file)
        x = preprocess(batch)
    except ImportError as exc:
        return jsonify({"error": str(exc)}), 500
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    with torch.no_grad():
        logit = cls_model(x)
        prob = torch.sigmoid(logit).item()

    # Confidence of the predicted class
    if prob < CLS_THRESHOLD:
        confidence = round((1.0 - prob) * 100, 2)
    else:
        confidence = round(prob * 100, 2)

    # ---------- NORMAL ----------
    if prob < CLS_THRESHOLD:
        return jsonify({
            "prediction": "Normal",
            "confidence": confidence,
            "color": "green",
            "original_image_base64": pil_to_base64(img_gray)
        })

    # ---------- STROKE ----------
    with torch.no_grad():
        seg_logits = seg_model(x)
        seg_prob = torch.sigmoid(seg_logits)[0, 0].cpu().numpy()

    mask = (seg_prob > SEG_THRESHOLD).astype(np.uint8)
    overlay_img = create_red_overlay(img_gray, mask)

    return jsonify({
        "prediction": "Stroke",
        "confidence": confidence,
        "color": "red",
        "original_image_base64": pil_to_base64(img_gray),
        "overlayed_image_base64": pil_to_base64(overlay_img)
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
