/**
 * TaxiTenerife – Application Logic
 * Handles fare estimation, form validation, and booking flow.
 */

/* ============================================================
   DATA
   ============================================================ */

/**
 * Destinations with estimated fares (€) from each airport.
 * Prices are approximate reference values.
 */
const DESTINATIONS = [
  { value: "",                     label: "— Selecciona un destino —",        norte: null,  sur: null  },
  { value: "santa-cruz",           label: "Santa Cruz de Tenerife",           norte: 12,    sur: 55    },
  { value: "la-laguna",            label: "San Cristóbal de La Laguna",       norte: 8,     sur: 60    },
  { value: "puerto-cruz",          label: "Puerto de la Cruz",                norte: 22,    sur: 75    },
  { value: "los-realejos",         label: "Los Realejos",                     norte: 18,    sur: 72    },
  { value: "icod-vinos",           label: "Icod de los Vinos",                norte: 32,    sur: 68    },
  { value: "garachico",            label: "Garachico",                        norte: 38,    sur: 72    },
  { value: "buenavista",           label: "Buenavista del Norte",             norte: 48,    sur: 80    },
  { value: "masca",                label: "Masca",                            norte: 52,    sur: 78    },
  { value: "santiago-teide",       label: "Santiago del Teide",               norte: 44,    sur: 65    },
  { value: "los-gigantes",         label: "Los Gigantes",                     norte: 48,    sur: 60    },
  { value: "adeje",                label: "Adeje",                            norte: 55,    sur: 18    },
  { value: "costa-adeje",          label: "Costa Adeje",                      norte: 58,    sur: 15    },
  { value: "playa-americas",       label: "Playa de las Américas",            norte: 60,    sur: 12    },
  { value: "los-cristianos",       label: "Los Cristianos",                   norte: 62,    sur: 10    },
  { value: "el-medano",            label: "El Médano",                        norte: 52,    sur: 20    },
  { value: "candelaria",           label: "Candelaria",                       norte: 20,    sur: 35    },
  { value: "guimar",               label: "Güímar",                           norte: 28,    sur: 40    },
  { value: "la-orotava",           label: "La Orotava",                       norte: 16,    sur: 68    },
  { value: "vilaflor",             label: "Vilaflor",                         norte: 48,    sur: 42    },
];

/* Per-passenger surcharge (€) per extra passenger beyond the first */
const EXTRA_PASSENGER_FEE_EUR = 2;

/* Night surcharge (22:00 – 07:00) */
const NIGHT_SURCHARGE_PCT = 0.20;

/* ============================================================
   DOM HELPERS
   ============================================================ */

function $(id) { return document.getElementById(id); }

/* ============================================================
   INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  populateDestinations();
  bindAirportSelection();
  bindFormChanges();
  bindFormSubmit();
  bindNewBooking();
  setMinDate();
});

/* ============================================================
   POPULATE DESTINATION SELECT
   ============================================================ */

function populateDestinations() {
  const select = $('destino');
  DESTINATIONS.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.value;
    opt.textContent = d.label;
    select.appendChild(opt);
  });
}

/* ============================================================
   SET MIN DATE (today)
   ============================================================ */

function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  $('fecha').setAttribute('min', today);
}

/* ============================================================
   AIRPORT SELECTION
   ============================================================ */

function bindAirportSelection() {
  document.querySelectorAll('.airport-option').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.airport-option').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;
      updateFare();
    });
  });
}

/* ============================================================
   FARE CALCULATION
   ============================================================ */

function getSelectedAirport() {
  const radio = document.querySelector('input[name="aeropuerto"]:checked');
  return radio ? radio.value : null;
}

function getSelectedDestination() {
  const val = $('destino').value;
  return DESTINATIONS.find(d => d.value === val) || null;
}

function getNightSurcharge(timeStr) {
  if (!timeStr) return false;
  const [h] = timeStr.split(':').map(Number);
  return h >= 22 || h < 7;
}

function updateFare() {
  const airport  = getSelectedAirport();
  const dest     = getSelectedDestination();
  const passengers = parseInt($('pasajeros').value, 10) || 1;
  const timeStr  = $('hora').value;

  /* Reset */
  $('fare-origin').textContent   = airport === 'norte' ? 'Aeropuerto Norte (TFN)' : airport === 'sur' ? 'Aeropuerto Sur (TFS)' : '—';
  $('fare-dest').textContent     = dest && dest.value ? dest.label : '—';
  $('fare-pax').textContent      = passengers;
  $('fare-base').textContent     = '—';
  $('fare-night').textContent    = '—';
  $('fare-pax-fee').textContent  = '—';
  $('fare-total').textContent    = '—';

  if (!airport || !dest || !dest.value) return;

  const base = airport === 'norte' ? dest.norte : dest.sur;
  if (base === null) return;

  const night = getNightSurcharge(timeStr);
  const nightAmt = night ? Math.round(base * NIGHT_SURCHARGE_PCT) : 0;
  const paxFee = Math.max(0, passengers - 1) * EXTRA_PASSENGER_FEE_EUR;
  const total = base + nightAmt + paxFee;

  $('fare-base').textContent    = `${base} €`;
  $('fare-night').textContent   = night ? `+${nightAmt} €` : 'No aplica';
  $('fare-pax-fee').textContent = paxFee > 0 ? `+${paxFee} €` : 'Incluido';
  $('fare-total').textContent   = `${total} €`;
}

/* ============================================================
   BIND FORM CHANGES (live fare updates)
   ============================================================ */

function bindFormChanges() {
  ['destino', 'pasajeros', 'hora'].forEach(id => {
    $(id).addEventListener('change', updateFare);
  });
}

/* ============================================================
   FORM SUBMIT – STEP FLOW
   ============================================================ */

function bindFormSubmit() {
  $('booking-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep1()) return;
    showStep2();
  });

  $('btn-confirm').addEventListener('click', () => {
    showStep3();
  });

  $('btn-back').addEventListener('click', () => {
    showStep1();
  });
}

/* ---- Validation ---- */

function validateStep1() {
  let valid = true;

  /* Airport */
  if (!getSelectedAirport()) {
    showFieldError('aeropuerto-error', 'Por favor, selecciona un aeropuerto de origen.');
    valid = false;
  } else {
    hideFieldError('aeropuerto-error');
  }

  /* Destination */
  if (!$('destino').value) {
    $('destino').classList.add('is-invalid');
    valid = false;
  } else {
    $('destino').classList.remove('is-invalid');
  }

  /* Date */
  if (!$('fecha').value) {
    $('fecha').classList.add('is-invalid');
    valid = false;
  } else {
    $('fecha').classList.remove('is-invalid');
  }

  /* Time */
  if (!$('hora').value) {
    $('hora').classList.add('is-invalid');
    valid = false;
  } else {
    $('hora').classList.remove('is-invalid');
  }

  /* Name */
  if (!$('nombre').value.trim()) {
    $('nombre').classList.add('is-invalid');
    valid = false;
  } else {
    $('nombre').classList.remove('is-invalid');
  }

  /* Phone */
  const phone = $('telefono').value.trim();
  if (!phone || !/^\+?[\d\s\-]{7,15}$/.test(phone)) {
    $('telefono').classList.add('is-invalid');
    valid = false;
  } else {
    $('telefono').classList.remove('is-invalid');
  }

  /* Email */
  const email = $('email').value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    $('email').classList.add('is-invalid');
    valid = false;
  } else {
    $('email').classList.remove('is-invalid');
  }

  return valid;
}

function showFieldError(id, msg) {
  const el = $(id);
  if (el) { el.textContent = msg; el.classList.remove('d-none'); }
}

function hideFieldError(id) {
  const el = $(id);
  if (el) el.classList.add('d-none');
}

/* ---- Step display ---- */

function showStep1() {
  $('step1-content').classList.remove('d-none');
  $('step2-content').classList.add('d-none');
  $('step3-content').classList.add('d-none');
  setStepState(1);
}

function showStep2() {
  buildSummary();
  $('step1-content').classList.add('d-none');
  $('step2-content').classList.remove('d-none');
  $('step3-content').classList.add('d-none');
  setStepState(2);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStep3() {
  $('step2-content').classList.add('d-none');
  $('step3-content').classList.remove('d-none');
  setStepState(3);
  generateBookingCode();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setStepState(active) {
  [1, 2, 3].forEach(n => {
    const circle = $(`step-circle-${n}`);
    const label  = $(`step-label-${n}`);
    circle.parentElement.classList.remove('active', 'done');
    if (n < active) circle.parentElement.classList.add('done');
    if (n === active) circle.parentElement.classList.add('active');
  });
  /* connectors */
  $('connector-1-2').classList.toggle('done', active > 1);
  $('connector-2-3').classList.toggle('done', active > 2);
  /* update circle icons for done steps */
  [1, 2, 3].forEach(n => {
    const circle = $(`step-circle-${n}`);
    if (n < active) {
      circle.textContent = '✓';
    } else {
      circle.textContent = n;
    }
  });
}

/* ============================================================
   SUMMARY (Step 2)
   ============================================================ */

function buildSummary() {
  const airport  = getSelectedAirport();
  const dest     = getSelectedDestination();
  const fecha    = $('fecha').value;
  const hora     = $('hora').value;
  const pax      = $('pasajeros').value;
  const nombre   = $('nombre').value.trim();
  const telefono = $('telefono').value.trim();
  const email    = $('email').value.trim();
  const notas    = $('notas').value.trim();

  const airportLabel = airport === 'norte'
    ? '✈️ Aeropuerto Norte – Los Rodeos (TFN)'
    : '✈️ Aeropuerto Sur – Reina Sofía (TFS)';

  const dateStr = fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : '—';

  $('summary-airport').textContent  = airportLabel;
  $('summary-dest').textContent     = dest ? dest.label : '—';
  $('summary-date').textContent     = dateStr;
  $('summary-time').textContent     = hora || '—';
  $('summary-pax').textContent      = pax;
  $('summary-name').textContent     = nombre;
  $('summary-phone').textContent    = telefono;
  $('summary-email').textContent    = email;
  $('summary-notes').textContent    = notas || 'Sin notas';
  $('summary-total').textContent    = $('fare-total').textContent;
}

/* ============================================================
   BOOKING CODE (Step 3)
   ============================================================ */

function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TXN-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += '-';
  }
  $('booking-code').textContent = code;
}

/* ============================================================
   NEW BOOKING
   ============================================================ */

function bindNewBooking() {
  $('btn-new-booking').addEventListener('click', () => {
    $('booking-form').reset();
    document.querySelectorAll('.airport-option').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    updateFare();
    showStep1();
  });
}
