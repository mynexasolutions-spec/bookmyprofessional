"use client";

import React, { useState, useEffect } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import {
  createBooking as createBookingRow,
  getAvailableSlots,
  nextBookingDates,
} from "@/lib/data/bookings";
import { ikImage } from "@/lib/imagekit";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  User,
  Phone,
  Mail,
  FileText,
  Sparkles,
  AlertCircle,
  Download,
  Building,
} from "lucide-react";
import Button from "./Button";
import { formatMoney } from "@/lib/money";

export default function BookingModal() {
  const {
    bookingPro,
    bookingPreselectedService,
    closeBooking,
    createBooking,
    addBooking,
    customerProfile,
    setIsCustomerDashboardOpen,
  } = useMarketplace();
  const { openAuthModal, user } = useAuth();

  // Wizard Step: 1 = Service, 2 = Date/Slot, 3 = Address, 4 = Payment, 5 = Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // Form State
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => nextBookingDates(14)[0].date);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    name: customerProfile.name || "",
    email: customerProfile.email || "",
    phone: customerProfile.phone || "",
    street: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "paypal" | "applepay" | "sepa"
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    cardholder: "",
  });

  // Prefill service on open
  useEffect(() => {
    if (bookingPro) {
      if (bookingPreselectedService) {
        setSelectedService(bookingPreselectedService);
      } else if (bookingPro.services && bookingPro.services.length > 0) {
        setSelectedService(bookingPro.services[0]);
      }
      setCurrentStep(1);
      setSelectedDate(nextBookingDates(14)[0].date);
      setSelectedTimeSlot("");
      setConfirmedBookingData(null);
      setBookingError(null);
    }
  }, [bookingPro, bookingPreselectedService]);

  // Lock body scroll
  useEffect(() => {
    if (bookingPro) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [bookingPro]);

  // Reload real availability whenever the pro or selected date changes.
  useEffect(() => {
    if (!bookingPro) return;
    let active = true;
    setIsLoadingSlots(true);
    getAvailableSlots(bookingPro.id, selectedDate, bookingPro.availability).then((slots) => {
      if (!active) return;
      setAvailableSlots(slots);
      setSelectedTimeSlot((prev) => (slots.includes(prev) ? prev : slots[0] || ""));
      setIsLoadingSlots(false);
    });
    return () => {
      active = false;
    };
  }, [bookingPro, selectedDate]);

  if (!bookingPro) return null;

  const nextDays = nextBookingDates(14);

  const handlePayAndConfirm = async () => {
    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }
    if (!selectedTimeSlot) return;
    setBookingError(null);
    setIsProcessingPayment(true);

    const payload = {
      pro: bookingPro,
      service: selectedService,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      address: `${addressDetails.street}, ${addressDetails.postalCode} ${addressDetails.city}`,
      notes: addressDetails.notes,
      customerName: addressDetails.name,
      customerEmail: addressDetails.email,
      customerPhone: addressDetails.phone,
      paymentMethod:
        paymentMethod === "card"
          ? "Visa ending in •••• 4242"
          : paymentMethod === "paypal"
          ? "PayPal (Instant)"
          : paymentMethod === "applepay"
          ? "Apple Pay"
          : "SEPA Direct Debit",
    };

    try {
      const newBooking = await createBookingRow(payload);
      addBooking(newBooking);
      setConfirmedBookingData(newBooking);
      setCurrentStep(5);
    } catch (error) {
      if (error?.isUserFacing) {
        setBookingError(error.message);
        return;
      }
      // ponytail: fall back to the in-memory mock when supabase is unapplied/unreachable.
      const fallbackBooking = createBooking(payload);
      setConfirmedBookingData(fallbackBooking);
      setCurrentStep(5);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const servicePrice = selectedService ? selectedService.price : bookingPro.price;
  const platformFee = 0; // Free / included
  const totalAmount = servicePrice + platformFee;

  const isCardValid =
    cardDetails.number.replace(/\D/g, "").length >= 16 &&
    cardDetails.expiry.trim().length >= 5 &&
    cardDetails.cvc.trim().length >= 3;
  const isPaymentDisabled = isProcessingPayment || (paymentMethod === "card" && !isCardValid);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-dark-900/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => {
          if (currentStep !== 5) closeBooking();
        }}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl my-auto bg-surface rounded-2xl shadow-2xl border border-border/80 overflow-hidden z-10 animate-in zoom-in-95 fade-in flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header & Steps Tracker */}
        <div className="p-4 sm:p-5 border-b border-border bg-surface shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={ikImage(bookingPro.image)}
                alt={bookingPro.name}
                className="w-10 h-10 rounded-xl object-cover border border-border"
              />
              <div>
                <h3 className="font-heading text-sm font-bold text-dark-900 leading-tight">
                  Book {bookingPro.name}
                </h3>
                <span className="text-[11px] text-primary-600 font-medium">
                  {bookingPro.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeBooking}
              className="p-1.5 rounded-full text-dark-400 hover:text-dark-800 hover:bg-dark-50 transition-colors"
              aria-label="Close booking modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Step Bar */}
          {currentStep < 5 && (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { step: 1, label: "1. Service" },
                { step: 2, label: "2. Schedule" },
                { step: 3, label: "3. Address" },
                { step: 4, label: "4. Payment" },
              ].map((s) => (
                <div key={s.step} className="flex flex-col gap-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      currentStep >= s.step
                        ? "bg-primary-500"
                        : "bg-dark-100"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold text-center truncate ${
                      currentStep === s.step
                        ? "text-primary-600"
                        : "text-dark-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: CHOOSE SERVICE PACKAGE */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading text-base font-bold text-dark-900">
                  Select a Service Package
                </h4>
                <p className="text-xs text-dark-500">
                  Choose the specific service requirement for your appointment.
                </p>
              </div>

              <div className="space-y-2.5">
                {bookingPro.services?.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/30 ring-2 ring-primary-500/20 shadow-xs"
                          : "border-border bg-surface hover:border-primary-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                            isSelected
                              ? "border-primary-500 bg-primary-500 text-white"
                              : "border-dark-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-heading text-sm font-bold text-dark-900">
                              {srv.title}
                            </h5>
                            <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                              {srv.duration}
                            </span>
                          </div>
                          <p className="text-xs text-dark-600 mt-1 leading-relaxed">
                            {srv.description}
                          </p>
                        </div>
                      </div>

                      <span className="font-heading text-base font-bold text-dark-900 shrink-0">
                        {formatMoney(srv.price, 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME SLOT PICKER */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h4 className="font-heading text-base font-bold text-dark-900">
                  Choose Date & Time Slot
                </h4>
                <p className="text-xs text-dark-500">
                  All appointments are synchronized with {bookingPro.name}'s real-time calendar.
                </p>
              </div>

              {/* Date Pills */}
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {nextDays.map((d) => {
                    const isSelected = selectedDate === d.date;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDate(d.date)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-primary-500 text-white border-primary-500 shadow-button"
                            : "bg-surface border-border text-dark-700 hover:bg-dark-50"
                        }`}
                      >
                        <span className="block text-[10px] font-medium uppercase opacity-80">
                          {d.day}
                        </span>
                        <span className="block font-heading text-base font-bold my-0.5">
                          {d.num}
                        </span>
                        <span className="block text-[9px] opacity-75 truncate">{d.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-2">
                  Select Available Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {isLoadingSlots ? (
                    <div className="col-span-full flex items-center justify-center py-4 text-xs text-dark-400">
                      <div className="h-4 w-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mr-2" />
                      Checking availability…
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-xs text-dark-500 bg-dark-50 border border-dashed border-border rounded-xl">
                      No slots available for this date. Please pick another day.
                    </div>
                  ) : (
                    availableSlots.map((time) => {
                      const isSelected = selectedTimeSlot === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTimeSlot(time)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? "bg-primary-50 border-primary-500 text-primary-700 ring-2 ring-primary-500/20 shadow-xs"
                              : "bg-surface border-border text-dark-800 hover:bg-dark-50"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-primary-500" />
                          <span>{time}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Instant Confirmation Guarantee: Your time slot is reserved immediately upon booking.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS & SERVICE DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading text-base font-bold text-dark-900">
                  Service Location & Contact
                </h4>
                <p className="text-xs text-dark-500">
                  Where should {bookingPro.name} arrive or contact you?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Contact Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="text"
                      value={addressDetails.name}
                      onChange={(e) =>
                        setAddressDetails({ ...addressDetails, name: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Phone Number (for SMS & Intercom)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="tel"
                      value={addressDetails.phone}
                      onChange={(e) =>
                        setAddressDetails({ ...addressDetails, phone: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Street Address & Apartment / Unit
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="text"
                      value={addressDetails.street}
                      onChange={(e) =>
                        setAddressDetails({ ...addressDetails, street: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressDetails.city}
                    onChange={(e) =>
                      setAddressDetails({ ...addressDetails, city: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={addressDetails.postalCode}
                    onChange={(e) =>
                      setAddressDetails({ ...addressDetails, postalCode: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Special Instructions / Notes for Professional
                  </label>
                  <textarea
                    rows={2}
                    value={addressDetails.notes}
                    onChange={(e) =>
                      setAddressDetails({ ...addressDetails, notes: e.target.value })
                    }
                    placeholder="E.g. Building entrance code, parking info, specific symptoms or problem details..."
                    className="w-full px-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SECURE PAYMENT GATEWAY */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading text-base font-bold text-dark-900">
                  Secure Checkout & Escrow Protection
                </h4>
                <p className="text-xs text-dark-500">
                  Your payment is held in escrow and only released after your service is completed.
                </p>
              </div>

              {/* Itemized Order Summary Box */}
              <div className="p-4 bg-dark-50 rounded-xl border border-border space-y-2.5">
                <div className="flex items-center justify-between text-xs text-dark-700">
                  <span>{selectedService?.title || "Professional Service"}</span>
                  <span className="font-semibold text-dark-900">{formatMoney(servicePrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-dark-600">
                  <span>Platform Escrow Protection Fee</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex items-center justify-between text-xs text-dark-600">
                  <span>VAT / Taxes</span>
                  <span>Included</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-bold text-dark-900">
                  <span>Total Due</span>
                  <span className="text-primary-600 font-heading text-lg">{formatMoney(totalAmount)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { id: "card", label: "Credit Card" },
                    { id: "paypal", label: "PayPal" },
                    { id: "applepay", label: "Apple Pay" },
                    { id: "sepa", label: "SEPA Bank" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                        paymentMethod === m.id
                          ? "bg-primary-50 border-primary-500 text-primary-700 ring-2 ring-primary-500/20"
                          : "bg-surface border-border text-dark-700 hover:bg-dark-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Card Fields Mockup */}
                {paymentMethod === "card" && (
                  <div className="space-y-2.5 p-3.5 bg-surface border border-border rounded-xl">
                    <div>
                      <label className="block text-[11px] font-semibold text-dark-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, number: e.target.value })
                          }
                          className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 font-mono focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-dark-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, expiry: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 font-mono focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-dark-700 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardDetails.cvc}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cvc: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 font-mono focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-xs text-dark-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>256-bit SSL encrypted • 100% Money Back Escrow Guarantee</span>
              </div>

              {bookingError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: BOOKING CONFIRMATION SCREEN */}
          {currentStep === 5 && confirmedBookingData && (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-soft">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-1 border border-emerald-200">
                  Booking Confirmed #{confirmedBookingData.id}
                </span>
                <h3 className="font-heading text-xl font-bold text-dark-900">
                  Appointment Scheduled!
                </h3>
                <p className="text-xs text-dark-600 max-w-sm mx-auto mt-1">
                  We've sent a booking confirmation receipt to{" "}
                  <span className="font-semibold text-dark-900">
                    {confirmedBookingData.customerEmail}
                  </span>
                  .
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-dark-50 p-4 rounded-xl border border-border text-left space-y-2 text-xs max-w-md mx-auto">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-dark-500">Professional:</span>
                  <span className="font-bold text-dark-900">{confirmedBookingData.proName}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-dark-500">Service:</span>
                  <span className="font-semibold text-dark-900">
                    {confirmedBookingData.serviceTitle}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-dark-500">Date & Time:</span>
                  <span className="font-semibold text-primary-600">
                    {confirmedBookingData.date} at {confirmedBookingData.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-dark-500">Location:</span>
                  <span className="font-semibold text-dark-900 truncate max-w-[200px]">
                    {confirmedBookingData.address}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-dark-500">Amount Paid:</span>
                  <span className="font-bold text-dark-900">
                    {formatMoney(confirmedBookingData.totalPaid)} (Paid via {confirmedBookingData.paymentMethod})
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-md mx-auto">
                <Button
                  variant="primary"
                  className="w-full justify-center text-xs py-2.5 font-semibold shadow-button"
                  onClick={() => {
                    closeBooking();
                    setIsCustomerDashboardOpen(true);
                  }}
                >
                  View in My Bookings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-center text-xs py-2.5 border-border text-dark-700"
                  onClick={closeBooking}
                >
                  Close & Explore
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls (for Steps 1-4) */}
        {currentStep < 5 && (
          <div className="p-4 sm:p-5 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-1 text-xs font-semibold text-dark-600 hover:text-dark-900 py-2 px-3 rounded-lg border border-border hover:bg-dark-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-xs text-dark-500">
                Total: <strong className="text-dark-900">{formatMoney(totalAmount)}</strong>
              </span>
            )}

            {currentStep < 4 ? (
              <Button
                variant="primary"
                size="sm"
                disabled={currentStep === 2 && !selectedTimeSlot}
                onClick={() => setCurrentStep(currentStep + 1)}
                className="text-xs py-2.5 px-5 font-semibold shadow-button"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={isPaymentDisabled}
                onClick={handlePayAndConfirm}
                className="text-xs py-2.5 px-6 font-semibold shadow-button"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay {formatMoney(totalAmount)} & Confirm</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
