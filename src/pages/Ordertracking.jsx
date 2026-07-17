import React, { useState, useEffect } from "react";
import {
  Settings,
  Trash2,
  Zap,
  Eye,
  EyeOff,
  Plus,
  MessageCircle
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Ordertracking({ connectionState }) {
  const [inputNumber, setInputNumber] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(
    connectionState?.whatsapp ? "whatsapp" : "signal"
  );
  const [contacts, setContacts] = useState(new Map());
  const [error, setError] = useState(null);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [probeMethod, setProbeMethod] = useState("delete");
  const [showConnections, setShowConnections] = useState(false);

  useEffect(() => {
    const onTrackerUpdate = (update) => {
      const { jid, ...data } = update;
      if (!jid) return;

      setContacts((prev) => {
        const next = new Map(prev);
        const contact = next.get(jid);
        if (!contact) return prev;

        const updated = { ...contact };

        if (data.presence !== undefined) updated.presence = data.presence;
        if (data.deviceCount !== undefined) updated.deviceCount = data.deviceCount;
        if (data.devices !== undefined) updated.devices = data.devices;

        if (data.median && data.devices?.length) {
          updated.data = [
            ...(updated.data || []),
            {
              rtt: data.devices[0].rtt,
              avg: data.devices[0].avg,
              median: data.median,
              threshold: data.threshold,
              state:
                data.devices.find((d) =>
                  d.state?.includes("Online")
                )?.state || data.devices[0].state,
              timestamp: Date.now()
            }
          ];
        }

        next.set(jid, updated);
        return next;
      });
    };

    const onError = (data) => {
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on("tracker-update", onTrackerUpdate);
    socket.on("error", onError);
    socket.emit("get-tracked-contacts");

    return () => {
      socket.off("tracker-update", onTrackerUpdate);
      socket.off("error", onError);
    };
  }, []);

  const handleAdd = () => {
    if (!inputNumber) return;
    socket.emit("add-contact", {
      number: inputNumber,
      platform: selectedPlatform
    });
    setInputNumber("");
  };

  const handleRemove = (jid) => {
    socket.emit("remove-contact", jid);
  };

  const handleProbeMethodChange = (method) => {
    socket.emit("set-probe-method", method);
    setProbeMethod(method);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Track Contacts</h2>

          <button
            onClick={() => setShowConnections(!showConnections)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-lg"
          >
            <Settings size={14} />
            Manage
          </button>
        </div>

        <div className="flex gap-4">
          <input
            value={inputNumber}
            onChange={(e) => setInputNumber(e.target.value)}
            placeholder="Enter phone number"
            className="flex-1 border px-4 py-2 rounded-lg"
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {contacts.size === 0 && (
        <div className="text-center text-gray-500">
          No contacts being tracked
        </div>
      )}
    </div>
  );
}
