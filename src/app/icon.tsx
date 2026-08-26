import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8F6F4",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <polygon points="14,3 28,11 28,27 14,35 0,27 14,19 0,11" fill="#FFCF99" />
          <polygon points="20,1 34,9 34,25 20,33 6,25 6,9" fill="#407BFF" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
