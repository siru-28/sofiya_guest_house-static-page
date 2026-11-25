/**
 * ===================================================
 * ሶፊያ እንግዳ ማረፊያ (Sofiya Guest House - Tora)
 * Interactive Script: Date calculations & Booking handling
 * ===================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const RATE_PER_NIGHT = 500; // 500 ETB per night in Tora

  // Form Elements
  const checkInInput = document.getElementById('checkInDate');
  const checkOutInput = document.getElementById('checkOutDate');
  const displayNights = document.getElementById('displayNights');
  const displayTotal = document.getElementById('displayTotal');
  const bookingForm = document.getElementById('bookingForm');
  const guestsCountSelect = document.getElementById('guestsCount');
  const guestNameInput = document.getElementById('guestName');
  const guestPhoneInput = document.getElementById('guestPhone');
  const guestNotesInput = document.getElementById('guestNotes');

  if (!checkInInput || !checkOutInput) return;

  // 1. Initialize default dates (Today and Tomorrow)
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Set minimum date to today
  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  checkInInput.min = todayStr;
  checkInInput.value = todayStr;

  checkOutInput.min = tomorrowStr;
  checkOutInput.value = tomorrowStr;

  // 2. Price and Duration Calculation Logic
  function calculateTotal() {
    const checkInVal = checkInInput.value;
    const checkOutVal = checkOutInput.value;

    if (!checkInVal || !checkOutVal) {
      displayNights.textContent = '0 Nights';
      displayTotal.textContent = '0 ETB';
      return 0;
    }

    const checkInDate = new Date(checkInVal);
    const checkOutDate = new Date(checkOutVal);

    // Calculate difference in milliseconds, then days
    const diffTime = checkOutDate - checkInDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      checkOutInput.setCustomValidity('Check-out date must be after check-in date.');
      displayNights.textContent = 'Invalid Dates';
      displayTotal.textContent = '-- ETB';
      return 0;
    } else {
      checkOutInput.setCustomValidity('');
      const totalAmount = diffDays * RATE_PER_NIGHT;
      displayNights.textContent = `${diffDays} ${diffDays === 1 ? 'Night' : 'Nights'}`;
      displayTotal.textContent = `${totalAmount.toLocaleString()} ETB`;
      return { nights: diffDays, total: totalAmount };
    }
  }

  // Calculate on initial load
  calculateTotal();

  // Event Listeners for Date changes
  checkInInput.addEventListener('change', () => {
    // When check-in changes, adjust check-out minimum to check-in + 1 day
    if (checkInInput.value) {
      const nextDay = new Date(checkInInput.value);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOutInput.min = formatDate(nextDay);

      // If current check-out is before or equal to check-in, auto-bump check-out
      if (new Date(checkOutInput.value) <= new Date(checkInInput.value)) {
        checkOutInput.value = formatDate(nextDay);
      }
    }
    calculateTotal();
  });

  checkOutInput.addEventListener('change', () => {
    calculateTotal();
  });

  // 3. Form Submission Handling
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate form inputs using HTML5 validation
    if (!bookingForm.checkValidity()) {
      e.stopPropagation();
      bookingForm.classList.add('was-validated');
      return;
    }

    const calcResult = calculateTotal();
    if (!calcResult || calcResult.nights <= 0) {
      alert('Please choose valid check-in and check-out dates!');
      return;
    }

    // Generate random booking voucher reference
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `SG-TORA-${randomNum}`;

    // Prepare booking payload
    const bookingData = {
      refNumber: bookingRef,
      guestName: guestNameInput.value.trim(),
      guestPhone: guestPhoneInput.value.trim(),
      checkIn: checkInInput.value,
      checkOut: checkOutInput.value,
      nights: calcResult.nights,
      guestsCount: guestsCountSelect.value,
      ratePerNight: RATE_PER_NIGHT,
      totalAmount: calcResult.total,
      notes: guestNotesInput.value.trim() || 'No special requests',
      roomType: 'Standard Room',
      hasFood: false, // Explicitly no breakfast
      bookingDate: new Date().toLocaleDateString('en-GB')
    };

    // Save to sessionStorage so confirmation page can display it
    sessionStorage.setItem('sofiya_booking', JSON.stringify(bookingData));

    // Redirect to confirmation / voucher page
    window.location.href = 'confirmation.html';
  });
});
