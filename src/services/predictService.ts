// src/services/predictService.ts

export async function predictStroke(imageFile: File) {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch("http://127.0.0.1:5002/predict", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.error || `Backend error: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error("Prediction request failed:", error);
    throw error;
  }
}
