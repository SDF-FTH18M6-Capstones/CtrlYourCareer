import { useRef, useState } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import "./AdminPin.css";

export default function AdminPin({ onVerify, onCancel }) {
  const [pin, setPin] = useState(Array(6).fill(""));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef([]);

  const pinValue = pin.join("");
  const isComplete = /^\d{6}$/.test(pinValue);

  function handleChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updated = [...pin];
    updated[index] = digit;

    setPin(updated);
    setError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace") {
      event.preventDefault();

      const updated = [...pin];

      if (updated[index]) {
        updated[index] = "";
      } else if (index > 0) {
        updated[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      setPin(updated);
      setError("");
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const updated = Array(6).fill("");

    pasted.split("").forEach((digit, index) => {
      updated[index] = digit;
    });

    setPin(updated);
    setError("");

    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isComplete || loading) return;

    try {
      setLoading(true);
      setError("");

      await onVerify(pinValue);
    } catch (err) {
      setError(err.message || "PIN verification failed.");

      setPin(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cyc-pin-page">
      <div className="cyc-pin-background-circle circle-one" />
      <div className="cyc-pin-background-circle circle-two" />

      <div className="cyc-pin-container">
        {/* BRAND */}

        <div className="cyc-pin-brand">
          <div className="cyc-pin-brand-icon">
            <ShieldCheck size={25} />
          </div>

          <span>
            Ctrl<span>Your</span>Career
          </span>
        </div>

        {/* VERIFICATION CARD */}

        <div className="cyc-pin-card">
          <div className="cyc-pin-icon-wrapper">
            <div className="cyc-pin-icon">
              <LockKeyhole size={30} />
            </div>
          </div>

          <div className="cyc-pin-badge">
            <ShieldCheck size={14} />
            SECURE ADMIN ACCESS
          </div>

          <h1>Admin Verification</h1>

          <p className="cyc-pin-description">
            One more step to secure your account. Enter your unique six-digit
            administrator PIN to access the CtrlYourCareer dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="cyc-pin-label">ENTER YOUR 6-DIGIT PIN</label>

            <div
              className="cyc-pin-input-group"
              onPaste={handlePaste}
              role="group"
              aria-label="Six-digit administrator PIN"
            >
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="password"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  aria-label={`PIN digit ${index + 1}`}
                  className={digit ? "filled" : ""}
                />
              ))}
            </div>

            {error && (
              <div className="cyc-pin-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="cyc-pin-submit"
              disabled={!isComplete || loading}
            >
              {loading ? (
                <>
                  <span className="cyc-pin-spinner" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            className="cyc-pin-back"
            onClick={onCancel}
            disabled={loading}
          >
            <ArrowLeft size={17} />
            Back to login
          </button>

          <div className="cyc-pin-security-note">
            <CheckCircle2 size={16} />

            <span>
              Your PIN is verified securely. Never share it with anyone.
            </span>
          </div>
        </div>

        <p className="cyc-pin-footer">
          © {new Date().getFullYear()} CtrlYourCareer. Secure administrator
          portal.
        </p>
      </div>
    </div>
  );
}
