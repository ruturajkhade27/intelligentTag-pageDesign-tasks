import React, { useState, useMemo } from "react";
import "./comPage.css";
import NumericPad from "./NumericPad.jsx";

const MOCK_SUBTOTAL = 59.5;
const COMP_ELIGIBLE_TOTAL = 59.5;

const initialState = {
  easyDine: { id: "easyDine", label: "EasyDine", balance: 24.0, applied: 0, selected: false },
  club: { id: "club", label: "Club Dollars", balance: 65.0, applied: 0, selected: false },
  eComps: [
    { id: "e1", amount: 50.0, exp: "02/20/24", applied: 0, selected: false },
    { id: "e2", amount: 10.0, exp: "02/20/24", applied: 0, selected: false },
    { id: "e3", amount: 5.0, exp: "02/20/24", applied: 0, selected: false },
    { id: "e4", amount: 20.0, exp: "02/20/24", applied: 0, selected: false }
  ]
};

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/* Confirm modal */
function ConfirmModal({ visible, onAdjust, onProceed, chargedToComps, remaining }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title"><span className="title">Please note:</span> eComps used will fully cover the eligible food total. Any excess value is not retained for future use.
          Proceed with this payment?</div>
      </div>
       <div className="modal-actions">
          <button className="modal-btn modal-btn-adjust" onClick={onAdjust}>
            Adjust
          </button>
          <button className="modal-btn modal-btn-proceed" onClick={onProceed}>
            Proceed
          </button>
        </div>
    </div>
  );
}

export default function AllocateCompsApp({ onProceedExternal } = {}) {
  const [easyDine, setEasyDine] = useState(initialState.easyDine);
  const [club, setClub] = useState(initialState.club);
  const [eComps, setEComps] = useState(initialState.eComps);

  const [npVisible, setNpVisible] = useState(false);
  const [npTarget, setNpTarget] = useState(null);
  const [npMax, setNpMax] = useState(Number.POSITIVE_INFINITY);
  const [npInitialValue, setNpInitialValue] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  const chargedToComps = useMemo(() => {
    const eSum = eComps.reduce((s, e) => s + Number(e.applied || 0), 0);
    return round2((easyDine.applied || 0) + (club.applied || 0) + eSum);
  }, [easyDine, club, eComps]);

  const remainingAfterComps = useMemo(() => {
    return round2(MOCK_SUBTOTAL - chargedToComps);
  }, [chargedToComps]);

  function openNumericPad(target) {
    setNpTarget(target);

    if (target.type === "easyDine") {
      setNpMax(easyDine.balance);
      setNpInitialValue(easyDine.applied?.toString() || "");
    } else if (target.type === "club") {
      setNpMax(club.balance);
      setNpInitialValue(club.applied?.toString() || "");
    } else if (target.type === "ecomp") {
      const item = eComps.find((e) => e.id === target.id);
      setNpMax(item ? item.amount : 0);
      setNpInitialValue(item?.applied?.toString() || "");
    } else {
      setNpMax(Number.POSITIVE_INFINITY);
      setNpInitialValue("");
    }

    setNpVisible(true);
  }

  function onNpApply(val) {
    if (!npTarget) return;

    if (npTarget.type === "easyDine") {
      setEasyDine({ ...easyDine, applied: val, selected: val > 0 });
    } else if (npTarget.type === "club") {
      setClub({ ...club, applied: val, selected: val > 0 });
    } else if (npTarget.type === "ecomp") {
      setEComps((prev) =>
        prev.map((it) =>
          it.id === npTarget.id ? { ...it, applied: val, selected: val > 0 } : it
        )
      );
    }
  }

  function toggleEcomp(id) {
    setEComps((prev) => {
      const item = prev.find((p) => p.id === id);
      if (!item) return prev;

      return prev.map((p) =>
        p.id === id ? { ...p, selected: !p.selected, applied: !p.selected ? p.amount : 0 } : p
      );
    });
  }

  function onReset() {
    setEasyDine({ ...initialState.easyDine });
    setClub({ ...initialState.club });
    setEComps(initialState.eComps.map((e) => ({ ...e })));
  }

  // Smart allocate 
  function smartAllocate() {
    const easyDineTarget = 9.5;
    const ecompTargetId = "e1";
    const ecompTargetAmount = 50.0;
    const edApplied = round2(Math.min(easyDineTarget, easyDine.balance));
    setEasyDine((prev) => ({ ...prev, applied: edApplied, selected: edApplied > 0 }));
    setEComps((prev) =>
      prev.map((it) =>
        it.id === ecompTargetId
          ? { ...it, applied: round2(Math.min(ecompTargetAmount, it.amount)), selected: true }
          : { ...it, applied: 0, selected: false }
      )
    );
  }

  /* CONTINUE */
  function handleContinueClick() {
    setShowConfirm(true);
  }
  function handleAdjust() {
    setShowConfirm(false);
  }
  function handleProceed() {
    setShowConfirm(false);

    if (typeof onProceedExternal === "function") {
      onProceedExternal({ chargedToComps, remainingAfterComps });
      return;
    }
    window.location.href = "/next-page";
  }

  return (
    <div className="app-root">
      <nav className="nav">
        <div className="nav-text">PatT - Comps - Allocate - v2.02 - eComps - Smart Allocate</div>
        <div className="back-btn" title="Back" onClick={() => window.history.back()}>
          <i className="fa-solid fa-angle-left"></i>
        </div>
      </nav>

      <div className="main">
        <h2 className="title">Allocate Your Comps</h2>

        <div className="total-box">
          <div className="label">Comp-Eligible Total:</div>
          <div className="value">${COMP_ELIGIBLE_TOTAL.toFixed(2)}</div>
        </div>

        <div className="apply">
          <div className="section-title">Apply Your Comps:</div>

          {/* EasyDine */}
          <div className="card easyDine">
            <div className="left">
              <div className="heading">{easyDine.label}</div>
              <div className="sub">Available Balance: ${easyDine.balance.toFixed(2)}</div>
            </div>

            <div className="right" onClick={() => openNumericPad({ type: "easyDine" })}>
              ${(easyDine.applied || 0).toFixed(2)}
            </div>

            {easyDine.selected && <div className="tag adjusted">Adjusted</div>}
          </div>

          {/* eComps */}
          <div className="ecomps-container">
            <div className="ecomps-scroll" role="list">
              {eComps.map((e) => (
                <div
                  key={e.id}
                  className={`card ecomp-item ${e.selected ? "selected" : ""}`}
                  onClick={() => toggleEcomp(e.id)}
                >
                  <div className="left">
                    <div className="heading">eComp</div>
                    <div className="sub">{e.exp ? `Expiration: ${e.exp}` : "No Expiration"}</div>
                  </div>

                  <div
                    className="right2"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      openNumericPad({ type: "ecomp", id: e.id });
                    }}
                  >
                    ${(e.applied || e.amount || 0).toFixed(2)}
                  </div>

                  <div className="e-text">
                    {e.selected ? "Applied" : "Tap to apply"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Club */}
          <div className="card club">
            <div className="left">
              <div className="heading">{club.label}</div>
              <div className="sub">Available Balance: ${club.balance.toFixed(2)}</div>
            </div>

            <div className="right" onClick={() => openNumericPad({ type: "club" })}>
              ${(club.applied || 0).toFixed(2)}
            </div>

            {club.selected && <div className="tag applied">Applied</div>}
          </div>

          <div className="buttons">
            <button className="smart" onClick={smartAllocate}>
              <i className="fa-solid fa-lightbulb"></i> Smart Allocate
            </button>
            <button className="reset" onClick={onReset}>
              <i className="fa-solid fa-rotate-right"></i> Reset
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="summary">
          <div className="sum-row">
            <div className="box">
              <div className="label-1">Charged to Comps:</div>
              <div className="value-1">${chargedToComps.toFixed(2)}</div>
            </div>
            <div className="box">
              <div className="label">Remaining After Comps:</div>
              <div className="value">${remainingAfterComps.toFixed(2)}</div>
            </div>
          </div>
          <button className="continue" onClick={handleContinueClick}>CONTINUE</button>
        </div>
      </div>

      <div className="footer">
        <div className="left-icon">
          <div className="calculator" title="calculator"><i className="fa-solid fa-calculator"></i></div>
          <div><a className="reset-link" href="#" onClick={(e) => { e.preventDefault(); onReset(); }}>[Reset]</a></div>
        </div>
        <div className="right">
          <div className="info">(Full Comps applied)</div>
          <div className="text" title="Text"><i className="fa-regular fa-file-lines"></i></div>
        </div>
      </div>

      <NumericPad
        visible={npVisible}
        initialValue={npInitialValue}
        max={npMax}
        title={npTarget ? `Enter amount for ${npTarget.type}` : "Enter amount"}
        onClose={() => setNpVisible(false)}
        onApply={onNpApply}
      />

      <ConfirmModal
        visible={showConfirm}
        onAdjust={handleAdjust}
        onProceed={handleProceed}
        chargedToComps={chargedToComps}
        remaining={remainingAfterComps}
      />
    </div>
  );
}
