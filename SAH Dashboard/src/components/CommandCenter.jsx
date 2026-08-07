 import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Volume2, VolumeX, Bell, Activity, MapPin, Gauge, BatteryCharging,
  Radio, Navigation as NavigationIcon, Home, Pause, Play,
  Video, Siren, Plus, X, Package, Rocket, TriangleAlert, Search,
  Wind, Thermometer, Flame, Box, Shield, ShieldCheck, Plane, Droplets,
} from 'lucide-react';
import { apiFetchOrders, apiCreateMission, apiUpdateOrderStatus, apiCreateOrder, apiFetchDrones } from '../data/api';
import '../styles/commandCenter.css';

// ===================================================================
// DRONE DATA & CONFIG
// ===================================================================
const DOCK_COORD = [10.75430, 106.66520];
const WAYPOINTS = {
  choray:  { name: "BV Chợ Rẫy",    coord: [10.75700, 106.66000] },
  tudu:    { name: "BV Từ Dũ",      coord: [10.76800, 106.67800] },
  nhidong: { name: "BV Nhi Đồng 1", coord: [10.76500, 106.66100] }
};

// Map backend status to display status
const STATUS_MAP = {
  pending: 'CHỜ XỬ LÝ',
  packaging: 'ĐÓNG GÓI',
  departed: 'ĐANG BAY',
  inflight: 'ĐANG BAY',
  delivered: 'ĐÃ GIAO',
  cancelled: 'ĐÃ HUỶ',
};

// Leaflet loaded globally from CDN
const L = typeof window !== 'undefined' ? window.L : null;

function CommandCenter({ onBackToFleet, drones = [] }) {
  // ===================================================================
  // STATE
  // ===================================================================
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentState, setCurrentState] = useState("STANDBY");
  const [sqlDatabase, setSqlDatabase] = useState([]);
  const [allLogsArray, setAllLogsArray] = useState([]);
  const [activeLogFilter, setActiveLogFilter] = useState('all');
  const [droneLat, setDroneLat] = useState(DOCK_COORD[0]);
  const [droneLng, setDroneLng] = useState(DOCK_COORD[1]);
  const [droneAlt, setDroneAlt] = useState(0);
  const [droneSpeed, setDroneSpeed] = useState(0);
  const [droneBattery, setDroneBattery] = useState(100);
  const [sparkHistory, setSparkHistory] = useState({ speed: [], alt: [], batt: [] }); // eslint-disable-line no-unused-vars
  const [flightPathCoords, setFlightPathCoords] = useState([]);
  const [targetNodeIndex, setTargetNodeIndex] = useState(0);
  const [currentTargetHospital, setCurrentTargetHospital] = useState("");
  const [pkgName, setPkgName] = useState("");
  const [pkgDest, setPkgDest] = useState("choray");
  const [showDiagnose, setShowDiagnose] = useState(false);
  const [iotDoor, setIotDoor] = useState("ĐÃ ĐÓNG");
  const [iotGear, setIotGear] = useState("ĐÃ KHÓA");
  const [iotCharge, setIotCharge] = useState("ĐANG TRÌ TRỆ");
  const [iotPower, setIotPower] = useState("0.0 kW");
  const [clock, setClock] = useState("");

  // Dispatch panel state
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [selectedDroneId, setSelectedDroneId] = useState("");
  const [flightMinutes, setFlightMinutes] = useState(15);
  const [preparingId, setPreparingId] = useState(null);

  // Fleet quick-select (right rail)
  const [activeDroneId, setActiveDroneId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  // Refs
  const mapInstanceRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const dockerMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const audioCtxRef = useRef(null);
  const stateRef = useRef(currentState);
  const droneLatRef = useRef(droneLat);
  const droneLngRef = useRef(droneLng);
  const droneAltRef = useRef(droneAlt);
  const droneSpeedRef = useRef(droneSpeed);
  const droneBatteryRef = useRef(droneBattery);
  const targetNodeIndexRef = useRef(targetNodeIndex);
  const currentTargetHospitalRef = useRef(currentTargetHospital);
  const flightPathCoordsRef = useRef(flightPathCoords);
  const sqlDatabaseRef = useRef(sqlDatabase);
  const allLogsArrayRef = useRef(allLogsArray);
  const sparkHistoryRef = useRef(sparkHistory);
  const iotDoorRef = useRef(iotDoor);
  const iotGearRef = useRef(iotGear);
  const iotChargeRef = useRef(iotCharge);
  const iotPowerRef = useRef(iotPower);
  const showDiagnoseRef = useRef(showDiagnose);

  // Sync refs
  useEffect(() => { stateRef.current = currentState; }, [currentState]);
  useEffect(() => { droneLatRef.current = droneLat; }, [droneLat]);
  useEffect(() => { droneLngRef.current = droneLng; }, [droneLng]);
  useEffect(() => { droneAltRef.current = droneAlt; }, [droneAlt]);
  useEffect(() => { droneSpeedRef.current = droneSpeed; }, [droneSpeed]);
  useEffect(() => { droneBatteryRef.current = droneBattery; }, [droneBattery]);
  useEffect(() => { targetNodeIndexRef.current = targetNodeIndex; }, [targetNodeIndex]);
  useEffect(() => { currentTargetHospitalRef.current = currentTargetHospital; }, [currentTargetHospital]);
  useEffect(() => { flightPathCoordsRef.current = flightPathCoords; }, [flightPathCoords]);
  useEffect(() => { sqlDatabaseRef.current = sqlDatabase; }, [sqlDatabase]);
  useEffect(() => { allLogsArrayRef.current = allLogsArray; }, [allLogsArray]);
  useEffect(() => { sparkHistoryRef.current = sparkHistory; }, [sparkHistory]);
  useEffect(() => { iotDoorRef.current = iotDoor; }, [iotDoor]);
  useEffect(() => { iotGearRef.current = iotGear; }, [iotGear]);
  useEffect(() => { iotChargeRef.current = iotCharge; }, [iotCharge]);
  useEffect(() => { iotPowerRef.current = iotPower; }, [iotPower]);
  useEffect(() => { showDiagnoseRef.current = showDiagnose; }, [showDiagnose]);

  // Sparkline history tracking
  useEffect(() => {
    setSparkHistory(prev => { // eslint-disable-line react-hooks/set-state-in-effect
      const next = {
        speed: [...prev.speed, droneSpeed].slice(-40),
        alt: [...prev.alt, droneAlt].slice(-40),
        batt: [...prev.batt, droneBattery].slice(-40),
      };
      return next;
    });
  }, [droneSpeed, droneAlt, droneBattery]);

  // Draw sparklines
  useEffect(() => {
    const draw = (id, data, color) => {
      const canvas = document.getElementById(id);
      if (!canvas || !canvas.parentElement) return;
      if (!L) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width = canvas.parentElement.offsetWidth;
      const h = canvas.height = 22;
      ctx.clearRect(0, 0, w, h);
      if (data.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      const maxHistoryLength = 40;
      const step = w / (maxHistoryLength - 1);
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min === 0 ? 1 : max - min;
      for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const y = h - ((data[i] - min) / range) * (h - 4) - 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, color.replace('1)', '0.2)'));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.lineTo((data.length - 1) * step, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    };
    draw('cc-spark-speed', sparkHistory.speed, 'rgba(6,182,212,1)');
    draw('cc-spark-alt', sparkHistory.alt, 'rgba(139,92,246,1)');
    draw('cc-spark-batt', sparkHistory.batt, sparkHistory.batt.length > 0 && sparkHistory.batt[sparkHistory.batt.length - 1] < 25 ? 'rgba(239,68,68,1)' : 'rgba(16,185,129,1)');
  }, [sparkHistory]);

  // ===================================================================
  // AUDIO ENGINE
  // ===================================================================
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playBeep = useCallback((freq, duration, type = 'sine', volume = 0.05) => {
    if (!audioEnabled) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
} catch { /* audio context may fail silently */ }
  }, [audioEnabled, initAudio]);

  const playAlarmSound = useCallback(() => {
    if (!audioEnabled) return;
    initAudio();
    playBeep(880, 0.25, 'sawtooth', 0.03);
    setTimeout(() => playBeep(660, 0.25, 'sawtooth', 0.03), 200);
  }, [audioEnabled, initAudio, playBeep]);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
    if (!audioEnabled) {
      playBeep(523.25, 0.15);
    }
  }, [audioEnabled, playBeep]);

  // ===================================================================
  // INITIALIZE MAP
  // ===================================================================
  useEffect(() => {
    if (typeof L === 'undefined' || typeof L.map === 'undefined') return;
    if (mapInstanceRef.current) return;

    const map = L.map('cc-map', { zoomControl: false, attributionControl: false }).setView([10.76200, 106.66600], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    const routeLine = L.polyline([], { color: '#06B6D4', weight: 3, opacity: 0.85, dashArray: "8, 6" }).addTo(map);
    routeLineRef.current = routeLine;

    const droneIcon = L.divIcon({
      className: '',
      html: '<div id="cc-drone-marker" style="width:14px;height:14px;border-radius:50%;background:#06B6D4;box-shadow:0 0 12px 5px rgba(6,182,212,0.7);border:2px solid #fff;"></div>',
      iconSize: [14, 14]
    });
    const droneMarker = L.marker(DOCK_COORD, { icon: droneIcon }).addTo(map);
    droneMarkerRef.current = droneMarker;

    const dockerIcon = L.divIcon({
      className: '',
      html: '<div style="width:18px;height:18px;border-radius:4px;background:#10B981;box-shadow:0 0 12px 5px rgba(16,185,129,0.6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:9px;color:#fff;font-family:JetBrains Mono,monospace;">D</div>',
      iconSize: [18, 18]
    });
    const dockerMarker = L.marker(DOCK_COORD, { icon: dockerIcon }).addTo(map);
    dockerMarker.bindPopup("<b style='color:#e5eaf3;'>Trạm sạc Docker Base #DK-01</b>");
    dockerMarkerRef.current = dockerMarker;

    Object.keys(WAYPOINTS).forEach((key, index) => {
      const wp = WAYPOINTS[key];
      const wpIcon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:3px;background:rgba(245,158,11,0.15);border:1.5px solid #F59E0B;box-shadow:0 0 8px rgba(245,158,11,0.4);display:flex;align-items:center;justify-content:center;font-family:JetBrains Mono,monospace;font-size:9px;font-weight:bold;color:#F59E0B;">H${index+1}</div>`,
        iconSize: [16, 16]
      });
      L.marker(wp.coord, { icon: wpIcon }).addTo(map).bindPopup(`<b style="color:#e5eaf3;">${wp.name}</b>`);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ===================================================================
  // LOG SYSTEM
  // ===================================================================
  const writeToLogCenter = useCallback((tag, msg, type = 'all') => {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    const rawLog = { ts, tag, msg, type };
    setAllLogsArray(prev => {
      const newLogs = [...prev, rawLog];
      if (newLogs.length > 100) newLogs.shift();
      return newLogs;
    });
  }, []);

  // ===================================================================
  // UPDATE SQL ITEM STATUS
  // ===================================================================
  const updateActiveSqlItemStatus = useCallback((hospitalName, newStatus) => {
    setSqlDatabase(prev => {
      const newDb = prev.map(row => {
        if (row.destination === hospitalName && (row.status === "ĐANG BAY" || row.status === "ĐANG THẢ HÀNG")) {
          return { ...row, status: newStatus };
        }
        return row;
      });
      return newDb;
    });
  }, []);

  // ===================================================================
  // FLIGHT STATE MACHINE TICK
  // ===================================================================
  const tickFlight = useCallback(() => {
    const state = stateRef.current;
    const battery = droneBatteryRef.current;
    const alt = droneAltRef.current;
    const speed = droneSpeedRef.current;
    const lat = droneLatRef.current;
    const lng = droneLngRef.current;
    const targetIdx = targetNodeIndexRef.current;
    const targetHospital = currentTargetHospitalRef.current;
    const coords = flightPathCoordsRef.current;

    let newState = state;
    let newBattery = battery;
    let newAlt = alt;
    let newSpeed = speed;
    let newLat = lat;
    let newLng = lng;

    const setIotAndBattery = () => {
      setIotDoor(iotDoorRef.current);
      setIotGear(iotGearRef.current);
      setIotCharge(iotChargeRef.current);
      setIotPower(iotPowerRef.current);
    };

    if (state === "STANDBY") {
      if (battery < 100) {
        newBattery = Math.min(100, battery + 0.3);
        iotDoorRef.current = "ĐÃ ĐÓNG";
        iotGearRef.current = "ĐÃ KHÓA";
        iotChargeRef.current = "SẠC SIÊU TỐC";
        iotPowerRef.current = "2.1 kW";
      } else {
        iotDoorRef.current = "ĐÃ ĐÓNG";
        iotGearRef.current = "ĐÃ KHÓA";
        iotChargeRef.current = "HOÀN THÀNH SẠC";
        iotPowerRef.current = "0.0 kW";
      }
    } else if (state === "PREFLIGHT") {
      iotDoorRef.current = "ĐANG MỞ...";
      iotGearRef.current = "ĐANG NHẢ NGÀM...";
      iotChargeRef.current = "NGẮT SẠC";
      iotPowerRef.current = "0.0 kW";
      playBeep(440, 0.1, 'sawtooth');
      setTimeout(() => {
        setCurrentState("TAKEOFF");
        writeToLogCenter("SYSTEM", "Docker Base mở khóa hoàn tất. Động cơ VTOL khởi động kéo ga.", "sys");
      }, 2000);
      return;
    } else if (state === "TAKEOFF") {
      iotDoorRef.current = "ĐÃ MỞ";
      iotGearRef.current = "ĐÃ NHẢ";
      iotChargeRef.current = "SẴN SÀNG";
      iotPowerRef.current = "0.0 kW";
      newAlt = Math.min(45, alt + 4.5);
      newSpeed = 5;
      newBattery = battery - 0.1;
      if (newAlt >= 45) {
        newState = "EN_ROUTE";
        writeToLogCenter("MAVLink", "Reached target flight altitude [45m]. Initiating transition to Cruise flight mode.", "mav");
        playBeep(587.33, 0.2, 'sine');
      }
    } else if (state === "EN_ROUTE") {
      newAlt = 45 + (Math.random() - 0.5) * 1.5;
      newSpeed = Math.min(48, speed + 3);
      newBattery = battery - 0.15;
      const target = coords[targetIdx];
      if (target) {
        const dx = target[0] - lat;
        const dy = target[1] - lng;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 0.0008) {
          newState = "DELIVERING";
          writeToLogCenter("COMMAND", `Đã tới mục tiêu ${targetHospital}. Thực hiện treo thăng bằng kích hoạt tời Winch thả hàng.`, "cmd");
          playBeep(659.25, 0.3, 'sine');
        } else {
          newLat = lat + (dx / dist) * 0.0003;
          newLng = lng + (dy / dist) * 0.0003;
          if (droneMarkerRef.current) {
            droneMarkerRef.current.setLatLng([newLat, newLng]);
            const angle = Math.atan2(dx, dy) * (180 / Math.PI);
            const markerEl = document.getElementById('cc-drone-marker');
            if (markerEl) markerEl.style.transform = `rotate(${90 - angle}deg)`;
          }
        }
      }
    } else if (state === "DELIVERING") {
      updateActiveSqlItemStatus(targetHospital, "ĐANG THẢ HÀNG");
      setTimeout(() => {
        updateActiveSqlItemStatus(targetHospital, "ĐÃ GIAO");
        writeToLogCenter("SYSTEM", `Cảm biến tải lực Loadcell báo Winch đã tách kén hàng an toàn tại ${targetHospital}.`, "sys");
        playBeep(880, 0.4, 'sine');
        setCurrentState("RETURNING");
        setFlightPathCoords([DOCK_COORD]);
        setTargetNodeIndex(0);
      }, 3000);
      return;
    } else if (state === "RETURNING") {
      newAlt = 45 + (Math.random() - 0.5) * 1.5;
      newSpeed = Math.min(52, speed + 3);
      newBattery = battery - 0.15;
      const dx = DOCK_COORD[0] - lat;
      const dy = DOCK_COORD[1] - lng;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 0.0008) {
        newState = "LANDING";
        writeToLogCenter("MAVLink", "Approach Docker Base zone. De-accelerating transition to vertical landing descent.", "mav");
      } else {
        newLat = lat + (dx / dist) * 0.0004;
        newLng = lng + (dy / dist) * 0.0004;
        if (droneMarkerRef.current) droneMarkerRef.current.setLatLng([newLat, newLng]);
      }
    } else if (state === "LANDING") {
      newAlt = Math.max(0, alt - 3.5);
      newSpeed = 6;
      newBattery = battery - 0.08;
      const dx = DOCK_COORD[0] - lat;
      const dy = DOCK_COORD[1] - lng;
      newLat = lat + dx * 0.4;
      newLng = lng + dy * 0.4;
      if (droneMarkerRef.current) droneMarkerRef.current.setLatLng([newLat, newLng]);
      if (newAlt <= 0) {
        newState = "DOCKING";
        writeToLogCenter("SYSTEM", "Tiếp đất chạm sàn Docker hoàn toàn. Kích hoạt hạ ngàm kẹp cơ cơ học.", "sys");
        playBeep(523.25, 0.4, 'sine', 0.08);
      }
    } else if (state === "DOCKING") {
      iotDoorRef.current = "ĐANG ĐÓNG...";
      iotGearRef.current = "ĐANG KHÓA NHANH...";
      iotChargeRef.current = "KẾT NỐI SẠC";
      iotPowerRef.current = "0.0 kW";
      setTimeout(() => {
        setCurrentState("STANDBY");
        const cc = document.querySelector('.command-center');
        if (cc) cc.classList.remove('alarm-active');
        writeToLogCenter("SYSTEM", "Trạm Docker khóa thành công. Kích hoạt sạc siêu tốc 2.1kW.", "sys");
        setShowDiagnose(false);
      }, 2000);
      return;
    } else if (state === "RTL_EMERGENCY") {
      if (Math.floor(Date.now() / 500) % 2 === 0) { playAlarmSound(); }
      newAlt = Math.max(30, alt - 1.5);
      newSpeed = 65;
      newBattery = battery - 0.25;
      const dx = DOCK_COORD[0] - lat;
      const dy = DOCK_COORD[1] - lng;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 0.001) {
        newState = "LANDING";
        writeToLogCenter("SYSTEM", "Đã thu hồi drone về vùng trời an toàn. Tiến hành hạ cánh khẩn.", "sys");
      } else {
        newLat = lat + (dx / dist) * 0.0006;
        newLng = lng + (dy / dist) * 0.0006;
        if (droneMarkerRef.current) droneMarkerRef.current.setLatLng([newLat, newLng]);
      }
    }

    setCurrentState(newState);
    setDroneBattery(newBattery);
    setDroneAlt(newAlt);
    setDroneSpeed(newSpeed);
    setDroneLat(newLat);
    setDroneLng(newLng);
    setIotAndBattery();
  }, [playBeep, playAlarmSound, writeToLogCenter, updateActiveSqlItemStatus]);

  // ===================================================================
  // BACKEND SYNC
  // ===================================================================
  const syncOrdersFromBackend = useCallback(async () => {
    const orders = await apiFetchOrders();
    if (!orders) return;
    const mapped = orders.map(o => ({
      id: o._id || o.id,
      destination: o.destination || '--',
      item: o.medical_item || o.item || '--',
      urgency: o.urgency || 'Bình thường',
      doctor: (o.created_by && o.created_by.name) || '--',
      notes: o.notes || '',
      weather: o.notes || 'Thời tiết lý tưởng',
      status: STATUS_MAP[o.status] || 'CHỜ XỬ LÝ',
      time: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '',
      _backendId: o._id || o.id,
      _status: o.status,
    }));
    setSqlDatabase(mapped);
  }, []);

  useEffect(() => {
    syncOrdersFromBackend();
    apiFetchDrones().then(dronesList => {
      if (dronesList && dronesList.length > 0) {
        setAvailableDrones(dronesList);
        const online = dronesList.find(d => d.status === 'online');
        setSelectedDroneId(String(online ? online._id || online.id : dronesList[0]._id || dronesList[0].id));
      }
    });
    const interval = setInterval(syncOrdersFromBackend, 5000);
    return () => clearInterval(interval);
  }, [syncOrdersFromBackend]);

  // ===================================================================
  // DISPATCH WORKFLOW
  // ===================================================================
  const prepareOrder = useCallback((order) => {
    setDispatchOrder(order);
    setFlightMinutes(15);
    const online = availableDrones.find(d => d.status === 'online');
    if (online) setSelectedDroneId(String(online._id || online.id));
    playBeep(523.25, 0.15);
  }, [availableDrones, playBeep]);

  const closeDispatchPanel = useCallback(() => {
    setDispatchOrder(null);
  }, []);

  const confirmPrepare = useCallback(async () => {
    if (!dispatchOrder) return;
    const droneId = selectedDroneId;
    if (!droneId) {
      writeToLogCenter("FAIL", "Vui lòng chọn drone trước khi chuẩn bị hàng!", "sys");
      playBeep(220, 0.3, 'sawtooth', 0.08);
      return;
    }
    setPreparingId(dispatchOrder._backendId);
    const res = await apiUpdateOrderStatus(dispatchOrder._backendId, 'packaging', droneId);
    setPreparingId(null);
    if (res.success) {
      writeToLogCenter("DATABASE", `Đơn ${dispatchOrder.id} đã xác nhận chuẩn bị hàng, gán drone ${droneId}.`, 'sys');
      playBeep(659.25, 0.1, 'sine', 0.05);
      syncOrdersFromBackend();
    } else {
      writeToLogCenter("FAIL", `Lỗi chuẩn bị đơn: ${res.message || 'không xác định'}`, 'sys');
    }
  }, [dispatchOrder, selectedDroneId, writeToLogCenter, playBeep, syncOrdersFromBackend]);

  const takeOff = useCallback(async () => {
    if (!dispatchOrder) return;
    const droneId = selectedDroneId;
    if (!droneId) {
      writeToLogCenter("FAIL", "Vui lòng chọn drone trước khi Take Off!", "sys");
      playBeep(220, 0.3, 'sawtooth', 0.08);
      return;
    }
    setPreparingId(dispatchOrder._backendId);
    const destName = dispatchOrder.destination || 'BV Chợ Rẫy';
    let wpKey = "choray";
    if (destName.includes("Từ Dũ")) wpKey = "tudu";
    if (destName.includes("Nhi Đồng")) wpKey = "nhidong";
    const targetWp = WAYPOINTS[wpKey];

    const missionRes = await apiCreateMission(dispatchOrder._backendId, droneId, destName, targetWp.coord[0], targetWp.coord[1]);
    if (missionRes.success) {
      writeToLogCenter("DATABASE", `Mission ${missionRes.data._id || missionRes.data.id} đã tạo. Drone ${droneId} cất cánh → ${destName} (dự kiến ${flightMinutes} phút).`, 'sys');
    } else {
      writeToLogCenter("FAIL", `Lỗi tạo mission: ${missionRes.message || 'không xác định'}`, 'sys');
    }
    const statusRes = await apiUpdateOrderStatus(dispatchOrder._backendId, 'departed', droneId);
    if (statusRes.success) {
      writeToLogCenter("COMMAND", `Đơn ${dispatchOrder.id}: Drone đã cất cánh tới ${destName}.`, "cmd");
    }

    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs([DOCK_COORD, targetWp.coord]);
    }
    setFlightPathCoords([targetWp.coord]);
    setTargetNodeIndex(0);
    setCurrentTargetHospital(destName);
    setCurrentState("TAKEOFF");
    setPreparingId(null);
    setDispatchOrder(null);
    syncOrdersFromBackend();
    playBeep(880, 0.4, 'sine', 0.08);
  }, [dispatchOrder, selectedDroneId, flightMinutes, writeToLogCenter, playBeep, syncOrdersFromBackend]);

  // ===================================================================
  // MISSION CONTROL
  // ===================================================================
  const triggerRTL = useCallback(() => {
    const state = stateRef.current;
    if (state === "STANDBY") return;
    setCurrentState("RTL_EMERGENCY");
    const cc = document.querySelector('.command-center');
    if (cc) cc.classList.add('alarm-active');
    setShowDiagnose(true);

    const db = sqlDatabaseRef.current;
    db.forEach(row => {
      if ((row.status === "ĐANG BAY") && row._backendId) {
        apiUpdateOrderStatus(row._backendId, 'cancelled');
      }
    });

    setSqlDatabase(prev => prev.map(row =>
      row.status === "ĐANG BAY" ? { ...row, status: "ĐÃ HUỶ" } : row
    ));
    writeToLogCenter("KHẨN", "NGUY HIỂM! Lệnh hủy chuyến bay cư hoạch. Drone quay lại bãi đáp tức thời.", "sys");
    playBeep(110, 0.4, 'sawtooth', 0.1);
  }, [writeToLogCenter, playBeep]);

  const dispatchNewPackage = useCallback(() => {
    if (!pkgName.trim()) {
      playBeep(220, 0.3, 'sawtooth', 0.08);
      return;
    }
    const destName = WAYPOINTS[pkgDest].name;
    apiCreateOrder({
      medical_item: pkgName,
      destination: destName,
      urgency: 'Bình thường',
      notes: '',
    }).then(res => {
      if (res.success) {
        writeToLogCenter("DATABASE", `Đơn hàng ${res.data.code} đã được tạo trên server.`, 'sys');
        syncOrdersFromBackend();
      } else {
        writeToLogCenter("FAIL", `Lỗi tạo đơn: ${res.message}`, 'sys');
      }
    });
    playBeep(659.25, 0.1, 'sine', 0.05);
    setPkgName("");
  }, [pkgName, pkgDest, writeToLogCenter, playBeep, syncOrdersFromBackend]);

  // ===================================================================
  // EFFECTS - Flight tick & clock
  // ===================================================================
  useEffect(() => {
    const interval = setInterval(tickFlight, 500);
    return () => clearInterval(interval);
  }, [tickFlight]);

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (stateRef.current !== "STANDBY") {
        writeToLogCenter("MAVLink", JSON.stringify({
          type: "GLOBAL_POSITION_INT",
          lat: Math.floor(droneLatRef.current * 10000000),
          lon: Math.floor(droneLngRef.current * 10000000),
          alt: Math.floor(droneAltRef.current * 1000),
          vx: Math.floor(droneSpeedRef.current * 27.7)
        }), "mav");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [writeToLogCenter]);

  // ===================================================================
  // RENDER HELPERS
  // ===================================================================
  const getPhaseText = () => {
    if (currentState === "STANDBY") return "PHASE: STANDBY";
    if (currentState === "PREFLIGHT") return "PHASE: PRE-FLIGHT CHECK";
    if (currentState === "TAKEOFF") return "PHASE: TAKEOFF";
    if (currentState === "EN_ROUTE") return `CRUISE: ${currentTargetHospital}`;
    if (currentState === "DELIVERING") return "PHASE: DELIVERING PAYLOAD";
    if (currentState === "RETURNING") return "PHASE: RETURNING TO BASE";
    if (currentState === "LANDING") return "PHASE: LANDING";
    if (currentState === "DOCKING") return "PHASE: DOCKING";
    if (currentState === "RTL_EMERGENCY") return "FAIL-SAFE: RETURN TO PORT";
    return "PHASE: STANDBY";
  };

  const getSystemStatus = () => {
    if (currentState === "RTL_EMERGENCY") return "HỦY KHẨN CẤP (RTL)";
    if (currentState === "STANDBY") return "ĐANG CHỜ LỆNH";
    return "DỊCH CHUYỂN";
  };

  // Status color helpers
  const batteryColorHex = (batt) => batt > 60 ? '#10B981' : batt > 25 ? '#F59E0B' : '#EF4444';

  // Active fleet drone (from props or fallback to availableDrones / derive)
  const fleetDrones = drones && drones.length > 0 ? drones : availableDrones;
  const activeDrone = fleetDrones.find(d => String(d.id) === String(activeDroneId)) || fleetDrones[0] || null;

  const filteredFleetDrones = fleetDrones.filter(d => {
    const matchSearch = !searchTerm || (d.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const fleetStats = {
    total: fleetDrones.length,
    online: fleetDrones.filter(d => d.status === 'online').length,
    warning: fleetDrones.filter(d => d.status === 'warning').length,
    offline: fleetDrones.filter(d => d.status === 'offline').length,
  };

  const renderSqlTable = () => {
    if (!sqlDatabase || sqlDatabase.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="cc-empty-row">
            <p className="text-[11px] text-[var(--color-ink-muted)]">Chưa có đơn hàng. Đơn từ bác sĩ sẽ hiển thị tại đây.</p>
          </td>
        </tr>
      );
    }
    return sqlDatabase.map(row => {
      let pillClass = 'pending';
      if (row.status === 'ĐANG BAY') pillClass = 'enroute';
      if (row.status === 'ĐÃ GIAO') pillClass = 'delivered';
      if (row.status === 'ĐÃ HUỶ') pillClass = 'alert';
      if (row.status === 'ĐÓNG GÓI') pillClass = 'enroute';
      const isPending = row._status === 'pending' || row.status === 'CHỜ XỬ LÝ';
      const isPreparing = preparingId === row._backendId;
      return (
        <tr key={row.id}>
          <td><span className="font-mono font-bold text-cyan-300">#{String(row.id).slice(-6)}</span></td>
          <td>{row.doctor}</td>
          <td>{row.item}</td>
          <td>{row.destination}</td>
          <td className={row.urgency === 'Cấp cứu khẩn' ? 'text-red-400' : 'text-[var(--color-ink-muted)]'}>
            {row.urgency === 'Cấp cứu khẩn' ? <Flame size={11} className="inline mr-1" /> : null}{row.urgency}
          </td>
          <td><span className={`cc-pill ${pillClass}`}>{row.status}</span></td>
          <td>
            {isPending ? (
              <button
                className="cc-qaction cc-qaction-emerald"
                onClick={() => prepareOrder(row)}
                disabled={!!isPreparing}
              >
                {isPreparing ? '...' : <><Box size={11} /> Chuẩn bị</>}
              </button>
            ) : (
              <span className="text-[var(--color-ink-muted)] text-[10px]">—</span>
            )}
          </td>
        </tr>
      );
    });
  };

  const renderLogs = () => {
    const filtered = allLogsArray.filter(log => {
      if (activeLogFilter === 'all') return true;
      return log.type === activeLogFilter;
    });
    return filtered.slice(-40).map((log, i) => {
      let colorClass = '';
      if (log.type === 'sys') colorClass = 'sys';
      if (log.tag.includes('FAIL') || log.tag.includes('KHẨN')) colorClass = 'err';
      return (
        <p key={i} className="cc-log-line">
          <span className="text-[var(--color-ink-muted)]">[{log.ts}]</span>{' '}
          <span className={`cc-log-tag ${colorClass}`}>[{log.tag}]</span>{' '}
          <span>{log.msg}</span>
        </p>
      );
    });
  };

  // Phase badge color for header
  const phaseIsEmergency = currentState === "RTL_EMERGENCY";
  const phaseIsActive = currentState !== "STANDBY";

  return (
    <div className={`command-center ${currentState === "RTL_EMERGENCY" ? 'alarm-active' : ''}`}>
      {/* Overlays */}
      <div className="cc-scanlines"></div>
      <div className="cc-grid-fade"></div>

      {/* ============================================================
          TOP HEADER BAR
      ============================================================ */}
      <header className="cc-header">
        <div className="flex items-center gap-3">
          <div className="cc-brand-mark">
            <NavigationIcon size={18} className="text-emerald-400" strokeWidth={2.2} />
          </div>
          <div>
            <div className="cc-brand-name">SAH<em>TECH</em> // DRONE COMMAND</div>
            <div className="cc-brand-sub">UAV FLEET OPERATIONS CENTER</div>
          </div>
        </div>

        {/* KPI Chips */}
        <div className="cc-kpi-strip">
          <div className="cc-kpi-chip">
            <span className="cc-kpi-dot text-white/70"></span>
            <span className="cc-kpi-label">TOTAL</span>
            <span className="cc-kpi-value text-white">{fleetStats.total}</span>
          </div>
          <div className="cc-kpi-chip">
            <span className="cc-kpi-dot bg-emerald-400"></span>
            <span className="cc-kpi-label">ONLINE</span>
            <span className="cc-kpi-value text-emerald-400">{fleetStats.online}</span>
          </div>
          <div className="cc-kpi-chip">
            <span className="cc-kpi-dot bg-amber-400"></span>
            <span className="cc-kpi-label">WARN</span>
            <span className="cc-kpi-value text-amber-400">{fleetStats.warning}</span>
          </div>
          <div className="cc-kpi-chip">
            <span className="cc-kpi-dot bg-red-500"></span>
            <span className="cc-kpi-label">OFFLINE</span>
            <span className="cc-kpi-value text-red-400">{fleetStats.offline}</span>
          </div>
        </div>

        <div className="cc-header-actions">
          <div className={`cc-phase-badge ${phaseIsEmergency ? 'alert' : phaseIsActive ? 'active' : ''}`}>
            <Activity size={12} />
            <span>{getSystemStatus()}</span>
          </div>
          <div className="cc-clock">
            <span className="font-mono">{clock}</span>
          </div>
          <button className="cc-icon-btn" onClick={toggleAudio} title="Bật/Tắt âm thanh">
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <div className="relative">
            <button
              className="cc-icon-btn relative"
              onClick={() => setShowAlertPanel(v => !v)}
              title="Thông báo hệ thống"
            >
              <Bell size={16} />
              {fleetStats.warning + fleetStats.offline > 0 && (
                <span className="cc-alert-badge">{fleetStats.warning + fleetStats.offline}</span>
              )}
            </button>
            {showAlertPanel && (
              <div className="cc-alert-popover">
                <div className="cc-alert-popover-title">HỆ THỐNG CẢNH BÁO</div>
                {fleetStats.warning > 0 && (
                  <div className="cc-alert-item warn">
                    <TriangleAlert size={14} />
                    <span>{fleetStats.warning} drone ở trạng thái cảnh báo (pin yếu / nhiệt cao)</span>
                  </div>
                )}
                {fleetStats.offline > 0 && (
                  <div className="cc-alert-item danger">
                    <Siren size={14} />
                    <span>{fleetStats.offline} drone mất kết nối</span>
                  </div>
                )}
                {fleetStats.warning + fleetStats.offline === 0 && (
                  <div className="cc-alert-item ok">
                    <ShieldCheck size={14} />
                    <span>Tất cả hệ thống hoạt động bình thường</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="cc-back-btn" onClick={onBackToFleet}>
            <ArrowLeft size={14} /> Fleet
          </button>
        </div>
      </header>

      {/* ============================================================
          MAIN 70 / 30 WORKSPACE
      ============================================================ */}
      <div className="cc-workspace">
        {/* ------------ LEFT : MAP (70%) ------------ */}
        <section className="cc-map-panel">
          <div className="cc-panel-toolbar">
            <div className="flex items-center gap-2.5">
              <Radio size={14} className="text-cyan-400" />
              <span className="cc-panel-title">Interactive Flight View</span>
              <span className="cc-panel-sub">GIS · Live Telemetry</span>
            </div>
            <div className={`cc-phase-tag ${phaseIsEmergency ? 'alert' : phaseIsActive ? 'active' : 'idle'}`}>
              {getPhaseText()}
            </div>
          </div>

          <div className="cc-map-container">
            <div id="cc-map" className="cc-map-canvas"></div>

            {/* Live telemetry HUD overlay */}
            <div className="cc-hud-overlay top-left">
              <div className="cc-hud-cell">
                <Gauge size={11} className="text-cyan-400" />
                <span className="cc-hud-label">SPEED</span>
                <span className="cc-hud-monovalue">{droneSpeed.toFixed(1)}<small>km/h</small></span>
                <canvas id="cc-spark-speed"></canvas>
              </div>
              <div className="cc-hud-cell">
                <NavigationIcon size={11} className="text-violet-400" />
                <span className="cc-hud-label">ALT</span>
                <span className="cc-hud-monovalue">{droneAlt.toFixed(1)}<small>m</small></span>
                <canvas id="cc-spark-alt"></canvas>
              </div>
              <div className="cc-hud-cell">
                <BatteryCharging size={11} className={droneBattery < 25 ? 'text-red-400' : 'text-emerald-400'} />
                <span className="cc-hud-label">BATT</span>
                <span className={`cc-hud-monovalue ${droneBattery < 25 ? 'err' : ''}`}>{droneBattery.toFixed(1)}<small>%</small></span>
                <div className="cc-mini-battery">
                  <div className="cc-mini-battery-fill" style={{ width: `${droneBattery}%`, background: batteryColorHex(droneBattery) }} />
                </div>
              </div>
            </div>

            <div className="cc-hud-overlay top-right">
              <div className="cc-coord-chip">
                <MapPin size={11} className="text-cyan-400" />
                <span>{droneLat.toFixed(5)}, {droneLng.toFixed(5)}</span>
              </div>
              <div className="cc-coord-chip">
                <Wind size={11} className="text-amber-400" />
                <span>Wind 12.3 km/h</span>
              </div>
            </div>

            {/* Map legend */}
            <div className="cc-map-legend">
              <span><i className="cc-legend-dot bg-cyan-400"></i> Drone</span>
              <span><i className="cc-legend-dot bg-emerald-400"></i> Docker Base</span>
              <span><i className="cc-legend-dot bg-amber-400"></i> Hospital</span>
              <span><i className="cc-legend-line"></i> Flight Path</span>
            </div>
          </div>

          {/* Dispatch bar */}
          <div className="cc-dispatch-bar">
            <div className="cc-dispatch-input-wrap">
              <Search size={13} className="text-[var(--color-ink-muted)]" />
              <input
                className="cc-dispatch-input"
                placeholder="Medical item (Ví dụ: Insulin, Máu A, Vắc-xin)..."
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
              />
            </div>
            <select className="cc-dispatch-select" value={pkgDest} onChange={(e) => setPkgDest(e.target.value)}>
              <option value="choray">BV Chợ Rẫy</option>
              <option value="tudu">BV Từ Dũ</option>
              <option value="nhidong">BV Nhi Đồng 1</option>
            </select>
            <button className="cc-qaction cc-qaction-emerald" onClick={dispatchNewPackage}>
              <Plus size={14} /> Tạo Đơn
            </button>
            <button className="cc-qaction cc-qaction-danger" onClick={triggerRTL} disabled={currentState === "STANDBY"}>
              <Siren size={14} /> RTL
            </button>
          </div>
        </section>

        {/* ------------ RIGHT : SMART PANEL (30%) ------------ */}
        <aside className="cc-side-panel">
          {/* Active drone telemetry card */}
          <div className="cc-card cc-corner">
            <div className="cc-card-head">
              <div>
                <div className="cc-card-title">ACTIVE VEHICLE</div>
                <div className="cc-card-sub">Drone Telemetry</div>
              </div>
              {activeDrone && (
                <span className={`cc-status-badge ${activeDrone.status}`}>
                  {activeDrone.status === 'online' ? <Shield size={10} /> : activeDrone.status === 'warning' ? <TriangleAlert size={10} /> : <Siren size={10} />}
                  {activeDrone.status === 'online' ? 'ONLINE' : activeDrone.status === 'warning' ? 'WARNING' : 'OFFLINE'}
                </span>
              )}
            </div>

            {activeDrone ? (
              <div className="cc-vehicle-body">
                <div className="cc-vehicle-top">
                  <div className="cc-vehicle-name">
                    <span className="cc-vehicle-avatar">
                      <Plane size={16} />
                    </span>
                    <div>
                      <div className="cc-vehicle-name-text">{activeDrone.name}</div>
                      <div className="cc-vehicle-mode">
                        <i className={`cc-vehicle-led ${activeDrone.armed ? 'armed' : 'disarmed'}`}></i>
                        {activeDrone.armed ? 'ARMED' : 'DISARMED'} · {activeDrone.mode?.toUpperCase() || 'VTOL'}
                      </div>
                    </div>
                  </div>
                  <div className={`cc-arm-switch ${activeDrone.armed ? 'on' : ''}`}>
                    <ShieldCheck size={12} />
                    {activeDrone.armed ? 'ARM' : 'DIS'}
                  </div>
                </div>

                {/* Telemetry grid */}
                <div className="cc-tele-grid">
                  <div className="cc-tele-cell">
                    <MapPin size={11} className="text-cyan-400" />
                    <div className="flex-1 min-w-0">
                      <div className="cc-tele-label">GPS</div>
                      <div className="cc-tele-value font-mono text-[11px]">{activeDrone.gps?.lat?.toFixed(4)}, {activeDrone.gps?.lng?.toFixed(4)}</div>
                    </div>
                  </div>
                  <div className="cc-tele-cell">
                    <NavigationIcon size={11} className="text-violet-400" />
                    <div className="flex-1 min-w-0">
                      <div className="cc-tele-label">ĐỘ CAO</div>
                      <div className="cc-tele-value">{activeDrone.altitude ?? 0}<small>m</small></div>
                    </div>
                  </div>
                  <div className="cc-tele-cell">
                    <Thermometer size={11} className={activeDrone.temperature > 40 ? 'text-amber-400' : 'text-emerald-400'} />
                    <div className="flex-1 min-w-0">
                      <div className="cc-tele-label">NHIỆT ĐỘ</div>
                      <div className="cc-tele-value">{activeDrone.temperature}<small>°C</small></div>
                    </div>
                  </div>
                  <div className="cc-tele-cell">
                    <Wind size={11} className="text-amber-400" />
                    <div className="flex-1 min-w-0">
                      <div className="cc-tele-label">GIÓ</div>
                      <div className="cc-tele-value">{activeDrone.windSpeed}<small>km/h</small></div>
                    </div>
                  </div>
                </div>

                {/* Battery */}
                <div className="cc-battery-block">
                  <div className="flex items-center justify-between">
                    <span className="cc-tele-label inline-flex items-center gap-1"><BatteryCharging size={12} /> PIN</span>
                    <span className="font-mono font-bold" style={{ color: batteryColorHex(activeDrone.battery) }}>{activeDrone.battery}%</span>
                  </div>
                  <div className="cc-batt-track">
                    <div className="cc-batt-fill" style={{ width: `${activeDrone.battery}%`, background: batteryColorHex(activeDrone.battery) }} />
                  </div>
                </div>

                {/* Quick actions */}
                <div className="cc-quick-actions">
                  <button className="cc-qaction cc-qaction-cyan" onClick={() => alert(`🎥 ${activeDrone.name}: Đang mở video stream...`)}>
                    <Video size={14} /> Live
                  </button>
                  <button className="cc-qaction cc-qaction-emerald" onClick={() => alert(`✅ ${activeDrone.name}: Tiếp tục bay theo hành trình`)}>
                    <Play size={14} /> Tiếp
                  </button>
                  <button className="cc-qaction cc-qaction-emerald" onClick={() => alert(`⏸️ ${activeDrone.name}: Tạm dừng bay`)}>
                    <Pause size={14} /> Pause
                  </button>
                  <button className="cc-qaction cc-qaction-emerald" onClick={() => alert(`🏠 ${activeDrone.name}: Kích hoạt RTL - Return To Launch`)}>
                    <Home size={14} /> RTL
                  </button>
                  <button className="cc-qaction cc-qaction-danger" onClick={() => alert(`🚨 ${activeDrone.name}: LỆNH KHẨN CẤP`)}>
                    <Siren size={14} /> Khẩn
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-[var(--color-ink-muted)] text-sm">Chưa có drone hoạt động</div>
            )}
          </div>

          {/* Fleet rail with search & filter */}
          <div className="cc-card">
            <div className="cc-card-head">
              <div>
                <div className="cc-card-title">DRONE FLEET</div>
                <div className="cc-card-sub">{fleetStats.total} vehicles registered</div>
              </div>
            </div>
            <div className="cc-fleet-search">
              <input
                className="cc-fleet-search-input"
                placeholder="Tìm kiếm drone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="cc-fleet-search-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="online">Online</option>
                <option value="warning">Warning</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="cc-fleet-list">
              {filteredFleetDrones.length === 0 && (
                <div className="text-center text-[var(--color-ink-muted)] text-xs py-6">Không tìm thấy drone</div>
              )}
              {filteredFleetDrones.map((d) => {
                const battColor = batteryColorHex(d.battery);
                return (
                  <button
                    key={String(d.id)}
                    className={`cc-fleet-item ${String(activeDroneId) === String(d.id) || (!activeDroneId && d.id === activeDrone?.id) ? 'active' : ''}`}
                    onClick={() => setActiveDroneId(String(d.id))}
                  >
                    <span className={`cc-fleet-led ${d.status}`}></span>
                    <span className="cc-fleet-name">{d.name}</span>
                    <span className="cc-fleet-alt">{d.altitude ?? 0}m</span>
                    <span className="cc-fleet-batt">
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: battColor }}></span>
                      {d.battery}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order table */}
          <div className="cc-card">
            <div className="cc-card-head">
              <div>
                <div className="cc-card-title">MISSION QUEUE</div>
                <div className="cc-card-sub">Medical dispatch orders</div>
              </div>
              <span className="cc-queue-count">{sqlDatabase.length}</span>
            </div>
            <div className="cc-table-scroll">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Y phẩm</th>
                    <th>Điểm nhận</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>{renderSqlTable()}</tbody>
              </table>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================================
          BOTTOM LOG TERMINAL
      ============================================================ */}
      <footer className="cc-terminal-bar">
        <div className="cc-terminal-head">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-emerald-400" />
            <span className="cc-terminal-title">TELEMETRY LOG</span>
            <span className="text-[9px] text-[var(--color-ink-muted)] font-mono">NoSQL · MAVLink Stream</span>
          </div>
          <div className="cc-terminal-filters">
            {['all', 'mav', 'sys', 'cmd'].map((f) => (
              <button
                key={f}
                className={`cc-filter-btn ${activeLogFilter === f ? 'active' : ''}`}
                onClick={() => { setActiveLogFilter(f); playBeep(440, 0.08); }}
              >
                {f === 'all' ? 'Tất cả' : f === 'mav' ? 'MAVLink' : f === 'sys' ? 'Hệ thống' : 'Mệnh lệnh'}
              </button>
            ))}
          </div>
        </div>
        <div className="cc-terminal-body">
          {renderLogs().length === 0 ? (
            <p className="text-[var(--color-ink-muted)] text-[11px]">Awaiting telemetry stream...</p>
          ) : renderLogs()}
        </div>
      </footer>

      {/* ============================================================
          DISPATCH MODAL
      ============================================================ */}
      {dispatchOrder && (
        <div className="cc-dispatch-overlay" onClick={closeDispatchPanel}>
          <div className="cc-dispatch-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="cc-card-title flex items-center gap-2 text-base">
                  <Box size={16} className="text-emerald-400" />
                  Chuẩn bị đơn hàng — #{String(dispatchOrder.id).slice(-6)}
                </div>
                <div className="cc-card-sub mt-1">Từ bác sĩ: {dispatchOrder.doctor}</div>
              </div>
              <button className="cc-icon-btn" onClick={closeDispatchPanel}>
                <X size={16} />
              </button>
            </div>

            <div className="cc-dispatch-info">
              <div className="cc-dispatch-info-row">
                <span className="cc-dispatch-info-label"><Package size={12} /> Y phẩm</span>
                <span className="cc-dispatch-info-value">{dispatchOrder.item}</span>
              </div>
              <div className="cc-dispatch-info-row">
                <span className="cc-dispatch-info-label"><MapPin size={12} /> Điểm nhận</span>
                <span className="cc-dispatch-info-value">{dispatchOrder.destination}</span>
              </div>
              <div className="cc-dispatch-info-row">
                <span className="cc-dispatch-info-label"><TriangleAlert size={12} /> Mức độ</span>
                <span className="cc-dispatch-info-value" style={{ color: dispatchOrder.urgency === 'Cấp cứu khẩn' ? '#EF4444' : '#E5EAF3' }}>
                  {dispatchOrder.urgency === 'Cấp cứu khẩn' ? '🚨 ' : '✅ '}{dispatchOrder.urgency}
                </span>
              </div>
              {dispatchOrder.notes && (
                <div className="cc-dispatch-info-row">
                  <span className="cc-dispatch-info-label"><Droplets size={12} /> Ghi chú</span>
                  <span className="cc-dispatch-info-value">{dispatchOrder.notes}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="cc-form-label">Chọn Drone vận chuyển</label>
              <select
                className="cc-dispatch-select w-full"
                value={selectedDroneId}
                onChange={(e) => setSelectedDroneId(e.target.value)}
              >
                {availableDrones.length === 0 && <option value="">Không có drone</option>}
                {availableDrones.map(d => (
                  <option key={d._id || d.id} value={String(d._id || d.id)}>
                    {d.name} — PIN {d.battery}% · {d.status === 'online' ? 'Sẵn sàng' : d.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label className="cc-form-label">Thời gian bay tới đích (phút)</label>
              <input
                type="number"
                className="cc-dispatch-input w-full"
                min={1}
                max={120}
                value={flightMinutes}
                onChange={(e) => setFlightMinutes(Number(e.target.value))}
              />
            </div>

            <div className="flex gap-2 mt-5">
              <button
                className="cc-qaction cc-qaction-emerald flex-1 justify-center"
                onClick={confirmPrepare}
                disabled={preparingId === dispatchOrder._backendId}
              >
                <Box size={14} /> Xác nhận chuẩn bị
              </button>
              <button
                className="cc-qaction cc-qaction-cyan flex-1 justify-center"
                onClick={takeOff}
                disabled={preparingId === dispatchOrder._backendId}
              >
                <Rocket size={14} /> Take Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommandCenter;

