import { useState, useEffect } from "react";

const initialAddresses = [
  {
    id: 1,
    name: "Priya Sharma",
    house: "42B, Sector 15",
    city: "Chandigarh",
    pincode: "160015",
    phone: "9876543210",
    isDefault: true,
  },
  {
    id: 2,
    name: "Rohan Sharma",
    house: "7, Green Park Colony",
    city: "Ludhiana",
    pincode: "141001",
    phone: "9988776655",
    isDefault: false,
  },
];

const emptyForm = { name: "", house: "", city: "", pincode: "", phone: "" };

export default function AddressManager() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.house.trim()) e.house = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter valid 10-digit phone";
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newAddr = { ...form, id: Date.now(), isDefault: addresses.length === 0 };
    setAddresses(prev => [...prev, newAddr]);
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
    flash("Address saved successfully!");
  };

  const handleDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    flash("Default address updated!");
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setAddresses(prev => {
        const filtered = prev.filter(a => a.id !== id);
        if (filtered.length && prev.find(a => a.id === id)?.isDefault) {
          filtered[0].isDefault = true;
        }
        return filtered;
      });
      setDeletingId(null);
      flash("Address removed.");
    }, 350);
  };

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2800);
  };

  return (
    <div style={styles.page}>
      {/* Noise overlay */}
      <div style={styles.noise} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>🏠</span>
          <span style={styles.logoText}>HomeNeeds</span>
        </div>
        <div style={styles.breadcrumb}>Account &rsaquo; Delivery Addresses</div>
      </header>

      <main style={styles.main}>
        {/* Page title row */}
        <div style={styles.titleRow}>
          <div>
            <h1 style={styles.pageTitle}>Delivery Addresses</h1>
            <p style={styles.pageSubtitle}>
              {addresses.length} saved address{addresses.length !== 1 ? "es" : ""}
            </p>
          </div>
          <button
            style={{ ...styles.addBtn, ...(showForm ? styles.addBtnActive : {}) }}
            onClick={() => { setShowForm(v => !v); setForm(emptyForm); setErrors({}); }}
          >
            <span style={styles.addBtnIcon}>{showForm ? "✕" : "+"}</span>
            {showForm ? "Cancel" : "Add Address"}
          </button>
        </div>

        {/* Toast */}
        <div style={{ ...styles.toast, ...(successMsg ? styles.toastVisible : {}) }}>
          <span style={styles.toastIcon}>✓</span> {successMsg}
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>New Delivery Address</h2>
            <div style={styles.formGrid}>
              <Field label="Full Name" id="name" value={form.name} error={errors.name}
                placeholder="e.g. Priya Sharma"
                onChange={v => setForm(f => ({ ...f, name: v }))} />
              <Field label="House / Flat / Building" id="house" value={form.house} error={errors.house}
                placeholder="e.g. 42B, Sector 15"
                onChange={v => setForm(f => ({ ...f, house: v }))} />
              <Field label="City" id="city" value={form.city} error={errors.city}
                placeholder="e.g. Chandigarh"
                onChange={v => setForm(f => ({ ...f, city: v }))} />
              <Field label="Pincode" id="pincode" value={form.pincode} error={errors.pincode}
                placeholder="6-digit pincode"
                onChange={v => setForm(f => ({ ...f, pincode: v }))} maxLength={6} />
              <Field label="Phone Number" id="phone" value={form.phone} error={errors.phone}
                placeholder="10-digit mobile"
                onChange={v => setForm(f => ({ ...f, phone: v }))} maxLength={10} wide />
            </div>
            <button style={styles.saveBtn} onClick={handleAdd}>Save Address →</button>
          </div>
        )}

        {/* Address Cards */}
        {addresses.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📦</div>
            <p style={styles.emptyText}>No saved addresses yet.</p>
            <p style={styles.emptyHint}>Add your first delivery address above.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {addresses.map(addr => (
              <AddressCard
                key={addr.id}
                addr={addr}
                deleting={deletingId === addr.id}
                onDefault={() => handleDefault(addr.id)}
                onDelete={() => handleDelete(addr.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, id, value, error, placeholder, onChange, maxLength, wide }) {
  return (
    <div style={{ ...styles.field, ...(wide ? styles.fieldWide : {}) }}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
      />
      {error && <span style={styles.errorMsg}>{error}</span>}
    </div>
  );
}

function AddressCard({ addr, deleting, onDefault, onDelete }) {
  return (
    <div style={{
      ...styles.card,
      ...(addr.isDefault ? styles.cardDefault : {}),
      ...(deleting ? styles.cardDeleting : {}),
    }}>
      {addr.isDefault && (
        <div style={styles.defaultBadge}>
          <span>★ Default</span>
        </div>
      )}
      <div style={styles.cardName}>{addr.name}</div>
      <div style={styles.cardAddress}>
        <span style={styles.cardLine}>{addr.house}</span>
        <span style={styles.cardLine}>{addr.city} – {addr.pincode}</span>
        <span style={styles.cardPhone}>📞 {addr.phone}</span>
      </div>
      <div style={styles.cardActions}>
        {!addr.isDefault && (
          <button style={styles.defaultBtn} onClick={onDefault}>
            Set as Default
          </button>
        )}
        <button style={styles.deleteBtn} onClick={onDelete}>
          🗑 Remove
        </button>
      </div>
    </div>
  );
}

const palette = {
  bg: "#FDF8F3",
  surface: "#FFFFFF",
  cardBorder: "#E8DDD0",
  defaultBg: "#FFF7ED",
  defaultBorder: "#E67E22",
  accent: "#E67E22",
  accentDark: "#C0631A",
  text: "#1A1208",
  muted: "#7A6A55",
  error: "#C0392B",
  success: "#27AE60",
  inputBg: "#FAF5EF",
  inputBorder: "#D8CBBB",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: palette.bg,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    position: "relative",
    overflow: "hidden",
  },
  noise: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    padding: "20px 40px 16px",
    borderBottom: `1px solid ${palette.cardBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: palette.surface,
    position: "relative",
    zIndex: 10,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: { fontSize: 24 },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.accent,
    letterSpacing: "-0.5px",
  },
  breadcrumb: {
    fontSize: 13,
    color: palette.muted,
    letterSpacing: "0.02em",
  },
  main: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "36px 24px 60px",
    position: "relative",
    zIndex: 10,
  },
  titleRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: palette.text,
    margin: 0,
    letterSpacing: "-1px",
    lineHeight: 1.1,
  },
  pageSubtitle: {
    margin: "6px 0 0",
    color: palette.muted,
    fontSize: 15,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: palette.accent,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 22px",
    fontSize: 15,
    fontFamily: "'Helvetica Neue', sans-serif",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.01em",
  },
  addBtnActive: {
    background: "#888",
  },
  addBtnIcon: {
    fontSize: 18,
    lineHeight: 1,
  },
  toast: {
    background: palette.success,
    color: "#fff",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontFamily: "'Helvetica Neue', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 0,
    maxHeight: 0,
    overflow: "hidden",
    opacity: 0,
    transition: "all 0.3s ease",
  },
  toastVisible: {
    maxHeight: 60,
    opacity: 1,
    marginBottom: 20,
  },
  toastIcon: { fontWeight: "700", fontSize: 16 },

  // Form
  formCard: {
    background: palette.surface,
    border: `1.5px solid ${palette.cardBorder}`,
    borderRadius: 16,
    padding: "28px 32px",
    marginBottom: 32,
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
    margin: "0 0 20px",
    letterSpacing: "-0.3px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px 20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldWide: {
    gridColumn: "1 / -1",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.muted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  input: {
    background: palette.inputBg,
    border: `1.5px solid ${palette.inputBorder}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 15,
    color: palette.text,
    fontFamily: "'Helvetica Neue', sans-serif",
    outline: "none",
    transition: "border 0.2s",
  },
  inputError: {
    borderColor: palette.error,
  },
  errorMsg: {
    fontSize: 12,
    color: palette.error,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  saveBtn: {
    marginTop: 22,
    background: palette.text,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "13px 28px",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "'Helvetica Neue', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "background 0.2s",
  },

  // Cards
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 20,
  },
  card: {
    background: palette.surface,
    border: `1.5px solid ${palette.cardBorder}`,
    borderRadius: 16,
    padding: "22px 24px 18px",
    position: "relative",
    transition: "opacity 0.35s, transform 0.35s",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  },
  cardDefault: {
    background: palette.defaultBg,
    borderColor: palette.defaultBorder,
    boxShadow: `0 0 0 1px ${palette.defaultBorder}22, 0 4px 20px rgba(230,126,34,0.12)`,
  },
  cardDeleting: {
    opacity: 0,
    transform: "scale(0.97)",
  },
  defaultBadge: {
    position: "absolute",
    top: 14,
    right: 16,
    background: palette.accent,
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "'Helvetica Neue', sans-serif",
    letterSpacing: "0.05em",
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "uppercase",
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 10,
    letterSpacing: "-0.3px",
  },
  cardAddress: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    marginBottom: 18,
  },
  cardLine: {
    fontSize: 14,
    color: palette.muted,
    fontFamily: "'Helvetica Neue', sans-serif",
    lineHeight: 1.5,
  },
  cardPhone: {
    fontSize: 14,
    color: palette.text,
    fontFamily: "'Helvetica Neue', sans-serif",
    marginTop: 4,
    fontWeight: "500",
  },
  cardActions: {
    display: "flex",
    gap: 10,
    borderTop: `1px solid ${palette.cardBorder}`,
    paddingTop: 14,
  },
  defaultBtn: {
    flex: 1,
    background: "transparent",
    border: `1.5px solid ${palette.accent}`,
    color: palette.accent,
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "'Helvetica Neue', sans-serif",
    cursor: "pointer",
    transition: "all 0.18s",
    letterSpacing: "0.01em",
  },
  deleteBtn: {
    background: "transparent",
    border: `1.5px solid #DDD`,
    color: "#999",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontFamily: "'Helvetica Neue', sans-serif",
    cursor: "pointer",
    transition: "all 0.18s",
    whiteSpace: "nowrap",
  },

  // Empty
  empty: {
    textAlign: "center",
    padding: "64px 24px",
    color: palette.muted,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
    margin: "0 0 6px",
  },
  emptyHint: {
    fontSize: 15,
    margin: 0,
    fontFamily: "'Helvetica Neue', sans-serif",
  },
};
