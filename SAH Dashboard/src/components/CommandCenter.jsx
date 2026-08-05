import { useState, useEffect, useRef, useCallback } from 'react';
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

function CommandCenter({ onBackToFleet }) {
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
  const [dispatchOrder, setDispatchOrder] = useState(null); // order being prepared
  const [availableDrones, setAvailableDrones] = useState([]);
  const [selectedDroneId, setSelectedDroneId] = useState("");
  const [flightMinutes, setFlightMinutes] = useState(15);
  const [preparingId, setPreparingId] = useState(null); // loading state for prepare/off

  // Refs (for use inside intervals/callbacks only)
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

  // Sync refs with state
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
    } catch (_e) { void _e; /* audio context may fail silently */ }
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

    const routeLine = L.polyline([], { color: '#66FCF1', weight: 3, opacity: 0.8, dashArray: "8, 6" }).addTo(map);
    routeLineRef.current = routeLine;

    const droneIcon = L.divIcon({
      className: '',
      html: '<div id="cc-drone-marker" style="width:16px;height:16px;border-radius:50%;background:#66FCF1;box-shadow:0 0 12px 5px rgba(102,252,241,0.9);transition:transform 0.2s;"></div>',
      iconSize: [16, 16]
    });
    const droneMarker = L.marker(DOCK_COORD, { icon: droneIcon }).addTo(map);
    droneMarkerRef.current = droneMarker;

    const dockerIcon = L.divIcon({
      className: '',
      html: '<div style="width:20px;height:20px;border-radius:50%;background:#FF007F;box-shadow:0 0 12px 5px rgba(255,0,127,0.8);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:9px;color:#fff;">D1</div>',
      iconSize: [20, 20]
    });
    const dockerMarker = L.marker(DOCK_COORD, { icon: dockerIcon }).addTo(map);
    dockerMarker.bindPopup("<b style='color:#000;'>Trạm sạc Docker Base #DK-01</b>");
    dockerMarkerRef.current = dockerMarker;

    Object.keys(WAYPOINTS).forEach((key, index) => {
      const wp = WAYPOINTS[key];
      const wpIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:3px;background:rgba(102,252,241,0.2);border:2px solid #66FCF1;box-shadow:0 0 8px rgba(102,252,241,0.5);display:flex;align-items:center;justify-content:center;font-family:'Chakra Petch';font-size:10px;font-weight:bold;color:#66FCF1;">H${index+1}</div>`,
        iconSize: [18, 18]
      });
      L.marker(wp.coord, { icon: wpIcon }).addTo(map).bindPopup(`<b style="color:#000;">${wp.name}</b>`);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ===================================================================
  // SPARKLINE DRAWING
  // ===================================================================
  const drawSparkline = useCallback((canvasId, data, color) => { // eslint-disable-line no-unused-vars
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width = canvas.parentElement.offsetWidth;
    const h = canvas.height = 25;
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
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.lineTo((data.length - 1) * step, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    const replacedColor = color.replace('1)', '0.25)');
    grad.addColorStop(0, replacedColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fill();
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
  // UPDATE SQL ITEM STATUS — MUST BE ABOVE tickFlight
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
    let newDoor = iotDoorRef.current;
    let newGear = iotGearRef.current;
    let newCharge = iotChargeRef.current;
    let newPower = iotPowerRef.current;

    const setIotAndBattery = () => {
      setIotDoor(newDoor);
      setIotGear(newGear);
      setIotCharge(newCharge);
      setIotPower(newPower);
    };

    if (state === "STANDBY") {
      if (battery < 100) {
        newBattery = Math.min(100, battery + 0.3);
        newDoor = "ĐÃ ĐÓNG";
        newGear = "ĐÃ KHÓA";
        newCharge = "SẠC SIÊU TỐC";
        newPower = "2.1 kW";
      } else {
        newDoor = "ĐÃ ĐÓNG";
        newGear = "ĐÃ KHÓA";
        newCharge = "HOÀN THÀNH SẠC";
        newPower = "0.0 kW";
      }
    } else if (state === "PREFLIGHT") {
      setIotDoor("ĐANG MỞ...");
      setIotGear("ĐANG NHẢ NGÀM...");
      setIotCharge("NGẮT SẠC");
      setIotPower("0.0 kW");
      playBeep(440, 0.1, 'sawtooth');
      setTimeout(() => {
        setCurrentState("TAKEOFF");
        writeToLogCenter("SYSTEM", "Docker Base mở khóa hoàn tất. Động cơ VTOL khởi động kéo ga.", "sys");
      }, 2000);
      return;
    } else if (state === "TAKEOFF") {
      newDoor = "ĐÃ MỞ";
      newGear = "ĐÃ NHẢ";
      newCharge = "SẴN SÀNG";
      newPower = "0.0 kW";
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
      setIotDoor("ĐANG ĐÓNG...");
      setIotGear("ĐANG KHÓA NHANH...");
      setIotCharge("KẾT NỐI SẠC");
      setIotPower("0.0 kW");
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
  // BACKEND SYNC — Load real orders from backend
  // ===================================================================
  const syncOrdersFromBackend = useCallback(async () => {
    const orders = await apiFetchOrders();
    if (!orders) return;
    // Map backend orders to CC display format
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

  // Load orders + drones when component mounts
  useEffect(() => {
    syncOrdersFromBackend();
    apiFetchDrones().then(dronesList => {
      if (dronesList && dronesList.length > 0) {
        setAvailableDrones(dronesList);
        // Default select first online drone
        const online = dronesList.find(d => d.status === 'online');
        setSelectedDroneId(String(online ? online._id || online.id : dronesList[0]._id || dronesList[0].id));
      }
    });
    // Poll every 5s for new orders from User Interface
    const interval = setInterval(syncOrdersFromBackend, 5000);
    return () => clearInterval(interval);
  }, [syncOrdersFromBackend]);

  // ===================================================================
  // DISPATCH WORKFLOW
  // ===================================================================
  // Mở panel chuẩn bị đơn hàng
  const prepareOrder = useCallback((order) => {
    setDispatchOrder(order);
    setFlightMinutes(15);
    // Tự chọn drone online đầu tiên
    const online = availableDrones.find(d => d.status === 'online');
    if (online) {
      setSelectedDroneId(String(online._id || online.id));
    }
    playBeep(523.25, 0.15);
  }, [availableDrones, playBeep]);

  // Xác nhận chuẩn bị hàng → đơn hàng chuyển sang 'packaging'
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

  // Take Off → tạo mission + đơn chuyển sang 'departed'
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
    // Cập nhật trạng thái đơn → departed
    const statusRes = await apiUpdateOrderStatus(dispatchOrder._backendId, 'departed', droneId);
    if (statusRes.success) {
      writeToLogCenter("COMMAND", `Đơn ${dispatchOrder.id}: Drone đã cất cánh tới ${destName}.`, "cmd");
    }

    // Vẽ route trên map
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

  const closeDispatchPanel = useCallback(() => {
    setDispatchOrder(null);
  }, []);

  // ===================================================================
  // MISSION CONTROL — General
  // ===================================================================
  const triggerRTL = useCallback(() => {
    const state = stateRef.current;
    if (state === "STANDBY") return;
    setCurrentState("RTL_EMERGENCY");
    const cc = document.querySelector('.command-center');
    if (cc) cc.classList.add('alarm-active');
    setShowDiagnose(true);

    // Sync RTL to backend: cancel inflight orders
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

// Create order in backend (shared with User Interface)
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

  // MAVLink telemetry broadcast
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
  // RENDER HELPERS (use state directly, not refs — to avoid refs-in-render warnings)
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
    if (currentState === "STANDBY") return "ĐANG CHỜ LỆNH";
    if (currentState === "RTL_EMERGENCY") return "HỦY KHẨN CẤP (RTL)";
    return "DỊCH CHUYỂN";
  };

  const renderSqlTable = () => {
    if (!sqlDatabase || sqlDatabase.length === 0) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
            Chưa có đơn hàng. Đơn từ bác sĩ sẽ hiển thị tại đây.
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
          <td><b>{row.id}</b></td>
          <td>{row.doctor}</td>
          <td>{row.item}</td>
          <td>{row.destination}</td>
          <td style={{ fontSize: '9px', color: row.urgency === 'Cấp cứu khẩn' ? 'var(--danger)' : 'var(--text-muted)' }}>
            {row.urgency === 'Cấp cứu khẩn' ? '🚨 ' : ''}{row.urgency}
          </td>
          <td><span className={`cc-pill ${pillClass}`}>{row.status}</span></td>
          <td>
            {isPending ? (
              <button
                className="cc-cmd-btn auto"
                style={{ flex: '0 0 auto', padding: '3px 8px', fontSize: '9px' }}
                onClick={() => prepareOrder(row)}
                disabled={!!isPreparing}
              >
                {isPreparing ? '...' : <><i className="fa-solid fa-box-open"></i> Chuẩn bị</>}
              </button>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>—</span>
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
    return filtered.map((log, i) => {
      let colorClass = '';
      if (log.type === 'sys') colorClass = 'sys';
      if (log.type === 'cmd') colorClass = '';
      if (log.tag.includes('FAIL') || log.tag.includes('KHẨN')) colorClass = 'err';
      return (
        <p key={i}>
          <span className="t">[{log.ts}]</span>{' '}
          <span className={`k ${colorClass}`}>[{log.tag}]</span>{' '}
          <span className="v">{log.msg}</span>
        </p>
      );
    });
  };

  return (
    <div className={`command-center ${currentState === "RTL_EMERGENCY" ? 'alarm-active' : ''}`}>
      {/* Overlays */}
      <div className="cc-scanlines"></div>
      <div className="cc-vignette"></div>
      <div className="cc-alarm-overlay"></div>

      {/* Topbar */}
      <div className="cc-topbar">
        <div className="cc-logo">SAH<span>-TECH</span> // DRONE LOGISTICS COMMAND</div>
        <div className="cc-status-strip">
          <button className="cc-nav-btn" onClick={onBackToFleet}>
            <i className="fa-solid fa-arrow-left"></i> Fleet Dashboard
          </button>
          <button className="cc-audio-control" onClick={toggleAudio}>
            <i className={`fa-solid ${audioEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i> AUDIO: {audioEnabled ? 'ON' : 'OFF'}
          </button>
          <span>
            <span className={`cc-live-dot ${currentState !== "STANDBY" ? 'pink' : ''}`}></span>
            HỆ THỐNG: <b>{getSystemStatus()}</b>
          </span>
          <span>THIẾT BỊ <b>VTOL-K230</b></span>
          <span>{clock}</span>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="cc-dashboard">
        {/* Left Column */}
        <div className="cc-column">
          {/* Map Panel */}
          <div className="cc-panel cc-map-panel">
            <div className="cc-panel-header">
              <div>
                <div className="cc-panel-title">Hệ Thống Kiểm Soát Không Lưu (ATC)</div>
                <div className="cc-panel-subtitle">Theo dõi tọa độ thực tế · Khu vực TP.HCM</div>
              </div>
              <div className="cc-panel-subtitle">{getPhaseText()}</div>
            </div>
            <div className="cc-map-container">
              <div id="cc-map"></div>
              <div className="cc-map-legend">
                <span><i className="cc-dot cyan"></i> Vị trí hiện tại Drone</span>
                <span><i className="cc-dot pink"></i> Trạm Sạc Docker Base 01</span>
                <span><i className="cc-line"></i> Lộ trình bay thiết lập</span>
              </div>
            </div>

            {/* Dispatch Form */}
            <div className="cc-dispatch-form">
              <input
                type="text"
                className="cc-dispatch-input"
                placeholder="Mặt hàng y tế (Ví dụ: Insulin, Máu nhóm A, Vắc-xin COVID)..."
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
              />
              <select className="cc-dispatch-select" value={pkgDest} onChange={(e) => setPkgDest(e.target.value)}>
                <option value="choray">BV Chợ Rẫy (Điểm 1)</option>
                <option value="tudu">BV Từ Dũ (Điểm 2)</option>
                <option value="nhidong">BV Nhi Đồng 1 (Điểm 3)</option>
              </select>
              <button className="cc-cmd-btn auto" style={{ padding: '8px 15px', fontSize: '11px', flex: '0 0 auto' }} onClick={dispatchNewPackage}>
                <i className="fa-solid fa-plus"></i> Tạo Đơn
              </button>
            </div>

            {/* Control Row */}
            <div className="cc-control-row">
              <button className="cc-cmd-btn rtl" onClick={triggerRTL}>
                <i className="fa-solid fa-triangle-exclamation"></i> Khẩn Cấp Quay Về (RTL)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="cc-column cc-column-right">
          {/* HUD Panel */}
          <div className="cc-panel">
            <div className="cc-panel-header">
              <div className="cc-panel-title">Cảm Biến Vật Lý (HUD)</div>
              <div className="cc-panel-subtitle">Chạy luồng: 30Hz</div>
            </div>
            <div className="cc-hud-grid">
              <div className="cc-hud-cell">
                <div className="cc-hud-label">Tốc độ (Speed)</div>
                <div className="cc-hud-value" id="cc-hudSpeed">{droneSpeed.toFixed(1)}<span className="cc-hud-unit">km/h</span></div>
                <canvas className="cc-hud-sparkline" id="cc-sparkline-Speed"></canvas>
              </div>
              <div className="cc-hud-cell">
                <div className="cc-hud-label">Độ cao (Alt)</div>
                <div className="cc-hud-value" id="cc-hudAlt">{droneAlt.toFixed(1)}<span className="cc-hud-unit">m</span></div>
                <canvas className="cc-hud-sparkline" id="cc-sparkline-Alt"></canvas>
              </div>
              <div className="cc-hud-cell">
                <div className="cc-hud-label">Pin (Battery)</div>
                <div className={`cc-hud-value ${droneBattery < 25 ? 'warn' : ''}`} id="cc-hudBatt">{droneBattery.toFixed(1)}<span className="cc-hud-unit">%</span></div>
                <canvas className="cc-hud-sparkline" id="cc-sparkline-Batt"></canvas>
              </div>
            </div>
          </div>

          {/* IoT Dock Panel */}
          <div className="cc-panel">
            <div className="cc-panel-header">
              <div className="cc-panel-title">Trạm Sạc Docker Base IoT</div>
              <div className="cc-panel-subtitle">Mã Node: #DK-01</div>
            </div>
            <div className="cc-dock-monitor">
              <div className="cc-dock-svg-wrap">
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#1F2833" strokeWidth="4" />
                  <path id="cc-svgDoor" d={iotDoor === "ĐÃ MỞ" ? "M 20 20 L 80 20" : "M 20 50 L 80 50"} stroke={iotDoor === "ĐÃ MỞ" ? "#66FCF1" : "#FF007F"} strokeWidth="6" strokeLinecap="round"/>
                  <g id="cc-svgGear" style={iotCharge === "SẠC SIÊU TỐC" ? { animation: 'cc-spin-gear 1s linear infinite', transformOrigin: '50px 50px' } : {}}>
                    <circle cx="50" cy="50" r="10" fill="none" stroke="#66FCF1" strokeWidth="3" strokeDasharray="6,4"/>
                  </g>
                </svg>
              </div>
              <div className="cc-iot-grid">
                <div className="cc-iot-row">
                  <span className="cc-iot-tag">Cửa khoang</span>
                  <span className={`cc-iot-state ${iotDoor === "ĐÃ MỞ" ? 'ok' : iotDoor.includes("ĐANG") ? 'transitioning' : 'lock'}`}>{iotDoor}</span>
                </div>
                <div className="cc-iot-row">
                  <span className="cc-iot-tag">Ngàm khóa cơ</span>
                  <span className={`cc-iot-state ${iotGear === "ĐÃ NHẢ" ? 'ok' : iotGear.includes("ĐANG") ? 'transitioning' : 'lock'}`}>{iotGear}</span>
                </div>
                <div className="cc-iot-row">
                  <span className="cc-iot-tag">Chế độ sạc</span>
                  <span className="cc-iot-state ok">{iotCharge}</span>
                </div>
                <div className="cc-iot-row">
                  <span className="cc-iot-tag">Công suất</span>
                  <span className="cc-iot-state ok">{iotPower}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SQL Table Panel */}
          <div className="cc-panel cc-table-panel">
            <div className="cc-panel-header">
              <div className="cc-panel-title">Lịch Trình Vận Chuyển Core SQL</div>
              <div className="cc-panel-subtitle">Đơn hàng real-time từ bác sĩ (medical_dispatch)</div>
            </div>
            <div className="cc-table-scroll">
              <table className="cc-data-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Bác sĩ</th>
                    <th>Y phẩm</th>
                    <th>Điểm nhận</th>
                    <th>Mức độ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>{renderSqlTable()}</tbody>
              </table>
            </div>
          </div>

          {/* Terminal Panel */}
          <div className="cc-panel cc-terminal-panel">
            <div className="cc-panel-header">
              <div className="cc-panel-title">Hộp Đen Log Viễn Thám (NoSQL)</div>
              <div className="cc-panel-subtitle">Hệ cơ sở dữ liệu Timescale JSON Telemetry</div>
            </div>
            <div className="cc-terminal-filters">
              {['all', 'mav', 'sys', 'cmd'].map((f) => {
                const filterLabel = f === 'all' ? 'Tất cả' : f === 'mav' ? 'MAVLink' : f === 'sys' ? 'Hệ thống' : 'Mệnh lệnh';
                return (
                  <button
                    key={f}
                    className={`cc-filter-btn ${activeLogFilter === f ? 'active' : ''}`}
                    onClick={() => { setActiveLogFilter(f); playBeep(440, 0.08); }}
                  >
                    {filterLabel}
                  </button>
                );
              })}
            </div>
            <div className="cc-terminal">
              {renderLogs()}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DISPATCH PREPARE PANEL (Modal) ===== */}
      {dispatchOrder && (
        <div className="cc-dispatch-overlay" onClick={closeDispatchPanel}>
          <div className="cc-dispatch-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cc-panel-header">
              <div>
                <div className="cc-panel-title">
                  <i className="fa-solid fa-box-open" style={{ marginRight: 6 }}></i>
                  Chuẩn bị đơn hàng — #{dispatchOrder.id}
                </div>
                <div className="cc-panel-subtitle">Từ bác sĩ: {dispatchOrder.doctor}</div>
              </div>
              <button className="cc-nav-btn" onClick={closeDispatchPanel}>
                <i className="fa-solid fa-xmark"></i> Đóng
              </button>
            </div>

            {/* Thông tin y phẩm bác sĩ yêu cầu */}
            <div className="cc-dispatch-info">
              <div className="cc-dispatch-info-row">
                <span className="cc-dispatch-info-label"><i className="fa-solid fa-syringe"></i> Y phẩm</span>
                <span className="cc-dispatch-info-value">{dispatchOrder.item}</span>
              </div>
              <div className="cc-dispatch-info-row">
                <span className="cc-dispatch-info-label"><i className="fa-solid fa-location-dot"></i> Điểm nhận</span>
                <span className="cc-dispatch-info-value">{dispatchOrder.destination}</span>
              </div>
              <div className="cc-dispatch-info-row">
                <span className="cc-dispatch-info-label"><i className="fa-solid fa-triangle-exclamation"></i> Mức độ</span>
                <span className="cc-dispatch-info-value" style={{ color: dispatchOrder.urgency === 'Cấp cứu khẩn' ? 'var(--danger)' : 'var(--text-main)' }}>
                  {dispatchOrder.urgency === 'Cấp cứu khẩn' ? '🚨 ' : '✅ '}{dispatchOrder.urgency}
                </span>
              </div>
              {dispatchOrder.notes && (
                <div className="cc-dispatch-info-row">
                  <span className="cc-dispatch-info-label"><i className="fa-regular fa-note-sticky"></i> Ghi chú</span>
                  <span className="cc-dispatch-info-value">{dispatchOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Chọn drone */}
            <div className="cc-dispatch-field">
              <label className="cc-dispatch-label">Chọn Drone vận chuyển</label>
              <select
                className="cc-dispatch-select"
                style={{ width: '100%' }}
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

            {/* Thời gian bay tới đích */}
            <div className="cc-dispatch-field">
              <label className="cc-dispatch-label">Thời gian bay tới đích (phút)</label>
              <input
                type="number"
                className="cc-dispatch-input"
                style={{ width: '100%' }}
                min={1}
                max={120}
                value={flightMinutes}
                onChange={(e) => setFlightMinutes(Number(e.target.value))}
              />
            </div>

            {/* Buttons */}
            <div className="cc-control-row">
              <button
                className="cc-cmd-btn auto"
                onClick={confirmPrepare}
                disabled={preparingId === dispatchOrder._backendId}
              >
                <i className="fa-solid fa-box"></i> Xác nhận chuẩn bị
              </button>
              <button
                className="cc-cmd-btn auto"
                style={{ borderColor: 'rgba(16,185,129,0.6)' }}
                onClick={takeOff}
                disabled={preparingId === dispatchOrder._backendId}
              >
                <i className="fa-solid fa-rocket"></i> Take Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommandCenter;
