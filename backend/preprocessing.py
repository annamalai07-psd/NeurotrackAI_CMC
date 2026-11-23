import io
import site
import sys

import cv2
import numpy as np
from PIL import Image


USER_SITE = site.getusersitepackages()
if USER_SITE and USER_SITE not in sys.path:
    sys.path.append(USER_SITE)

try:
    import pydicom
except ImportError:  # pragma: no cover
    pydicom = None


IMG_SIZE = 256
WINDOW_CENTER = 40
WINDOW_WIDTH = 80
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".dcm"}


def dicom_to_png_hu(dicom_path) -> np.ndarray:
    global pydicom

    if pydicom is None:
        try:
            import pydicom as _pydicom
        except ImportError as exc:
            raise ImportError(
                "pydicom is required to process DICOM files."
            ) from exc
        pydicom = _pydicom

    try:
        dataset = pydicom.dcmread(dicom_path)
        pixels = dataset.pixel_array.astype(np.float32)
    except Exception as exc:
        raise ValueError(f"Unable to read DICOM file: {exc}") from exc

    if pixels.size == 0:
        raise ValueError("DICOM file does not contain image data.")

    slope = float(getattr(dataset, "RescaleSlope", 1) or 1)
    intercept = float(getattr(dataset, "RescaleIntercept", 0) or 0)

    hu_image = pixels * slope + intercept

    lower = WINDOW_CENTER - (WINDOW_WIDTH / 2)
    upper = WINDOW_CENTER + (WINDOW_WIDTH / 2)

    windowed = np.clip(hu_image, lower, upper)
    normalized = (windowed - lower) / max(upper - lower, 1)

    image_8bit = (normalized * 255.0).astype(np.uint8)

    resized = cv2.resize(
        image_8bit,
        (IMG_SIZE, IMG_SIZE),
        interpolation=cv2.INTER_AREA
    )

    return resized


def standard_image_to_gray(image_bytes: bytes) -> np.ndarray:
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)

    img = cv2.imdecode(
        image_array,
        cv2.IMREAD_GRAYSCALE
    )

    if img is None or img.size == 0:
        raise ValueError("Unable to decode image file.")

    # Match the original training preprocessing.
    return cv2.resize(
        img,
        (IMG_SIZE, IMG_SIZE),
        interpolation=cv2.INTER_LINEAR
    )


def load_processed_image(file_storage):
    filename = (file_storage.filename or "").lower()
    extension = filename[filename.rfind("."):] if "." in filename else ""

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            "Unsupported file type. Allowed types: "
            ".png, .jpg, .jpeg, .dcm"
        )

    file_bytes = file_storage.read()

    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    if extension == ".dcm":
        img_gray = dicom_to_png_hu(io.BytesIO(file_bytes))
    else:
        img_gray = standard_image_to_gray(file_bytes)

    pil_image = Image.fromarray(img_gray)

    normalized = img_gray.astype(np.float32) / 255.0

    batch = normalized.reshape(
        1, IMG_SIZE, IMG_SIZE, 1
    )

    return pil_image, batch
