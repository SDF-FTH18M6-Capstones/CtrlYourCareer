import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldPlus,
  UserRound,
  Mail,
  LockKeyhole,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";

import Brand from "../components/Brand";
import { adminRegistrationApi } from "../services/adminRegistration";
import "./AdminRegister.css";

function SecretField({
  label,
  value,
  onChange,
  placeholder,
  numeric = false,
  autoComplete = "new-password",
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      {label}

      <div className="input-wrap">
        {numeric ? <KeyRound size={18} /> : <LockKeyhole size={18} />}

        <input
          required
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={numeric ? "numeric" : undefined}
          maxLength={numeric ? 6 : undefined}
          pattern={numeric ? "[0-9]{6}" : undefined}
          onChange={(e) => {
            const next = e.target.value;

            onChange(numeric ? next.replace(/[^0-9]/g, "").slice(0, 6) : next);
          }}
        />

        <button
          type="button"
          className="eye-button"
          aria-label={`${visible ? "Hide" : "Show"} ${label}`}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

export default function AdminRegister({
  invitationToken = null,
  onBack,
  onLogin,
}) {
  const invited = Boolean(invitationToken);

  const [checking, setChecking] = useState(true);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    let active = true;

    async function initialize() {
      setChecking(true);
      setError("");
      setAvailable(false);

      try {
        if (invited) {
          const result =
            await adminRegistrationApi.validateInvitation(invitationToken);

          if (!active) return;

          setEmail(result.email);
          setAvailable(result.valid === true);
        } else {
          const result = await adminRegistrationApi.getSetupStatus();

          if (!active) return;

          setAvailable(result.setup_available === true);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [invitationToken, invited]);

  async function submit(e) {
    e.preventDefault();

    if (busy || !available) return;

    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 12) {
      setError("Your password must have at least 12 characters.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError("Your password must not exceed 72 bytes.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!/^[0-9]{6}$/.test(pin)) {
      setError("Your administrator PIN must contain exactly 6 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setError("Your PINs do not match.");
      return;
    }

    if (!invited && !setupKey.trim()) {
      setError("Please enter the administrator setup key.");
      return;
    }

    setBusy(true);

    const payload = {
      username: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      pin,
    };

    try {
      if (invited) {
        await adminRegistrationApi.acceptInvitation({
          ...payload,
          token: invitationToken,
        });
      } else {
        await adminRegistrationApi.registerFirstAdmin({
          ...payload,
          setup_key: setupKey,
        });
      }

      setPassword("");
      setConfirmPassword("");
      setPin("");
      setConfirmPin("");
      setSetupKey("");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell admin-register-shell">
      <div className="auth-aside">
        <button className="brand-button" onClick={onBack} type="button">
          <Brand light />
        </button>

        <div className="auth-aside-copy">
          <span className="eyebrow">
            <ShieldCheck size={16} />
            SECURE ADMINISTRATION
          </span>

          <h2>
            Empower careers.
            <br />
            <em>Lead the future.</em>
          </h2>

          <p>
            Manage career opportunities, monitor user progress, and help
            individuals build meaningful professional journeys.
          </p>

          <div className="admin-register-features">
            <div>
              <ShieldCheck size={21} />
              <span>Secure administrator access</span>
            </div>

            <div>
              <Users size={21} />
              <span>User progress and career monitoring</span>
            </div>

            <div>
              <KeyRound size={21} />
              <span>Personal PIN verification</span>
            </div>
          </div>
        </div>

        <div className="aside-footer">YOUR LEADERSHIP. THEIR FUTURE.</div>
      </div>

      <div className="auth-main">
        <button className="back-link" type="button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back to home
        </button>

        <div className="auth-form-wrap admin-register-form">
          <div className="form-badge">
            <ShieldPlus size={17} />
            ADMINISTRATOR REGISTRATION
          </div>

          {checking ? (
            <div className="admin-register-state">
              <div className="admin-register-spinner" />
              <h2>Checking availability</h2>
              <p>Please wait while we verify your registration access.</p>
            </div>
          ) : success ? (
            <div className="admin-register-state">
              <div className="admin-register-state-icon success">
                <CheckCircle2 size={36} />
              </div>

              <h1>Account created!</h1>

              <p>
                Your administrator account is ready. Log in using your email and
                password, then verify your personal PIN.
              </p>

              <button
                className="btn btn-primary btn-submit"
                type="button"
                onClick={onLogin}
              >
                Continue to login
                <ArrowRight size={19} />
              </button>
            </div>
          ) : !available ? (
            <div className="admin-register-state">
              <div className="admin-register-state-icon warning">
                <AlertCircle size={36} />
              </div>

              <h1>
                {invited
                  ? "Invitation unavailable"
                  : "Registration unavailable"}
              </h1>

              <p>
                {error ||
                  (invited
                    ? "Please request a new invitation from an administrator."
                    : "Administrator key registration is currently unavailable. Please request an invitation from an administrator.")}
              </p>

              <button
                className="btn btn-primary btn-submit"
                type="button"
                onClick={onLogin}
              >
                Back to login
                <ArrowRight size={19} />
              </button>
            </div>
          ) : (
            <>
              <h1>Create administrator account</h1>

              <p className="form-intro">
                {invited
                  ? "You've been invited to join the CtrlYourCareer administration team."
                  : "Create an administrator account using your secret administrator setup key."}
              </p>

              <div className="admin-register-notice">
                <ShieldCheck size={21} />

                <div>
                  <strong>
                    {invited
                      ? "Verified invitation"
                      : "Administrator key registration"}
                  </strong>

                  <p>
                    {invited
                      ? "This invitation is linked to your email address."
                      : "A valid administrator setup key is required to create this account."}
                  </p>
                </div>
              </div>

              <form onSubmit={submit}>
                <label>
                  Full name
                  <div className="input-wrap">
                    <UserRound size={18} />

                    <input
                      required
                      maxLength={80}
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </label>

                <label>
                  Email address
                  <div className="input-wrap">
                    <Mail size={18} />

                    <input
                      required
                      type="email"
                      maxLength={120}
                      autoComplete="email"
                      placeholder="admin@example.com"
                      value={email}
                      readOnly={invited}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </label>

                <SecretField
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 12 characters"
                />

                <SecretField
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter your password"
                />

                {!invited && (
                  <SecretField
                    label="Administrator setup key"
                    value={setupKey}
                    onChange={setSetupKey}
                    placeholder="Enter your secret setup key"
                    autoComplete="off"
                  />
                )}

                <div className="admin-register-divider">
                  <KeyRound size={19} />
                  <span>Administrator security PIN</span>
                </div>

                <p className="admin-register-hint">
                  Create a private six-digit PIN. You will need it whenever you
                  log in as an administrator.
                </p>

                <div className="admin-register-pin-grid">
                  <SecretField
                    label="Personal PIN"
                    value={pin}
                    onChange={setPin}
                    placeholder="6-digit PIN"
                    numeric
                    autoComplete="off"
                  />

                  <SecretField
                    label="Confirm PIN"
                    value={confirmPin}
                    onChange={setConfirmPin}
                    placeholder="Confirm PIN"
                    numeric
                    autoComplete="off"
                  />
                </div>

                {error && (
                  <div className="error" role="alert">
                    {error}
                  </div>
                )}

                <button
                  className="btn btn-primary btn-submit"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? "Creating account…" : "Create administrator account"}

                  {!busy && <ArrowRight size={19} />}
                </button>
              </form>

              <div className="auth-switch">
                Already an administrator?{" "}
                <button type="button" onClick={onLogin}>
                  Log in
                </button>
              </div>
            </>
          )}

          <p className="auth-note">
            <ShieldCheck size={15} />
            Protected administrator registration
          </p>
        </div>
      </div>
    </div>
  );
}
