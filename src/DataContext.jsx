import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_USERS,
  INITIAL_INSTRUMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_CERTIFICATES,
  INITIAL_ACTIVITIES,
  DEMO_ACCOUNTS,
} from "./seedData";

const STORAGE_KEY = "emaap_prototype_store_v1";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Load initial data from localStorage if available
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load local state:", e);
    }
    return {
      users: INITIAL_USERS,
      instruments: INITIAL_INSTRUMENTS,
      applications: INITIAL_APPLICATIONS,
      certificates: INITIAL_CERTIFICATES,
      activities: INITIAL_ACTIVITIES,
    };
  });

  // Current active user for prototype demonstration
  const [currentUser, setCurrentUser] = useState(() => {
    // Default to trader Rajesh Kumar
    return INITIAL_USERS.find((u) => u.role === "user") || INITIAL_USERS[0];
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }, [data]);

  // Helper to add activity log
  const logActivity = (role, text) => {
    const newAct = {
      id: "act-" + Date.now(),
      time: "Just now",
      role,
      text,
    };
    setData((prev) => ({
      ...prev,
      activities: [newAct, ...prev.activities.slice(0, 19)],
    }));
  };

  // 1. ADD INSTRUMENT (User Action)
  const addInstrument = (payload) => {
    const newId = "inst-" + (100 + data.instruments.length + 1);
    const newInstrument = {
      id: newId,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerOrg: currentUser.organization,
      type: payload.type || "Electronic Weighing Machine",
      model: payload.model || `MDL-${Math.floor(100 + Math.random() * 900)}`,
      serialNumber: payload.serialNumber || `SER-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturer: payload.manufacturer || "Avery India Ltd",
      capacity: payload.capacity || "100 kg",
      accuracy: payload.accuracy || "Class III",
      location: payload.location || currentUser.address || "Main Shop",
      state: payload.state || currentUser.state || "Rajasthan",
      district: payload.district || currentUser.district || "Jaipur",
      status: "unverified",
      lastVerificationDate: null,
      validityEndDate: null,
    };

    setData((prev) => ({
      ...prev,
      instruments: [newInstrument, ...prev.instruments],
    }));

    logActivity("user", `Added new instrument: ${newInstrument.type} (${newInstrument.serialNumber})`);
    return newInstrument;
  };

  // 2. APPLY FOR VERIFICATION (User Action)
  const applyVerification = ({ instrumentId, type, verificationLocation }) => {
    const inst = data.instruments.find((i) => i.id === instrumentId);
    if (!inst) throw new Error("Instrument not found");

    const appNumber = `APP-2025-0${100 + data.applications.length + 1}`;
    const newApp = {
      id: appNumber,
      instrumentId: inst.id,
      instrumentName: `${inst.type} (${inst.capacity})`,
      ownerId: inst.ownerId,
      ownerName: inst.ownerName,
      ownerOrg: inst.ownerOrg,
      district: inst.district,
      state: inst.state,
      type: type || "initial",
      verificationLocation: verificationLocation || "on-site",
      status: "submitted", // Initial state
      result: null,
      assignedLmoId: null,
      assignedLmoName: null,
      appliedDate: new Date().toISOString().split("T")[0],
      scheduledDate: null,
      scheduledTime: null,
      verificationDate: null,
      certificateNumber: null,
      observations: null,
    };

    setData((prev) => ({
      ...prev,
      applications: [newApp, ...prev.applications],
    }));

    logActivity("user", `Submitted verification application ${appNumber} for ${inst.serialNumber}`);
    return newApp;
  };

  // 3. ASSIGN LMO TO APPLICATION (Admin Action)
  const assignLmo = (applicationId, lmoId) => {
    const lmo = data.users.find((u) => u.id === lmoId);
    if (!lmo) throw new Error("LMO not found");

    setData((prev) => ({
      ...prev,
      applications: prev.applications.map((app) => {
        if (app.id === applicationId) {
          return {
            ...app,
            assignedLmoId: lmo.id,
            assignedLmoName: lmo.name,
            status: "assigned",
          };
        }
        return app;
      }),
    }));

    logActivity("admin", `Assigned application ${applicationId} to Inspector ${lmo.name}`);
  };

  // 4. SCHEDULE INSPECTION (LMO Action)
  const scheduleInspection = (applicationId, scheduledDate, scheduledTime) => {
    setData((prev) => ({
      ...prev,
      applications: prev.applications.map((app) => {
        if (app.id === applicationId) {
          return {
            ...app,
            scheduledDate,
            scheduledTime,
            status: "scheduled",
          };
        }
        return app;
      }),
    }));

    logActivity("lmo", `Scheduled inspection for ${applicationId} on ${scheduledDate} at ${scheduledTime}`);
  };

  // 5. COMPLETE VERIFICATION / INSPECTION (LMO Action)
  const completeVerification = (applicationId, verificationOutcome) => {
    const { result, readings, errorFound, toleranceWithin, remarks, sealNumber } = verificationOutcome;
    const isPass = result === "pass";
    const today = new Date().toISOString().split("T")[0];
    const expiryYear = new Date();
    expiryYear.setFullYear(expiryYear.getFullYear() + 1);
    const expiryDate = expiryYear.toISOString().split("T")[0];

    let newCertNumber = null;
    let targetApp = data.applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    if (isPass) {
      newCertNumber = `LM-2025-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }

    // Update application
    setData((prev) => {
      const updatedApplications = prev.applications.map((app) => {
        if (app.id === applicationId) {
          return {
            ...app,
            status: "completed",
            result: isPass ? "pass" : "fail",
            verificationDate: today,
            certificateNumber: newCertNumber,
            observations: {
              readings: readings || "Standard test weight verification performed",
              errorFound: errorFound || "0.00",
              toleranceWithin: !!toleranceWithin,
              remarks: remarks || (isPass ? "Within permissible limits" : "Tolerance error exceeded"),
              sealNumber: sealNumber || `SEAL-${Math.floor(1000 + Math.random() * 9000)}`,
            },
          };
        }
        return app;
      });

      // Update instrument status
      const updatedInstruments = prev.instruments.map((inst) => {
        if (inst.id === targetApp.instrumentId) {
          return {
            ...inst,
            status: isPass ? "verified" : "rejected",
            lastVerificationDate: isPass ? today : inst.lastVerificationDate,
            validityEndDate: isPass ? expiryDate : inst.validityEndDate,
          };
        }
        return inst;
      });

      // Create certificate if pass
      let updatedCertificates = [...prev.certificates];
      if (isPass) {
        const linkedInst = prev.instruments.find((i) => i.id === targetApp.instrumentId) || {};
        const newCertificate = {
          certificateNumber: newCertNumber,
          applicationId: targetApp.id,
          instrumentId: targetApp.instrumentId,
          instrumentName: targetApp.instrumentName,
          serialNumber: linkedInst.serialNumber || "SER-N/A",
          model: linkedInst.model || "MDL-N/A",
          ownerId: targetApp.ownerId,
          ownerName: targetApp.ownerName,
          ownerOrg: targetApp.ownerOrg,
          address: linkedInst.location || "On-site",
          lmoName: currentUser.name || "Inspecting Officer",
          lmoDesignation: currentUser.designation || "Legal Metrology Officer",
          verificationDate: today,
          validityFrom: today,
          validityTo: expiryDate,
          result: "Pass",
          status: "valid",
          sealNumber: sealNumber || `SEAL-${Math.floor(1000 + Math.random() * 9000)}`,
          qrData: `VERIFIED|${newCertNumber}|${linkedInst.serialNumber}|VALID_TILL_${expiryDate}`,
        };
        updatedCertificates = [newCertificate, ...updatedCertificates];
      }

      return {
        ...prev,
        applications: updatedApplications,
        instruments: updatedInstruments,
        certificates: updatedCertificates,
      };
    });

    logActivity(
      "lmo",
      `Inspection for ${applicationId} completed with result: ${isPass ? "PASSED (Certificate Issued)" : "FAILED (Rejected)"}`
    );
  };

  // Reset to original seed data
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData({
      users: INITIAL_USERS,
      instruments: INITIAL_INSTRUMENTS,
      applications: INITIAL_APPLICATIONS,
      certificates: INITIAL_CERTIFICATES,
      activities: INITIAL_ACTIVITIES,
    });
    setCurrentUser(INITIAL_USERS.find((u) => u.role === "user"));
  };

  // Switch active user based on role for seamless demo
  const switchUserByRole = (role) => {
    const target = data.users.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  return (
    <DataContext.Provider
      value={{
        users: data.users,
        instruments: data.instruments,
        applications: data.applications,
        certificates: data.certificates,
        activities: data.activities,
        currentUser,
        setCurrentUser,
        addInstrument,
        applyVerification,
        assignLmo,
        scheduleInspection,
        completeVerification,
        resetToDefaults,
        switchUserByRole,
        demoAccounts: DEMO_ACCOUNTS,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
