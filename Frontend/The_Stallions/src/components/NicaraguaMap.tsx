import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const MAP_CENTER = '12.87,-85.21';

const leafletHtml = (center: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; overflow: hidden; }
    .leaflet-container { background: #000; }
    .pin-marker { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .pin-marker.no-click { cursor: default; }
    .pin-icon { width: 28px; height: 28px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.7)); }
    .pin-name {
      margin-top: 2px; font-weight: 800; font-size: 10px; color: #fff;
      white-space: nowrap; text-shadow: 0 1px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .nicaragua-title {
      position: absolute; top: 12px; left: 50%; transform: translateX(-50%); z-index: 1000;
      background: linear-gradient(135deg, #0f3460, #16213e); color: #e94560;
      font-weight: 800; font-size: 16px; padding: 8px 24px; border-radius: 20px;
      letter-spacing: 2px; text-transform: uppercase;
      box-shadow: 0 4px 20px rgba(233,69,96,0.4), 0 0 40px rgba(233,69,96,0.15);
      border: 1px solid rgba(233,69,96,0.3); pointer-events: none;
    }
    .nicaragua-title span { color: #ffffff; }

    .nc-leaflet-popup .leaflet-popup-content-wrapper {
      background: transparent !important; box-shadow: none !important;
      border-radius: 0 !important; padding: 0 !important; border: none !important;
    }
    .nc-leaflet-popup .leaflet-popup-content { margin: 0 !important; min-width: auto !important; }
    .nc-leaflet-popup .leaflet-popup-tip { background: #162032 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important; }
    .nc-popup {
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 16px; padding: 14px; width: 240px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(233,69,96,0.2); color: #fff;
    }
    .nc-popup-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nc-popup-logo {
      width: 40px; height: 40px; background: linear-gradient(135deg, #e94560, #0f3460);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0;
    }
    .nc-popup-brand { font-size: 12px; font-weight: 800; color: #e94560; letter-spacing: 0.5px; }
    .nc-popup-sub { font-size: 9px; color: rgba(255,255,255,0.4); margin-top: 1px; }
    .nc-popup-dept { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px; }
    .nc-popup-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
    .nc-popup-coords { font-size: 10px; color: rgba(255,255,255,0.4); margin-bottom: 10px; }
    .nc-popup-desc { font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.45; margin-bottom: 12px; }
    .nc-popup-actions { display: flex; gap: 8px; }
    .nc-btn {
      flex: 1; padding: 10px 12px; border-radius: 12px; border: none;
      font-weight: 700; font-size: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
    }
    .nc-btn-route {
      background: linear-gradient(135deg, #e94560, #c23152); color: #fff;
      box-shadow: 0 4px 12px rgba(233,69,96,0.3);
    }
    .nc-btn-route:hover { transform: translateY(-1px); }
    .nc-btn-nav {
      background: linear-gradient(135deg, #0CA678, #099268); color: #fff;
      box-shadow: 0 4px 12px rgba(12,166,120,0.3); display: none;
    }
    .nc-btn-nav.show { display: flex; }
    .nc-btn-nav:hover { transform: translateY(-1px); }
    .nc-route-info {
      display: none; margin-top: 8px; padding: 8px 10px;
      background: rgba(255,255,255,0.05); border-radius: 10px;
      font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.4;
    }
    .nc-route-info.show { display: block; }
    .nc-route-info strong { color: #e94560; }
    .nc-btn-stop {
      background: linear-gradient(135deg, #e03131, #c92a2a) !important; color: #fff !important;
      box-shadow: 0 4px 12px rgba(224,49,49,0.4) !important; display: none;
    }
    .nc-btn-stop.show { display: flex; }
    .nc-btn-stop:hover { transform: translateY(-1px); }
    .nc-anim-dot {
      width: 20px; height: 20px; border-radius: 50%;
      background: #4DABF7; border: 3px solid #fff;
      box-shadow: 0 0 16px rgba(77,171,247,0.8), 0 0 30px rgba(77,171,247,0.3);
      animation: nc-pulse 1s ease-in-out infinite;
    }
    @keyframes nc-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.25); }
    }
    .nc-toggle {
      position: absolute; top: 55px; left: 50%; transform: translateX(-50%); z-index: 1000;
      display: flex; background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 12px; overflow: hidden;
      border: 1px solid rgba(233,69,96,0.25);
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    .nc-toggle-btn {
      padding: 7px 16px; font-size: 11px; font-weight: 700;
      color: rgba(255,255,255,0.45); background: transparent; border: none;
      cursor: pointer; transition: all 0.25s; letter-spacing: 0.5px;
    }
    .nc-toggle-btn.active {
      background: linear-gradient(135deg, #e94560, #c23152);
      color: #fff; box-shadow: 0 2px 10px rgba(233,69,96,0.3);
    }
    .nc-toggle-btn:hover:not(.active) { color: rgba(255,255,255,0.75); }
    .nc-btn-back {
      background: rgba(255,255,255,0.1); color: #fff; flex: 0 0 auto;
    }
    .nc-btn-back:hover { background: rgba(255,255,255,0.18); transform: translateY(-1px); }
    .nc-logout {
      position: absolute; top: 10px; right: 10px; z-index: 1000;
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #0f1923, #162032);
      border: 1px solid rgba(233,69,96,0.3);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      transition: all 0.2s ease;
    }
    .nc-logout:hover {
      background: linear-gradient(135deg, #e94560, #0f3460);
      border-color: rgba(233,69,96,0.6);
      box-shadow: 0 4px 20px rgba(233,69,96,0.4);
      transform: scale(1.1);
    }
    .nc-logout svg { width: 18px; height: 18px; fill: #fff; }
    .nc-city-dot {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2.5px solid #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.6);
    }
    .nc-city-label {
      margin-top: 3px; font-weight: 700; font-size: 10px; color: #fff;
      white-space: nowrap; text-transform: uppercase; letter-spacing: 0.4px;
      text-shadow: 0 1px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5);
    }
    .nc-city-wrap { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
    .nc-user-gps {
      filter: drop-shadow(0 0 6px rgba(77,171,247,0.7));
      animation: nc-pulse 2s ease-in-out infinite;
    }
    .nc-user-tooltip {
      background: #162032; color: #fff; border: 1px solid rgba(233,69,96,0.3);
      border-radius: 8px; font-size: 10px; font-weight: 700; padding: 4px 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .nc-user-tooltip::before { border-top-color: #162032 !important; }
    .nc-tour-btn {
      background: linear-gradient(135deg, #FCC419, #E8990C); color: #1a1a2e;
      box-shadow: 0 4px 12px rgba(252,196,25,0.3); font-weight: 800;
    }
    .nc-tour-btn:hover { transform: translateY(-1px); }
    .nc-tour-panel {
      position: absolute; bottom: 16px; right: 16px; z-index: 1000;
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 16px; width: 300px; max-height: 420px; overflow: hidden;
      border: 1px solid rgba(233,69,96,0.25);
      box-shadow: 0 8px 30px rgba(0,0,0,0.6);
      transform: translateY(120%); transition: transform 0.35s ease;
      display: flex; flex-direction: column;
    }
    .nc-tour-panel.show { transform: translateY(0); }
    .nc-tour-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px 8px; border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .nc-tour-title { font-size: 12px; font-weight: 800; color: #fff; }
    .nc-tour-close {
      background: rgba(255,255,255,0.1); border: none; color: #fff;
      width: 26px; height: 26px; border-radius: 50%; font-size: 15px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .nc-tour-close:hover { background: rgba(255,255,255,0.2); }
    .nc-tour-img-lg {
      width: 100%; height: 140px; object-fit: cover;
      background: rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .nc-tour-stop-view { padding: 10px 14px 6px; flex: 1; overflow-y: auto; }
    .nc-tour-num {
      font-size: 9px; font-weight: 800; color: #e94560;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;
    }
    .nc-tour-name { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .nc-tour-desc { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.45; }
    .nc-tour-nav-row {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 6px 14px; flex-shrink: 0;
    }
    .nc-tour-nav-btn {
      width: 30px; height: 30px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.1); color: #fff; font-size: 18px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s; flex-shrink: 0;
    }
    .nc-tour-nav-btn:hover { background: rgba(233,69,96,0.4); }
    .nc-tour-nav-btn:disabled { opacity: 0.3; cursor: default; }
    .nc-tour-dots {
      display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; flex: 1;
    }
    .nc-tour-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(255,255,255,0.2); transition: background 0.3s;
    }
    .nc-tour-dot.active { background: #e94560; }
    .nc-tour-actions {
      padding: 8px 14px 10px; border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; gap: 8px; flex-shrink: 0;
    }
    .nc-tour-start {
      flex: 1; padding: 9px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 11px; cursor: pointer;
      background: linear-gradient(135deg, #e94560, #c23152); color: #fff;
      box-shadow: 0 4px 12px rgba(233,69,96,0.3);
      transition: all 0.2s;
    }
    .nc-tour-start:hover { transform: translateY(-1px); }
    .nc-tour-stop-btn {
      flex: 1; padding: 9px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 11px; cursor: pointer;
      background: linear-gradient(135deg, #e03131, #c92a2a); color: #fff;
      box-shadow: 0 4px 12px rgba(224,49,49,0.4);
      transition: all 0.2s; display: none;
    }
    .nc-tour-stop-btn.show { display: block; }
    .nc-tour-back-btn {
      flex: 0 0 auto; padding: 9px 14px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 11px; cursor: pointer;
      background: rgba(255,255,255,0.1); color: #fff;
      transition: all 0.2s;
    }
    .nc-tour-back-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-1px); }
    .nc-tour-marker {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 50%; color: #fff;
      font-weight: 900; font-size: 13px; border: 2.5px solid #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
      overflow: hidden; background: #333;
    }
    .nc-tour-marker img {
      width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
    }
    .nc-tour-popup .leaflet-popup-content-wrapper {
      background: #0f1923 !important; border-radius: 14px !important;
      box-shadow: 0 6px 24px rgba(0,0,0,0.6) !important; border: 1px solid rgba(233,69,96,0.25) !important;
      padding: 0 !important;
    }
    .nc-tour-popup .leaflet-popup-content { margin: 0 !important; min-width: auto !important; }
    .nc-tour-popup .leaflet-popup-tip { background: #0f1923 !important; }
    .nc-tp-inner { width: 200px; overflow: hidden; }
    .nc-tp-img { width: 100%; height: 110px; object-fit: cover; }
    .nc-tp-body { padding: 10px 12px; }
    .nc-tp-num { font-size: 9px; font-weight: 800; color: #e94560; text-transform: uppercase; letter-spacing: 0.5px; }
    .nc-tp-name { font-size: 13px; font-weight: 800; color: #fff; margin: 2px 0 4px; }
    .nc-tp-desc { font-size: 10px; color: rgba(255,255,255,0.5); line-height: 1.4; }
    @media (max-width: 480px) {
      .nc-tour-panel { width: calc(100% - 24px); bottom: 12px; right: 12px; left: 12px; max-height: 50vh; }
      .nc-tour-img-lg { height: 110px; }
      .nicaragua-title { font-size: 13px; padding: 6px 16px; }
      .nc-toggle { top: 48px; }
      .nc-toggle-btn { padding: 6px 12px; font-size: 10px; }
      .nc-popup { width: 220px; }
      .nc-loc-box { width: 220px; }
      .nc-tp-inner { width: 180px; }
    }
    @media (min-width: 481px) and (max-width: 768px) {
      .nc-tour-panel { width: 280px; }
    }
    .nc-loc-popup .leaflet-popup-content-wrapper {
      background: transparent !important; box-shadow: none !important;
      border-radius: 0 !important; padding: 0 !important; border: none !important;
    }
    .nc-loc-popup .leaflet-popup-content { margin: 0 !important; min-width: auto !important; }
    .nc-loc-popup .leaflet-popup-tip { background: #162032 !important; }
    .nc-loc-box {
      background: linear-gradient(135deg, #0f1923, #162032);
      border-radius: 14px; padding: 14px; width: 250px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(77,171,247,0.3); color: #fff;
    }
    .nc-loc-icon { font-size: 22px; margin-bottom: 6px; }
    .nc-loc-title { font-size: 13px; font-weight: 800; color: #4DABF7; margin-bottom: 4px; }
    .nc-loc-dept { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 6px; }
    .nc-loc-msg { font-size: 11px; color: rgba(255,255,255,0.55); line-height: 1.4; margin-bottom: 10px; }
    .nc-loc-btn {
      width: 100%; padding: 10px; border-radius: 10px; border: none;
      font-weight: 800; font-size: 12px; cursor: pointer; text-align: center;
      background: linear-gradient(135deg, #FCC419, #E8990C); color: #1a1a2e;
      box-shadow: 0 4px 12px rgba(252,196,25,0.3);
      transition: all 0.2s;
    }
    .nc-loc-btn:hover { transform: translateY(-1px); }
    .nc-loc-btn-gray {
      background: rgba(255,255,255,0.1); color: #fff;
      box-shadow: none; margin-top: 6px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="nicaragua-title"><span>Nicaragua</span></div>
  <div class="nc-toggle">
    <button class="nc-toggle-btn active" id="tog-geo" onclick="switchToGeographic()">Geografica</button>
    <button class="nc-toggle-btn" id="tog-city" onclick="switchToRelieve()">Vector Map</button>
  </div>
  <div class="nc-logout" id="nc-logout" title="Cerrar sesion" onclick="sendLogout()">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
  </div>
  <div class="nc-tour-panel" id="tour-panel">
    <div class="nc-tour-header">
      <div class="nc-tour-title" id="tour-title">Ruta Turistica</div>
      <button class="nc-tour-close" id="tour-close">&times;</button>
    </div>
    <img class="nc-tour-img-lg" id="tour-img" src="" alt="" />
    <div class="nc-tour-stop-view" id="tour-stop-view">
      <div class="nc-tour-num" id="tour-num">Parada 1 de 10</div>
      <div class="nc-tour-name" id="tour-stop-name">-</div>
      <div class="nc-tour-desc" id="tour-stop-desc">-</div>
    </div>
    <div class="nc-tour-nav-row">
      <button class="nc-tour-nav-btn" id="tour-prev">&lsaquo;</button>
      <div class="nc-tour-dots" id="tour-dots"></div>
      <button class="nc-tour-nav-btn" id="tour-next">&rsaquo;</button>
    </div>
    <div class="nc-tour-actions">
      <button class="nc-tour-start" id="tour-start">Recorrer Ruta</button>
      <button class="nc-tour-stop-btn" id="tour-stop-btn">Detener</button>
      <button class="nc-tour-back-btn" id="tour-back">Regresar</button>
    </div>
  </div>
  <script>
    var map = L.map('map', {
      center: [${center}],
      zoom: 8,
      zoomControl: false,
      attributionControl: false
    });

    var satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);
    var hillLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, opacity: 0.35
    }).addTo(map);
    var labelsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd', pane: 'overlayPane'
    }).addTo(map);
    var geoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd'
    });
    var vectorLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd'
    });
    var vectorLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd', pane: 'overlayPane'
    });
    var currentMode = 'satellite';
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    var COLOR = '#6c7a89';
    var departamentos = [
      { name: 'Boaco', file: 'boaco', color: COLOR, highlighted: false, capital: 'Boaco', cLat: 11.5021, cLng: -85.6287 },
      { name: 'Carazo', file: 'carazo', color: COLOR, highlighted: false, capital: 'Jinotepe', cLat: 11.8496, cLng: -86.1993 },
      { name: 'Chinandega', file: 'chinandega', color: COLOR, highlighted: false, capital: 'Chinandega', cLat: 12.6294, cLng: -87.1314 },
      { name: 'Chontales', file: 'chontales', color: '#FFA94D', highlighted: true, capital: 'Juigalpa', cLat: 12.1063, cLng: -85.3645 },
      { name: 'Esteli', file: 'esteli', color: '#CC5DE8', highlighted: true, capital: 'Esteli', cLat: 13.0918, cLng: -86.3541 },
      { name: 'Granada', file: 'granada', color: '#20C997', highlighted: true, capital: 'Granada', cLat: 11.9344, cLng: -85.9561 },
      { name: 'Jinotega', file: 'jinotega', color: COLOR, highlighted: false, capital: 'Jinotega', cLat: 13.0883, cLng: -86.0022 },
      { name: 'Leon', file: 'leon', color: '#4DABF7', highlighted: true, capital: 'Leon', cLat: 12.4358, cLng: -86.8780 },
      { name: 'Madriz', file: 'madriz', color: COLOR, highlighted: false, capital: 'Somoto', cLat: 13.4814, cLng: -86.5822 },
      { name: 'Managua', file: 'managua', color: '#E64980', highlighted: true, capital: 'Managua', cLat: 12.1150, cLng: -86.2362 },
      { name: 'Masaya', file: 'masaya', color: '#FCC419', highlighted: true, capital: 'Masaya', cLat: 11.9731, cLng: -86.0950 },
      { name: 'Matagalpa', file: 'matagalpa', color: '#38D9A9', highlighted: true, capital: 'Matagalpa', cLat: 12.9256, cLng: -85.9178 },
      { name: 'Nueva Segovia', file: 'nueva-segovia', color: COLOR, highlighted: false, capital: 'Ocotal', cLat: 13.6321, cLng: -86.4756 },
      { name: 'RACCN', file: 'raan', color: COLOR, highlighted: false, capital: 'Bilwi', cLat: 14.0269, cLng: -83.3808 },
      { name: 'RACCS', file: 'raas', color: '#0CA678', highlighted: true, capital: 'Bluefields', cLat: 12.0132, cLng: -83.7637 },
      { name: 'Rio San Juan', file: 'rio-san-juan', color: COLOR, highlighted: false, capital: 'San Carlos', cLat: 11.1236, cLng: -84.7960 },
      { name: 'Rivas', file: 'rivas', color: COLOR, highlighted: false, capital: 'Rivas', cLat: 11.4360, cLng: -85.8265 }
    ];

    function makePinSvg(hex) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" class="pin-icon">' +
        '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="' + hex + '"/>' +
        '<circle cx="12" cy="11" r="5" fill="rgba(255,255,255,0.85)"/></svg>';
    }

    function getCentroid(ll) {
      var lat = 0, lng = 0;
      for (var i = 0; i < ll.length; i++) { lat += ll[i][0]; lng += ll[i][1]; }
      return L.latLng(lat / ll.length, lng / ll.length);
    }

    var currentDep = null;
    var currentCenter = null;
    var routeLine = null;
    var userMarker = null;
    var routeCoords = null;
    var animMarker = null;
    var animTimer = null;
    var animIndex = 0;
    var userLat = null;
    var userLng = null;
    var userLocMarker = null;
    var allPolys = {};
    var allMarkers = {};
    var allPins = {};
    var focusedDep = null;
    var colorsHidden = false;
    var userDepName = null;

    function pointInPoly(lat, lng, ring) {
      var inside = false;
      for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var xi = ring[i][0], yi = ring[i][1];
        var xj = ring[j][0], yj = ring[j][1];
        var intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }

    function findUserDepartment(lat, lng) {
      for (var d = 0; d < departamentos.length; d++) {
        var dep = departamentos[d];
        var polys = allPolys[dep.name];
        if (!polys) continue;
        for (var p = 0; p < polys.length; p++) {
          var ll = polys[p].getLatLngs();
          var rings = Array.isArray(ll[0]) ? ll[0] : ll;
          if (Array.isArray(rings[0]) && Array.isArray(rings[0][0])) {
            for (var r = 0; r < rings.length; r++) {
              var ring = rings[r].map(function(pt) { return [pt.lat, pt.lng]; });
              if (pointInPoly(lat, lng, ring)) return dep;
            }
          } else {
            var ring = rings.map(function(pt) { return [pt.lat, pt.lng]; });
            if (pointInPoly(lat, lng, ring)) return dep;
          }
        }
      }
      return null;
    }

    function sendLogout() {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage('logout');
      } else if (window.parent) {
        window.parent.postMessage('logout', '*');
      }
    }

    function getUsersLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          setUserLocation(pos.coords.latitude, pos.coords.longitude);
        }, function() {}, { enableHighAccuracy: true, timeout: 10000 });
      }
    }

    document.addEventListener('message', function(e) {
      if (!e.data) return;
      try {
        var msg = JSON.parse(e.data);
        if (msg && msg.type === 'location' && typeof msg.lat === 'number' && typeof msg.lng === 'number') {
          setUserLocation(msg.lat, msg.lng);
        }
      } catch (err) {}
    });

    function setUserLocation(lat, lng) {
      userLat = lat;
      userLng = lng;
      if (!userLocMarker) {
        userLocMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: '',
            html: '<div class="nc-user-gps"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="10" stroke="#4DABF7" stroke-width="2" fill="rgba(77,171,247,0.12)"/><circle cx="14" cy="14" r="4" fill="#4DABF7"/><line x1="14" y1="0" x2="14" y2="6" stroke="#4DABF7" stroke-width="2"/><line x1="14" y1="22" x2="14" y2="28" stroke="#4DABF7" stroke-width="2"/><line x1="0" y1="14" x2="6" y2="14" stroke="#4DABF7" stroke-width="2"/><line x1="22" y1="14" x2="28" y2="14" stroke="#4DABF7" stroke-width="2"/></svg></div>',
            iconSize: [28, 28], iconAnchor: [14, 14]
          }),
          zIndexOffset: 500
        }).addTo(map);
        userLocMarker.bindTooltip('Tu ubicacion', {
          permanent: false, direction: 'top',
          className: 'nc-user-tooltip'
        });
        userLocMarker.on('click', function() {
          var found = findUserDepartment(userLat, userLng);
          if (found) {
            userDepName = found.name;
            var html = '<div class="nc-loc-box">' +
              '<div class="nc-loc-icon">&#128205;</div>' +
              '<div class="nc-loc-title">Tu ubicacion actual</div>' +
              '<div class="nc-loc-dept">' + found.name + '</div>' +
              '<p class="nc-loc-msg">Estas dentro del departamento de <strong>' + found.name + '</strong>.' +
              (found.highlighted ? ' Descubre los atractivos turisticos de esta region con una ruta personalizada.' : ' Explora las rutas turisticas disponibles para ti.') + '</p>' +
              (found.highlighted ? '<button class="nc-loc-btn" id="loc-tour-btn">Explorar Ruta Turistica</button>' : '') +
              '<button class="nc-loc-btn nc-loc-btn-gray" id="loc-close-btn">Cerrar</button>' +
            '</div>';
            L.popup({ closeButton: false, className: 'nc-loc-popup', offset: [0, -18], maxWidth: 270 })
              .setLatLng([userLat, userLng])
              .setContent(html)
              .openOn(map);
            setTimeout(function() {
              var tb = document.getElementById('loc-tour-btn');
              var cb = document.getElementById('loc-close-btn');
              if (tb) tb.onclick = function() { map.closePopup(); showTourismRoute(found.name); };
              if (cb) cb.onclick = function() { map.closePopup(); };
            }, 50);
          }
        });
      } else {
        userLocMarker.setLatLng([lat, lng]);
      }
      var found = findUserDepartment(lat, lng);
      if (found) { userDepName = found.name; }
    }
    getUsersLocation();

    function restorePolyColors() {
      if (!colorsHidden) return;
      colorsHidden = false;
      var z = map.getZoom();
      departamentos.forEach(function(dep) {
        var polys = allPolys[dep.name];
        if (!polys) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        if (z >= 10) {
          baseFill = Math.max(0.04, baseFill * 0.15);
        } else if (z >= 9) {
          baseFill = baseFill * 0.5;
        }
        polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, opacity: dep.highlighted ? 0.9 : 0.6 }); });
      });
    }

    function hidePolyColors() {
      if (colorsHidden) return;
      colorsHidden = true;
      departamentos.forEach(function(dep) {
        var polys = allPolys[dep.name];
        if (!polys) return;
        polys.forEach(function(p) { p.setStyle({ fillOpacity: 0.03, opacity: 0.08 }); });
      });
    }

    function clearRoute() {
      if (animTimer) { clearInterval(animTimer); animTimer = null; }
      if (animMarker) { map.removeLayer(animMarker); animMarker = null; }
      if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
      if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
      routeCoords = null;
      animIndex = 0;
      modeLocked = false;
      var nb = document.getElementById('pop-nav');
      if (nb) { nb.textContent = 'Iniciar Ruta'; nb.className = 'nc-btn nc-btn-nav show'; }
    }

    function focusDepartment(depName) {
      focusedDep = depName;
      departamentos.forEach(function(dep) {
        var polys = allPolys[dep.name];
        var pin = allPins[dep.name];
        if (!polys) return;
        if (dep.name === depName) {
          polys.forEach(function(p) { p.setStyle({ fillOpacity: 0.18, weight: 2.5, opacity: 0.55 }); p.bringToFront(); });
          if (pin) pin.setOpacity(1);
        } else {
          polys.forEach(function(p) { p.setStyle({ fillOpacity: 0.01, weight: 0.5, opacity: 0.06 }); });
          if (pin) pin.setOpacity(0);
        }
      });
    }

    function unfocusAll() {
      focusedDep = null;
      var z = map.getZoom();
      departamentos.forEach(function(dep) {
        var polys = allPolys[dep.name];
        var pin = allPins[dep.name];
        if (!polys) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        if (z >= 10) {
          baseFill = Math.max(0.04, baseFill * 0.15);
        } else if (z >= 9) {
          baseFill = baseFill * 0.5;
        }
        polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, weight: dep.highlighted ? 2.5 : 1.5, opacity: dep.highlighted ? 0.9 : 0.6 }); });
        if (pin) pin.setOpacity(1);
      });
      map.setView([${center}], 8);
    }

    function switchToRelieve() {
      currentMode = 'relieve';
      if (map.hasLayer(satLayer)) map.removeLayer(satLayer);
      if (map.hasLayer(hillLayer)) map.removeLayer(hillLayer);
      if (map.hasLayer(labelsLayer)) map.removeLayer(labelsLayer);
      vectorLayer.addTo(map);
      vectorLabels.addTo(map);
      departamentos.forEach(function(dep) {
        var polys = allPolys[dep.name];
        var pin = allPins[dep.name];
        if (!polys) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, opacity: dep.highlighted ? 0.9 : 0.6 }); });
        if (pin) pin.setOpacity(1);
      });
      document.getElementById('tog-geo').classList.remove('active');
      document.getElementById('tog-city').classList.add('active');
    }

    function switchToGeographic() {
      currentMode = 'satellite';
      if (map.hasLayer(vectorLayer)) map.removeLayer(vectorLayer);
      if (map.hasLayer(vectorLabels)) map.removeLayer(vectorLabels);
      satLayer.addTo(map);
      hillLayer.addTo(map);
      labelsLayer.addTo(map);
      departamentos.forEach(function(dep) {
        var polys = allPolys[dep.name];
        var pin = allPins[dep.name];
        if (!polys) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, opacity: dep.highlighted ? 0.9 : 0.6 }); });
        if (pin) pin.setOpacity(1);
      });
      document.getElementById('tog-city').classList.remove('active');
      document.getElementById('tog-geo').classList.add('active');
    }

    function openPopup(dep, latLng) {
      if (modeLocked) return;
      clearRoute();
      currentDep = dep;
      currentCenter = latLng;
      focusDepartment(dep.name);
      var isHere = userDepName === dep.name;
      var html = '<div class="nc-popup">' +
        '<div class="nc-popup-header">' +
          '<div class="nc-popup-logo">NC</div>' +
          '<div><div class="nc-popup-brand">Nicaragua Creativa</div>' +
          '<div class="nc-popup-sub">Explora nuestro pais</div></div>' +
        '</div>' +
        '<div class="nc-popup-dept"><span class="nc-popup-dot" style="background:' + dep.color + ';"></span>' + dep.name + '</div>' +
        '<div class="nc-popup-coords">' + latLng.lat.toFixed(4) + ', ' + latLng.lng.toFixed(4) + '</div>' +
        (isHere
          ? '<p class="nc-popup-desc">Estas en el departamento de <strong>' + dep.name + '</strong>. ' +
            (tourismData[dep.name] ? 'Explora los atractivos turisticos de tu region con una ruta personalizada.' : 'Disfruta de tu estancia.') + '</p>'
          : '<p class="nc-popup-desc">Descubre los atractivos turisticos, cultura y naturaleza de ' + dep.name + ', una de las regiones destacadas de Nicaragua.</p>'
        ) +
        (isHere
          ? '<div class="nc-popup-actions">' +
            (tourismData[dep.name] ? '<button class="nc-btn nc-tour-btn" id="pop-tour">Explorar Ruta Turistica</button>' : '') +
            '<button class="nc-btn nc-btn-back" id="pop-back">Regresar</button>' +
          '</div>'
          : '<div class="nc-popup-actions">' +
            '<button class="nc-btn nc-btn-route" id="pop-route">Ver Ruta</button>' +
            '<button class="nc-btn nc-btn-nav" id="pop-nav">Iniciar Ruta</button>' +
            '<button class="nc-btn nc-btn-back" id="pop-back">Regresar</button>' +
          '</div>' +
          (tourismData[dep.name] ? '<div class="nc-popup-actions" style="margin-top:6px;">' +
            '<button class="nc-btn nc-tour-btn" id="pop-tour">Ruta Turistica</button>' +
          '</div>' : '')
        ) +
        '<div class="nc-route-info" id="pop-info"></div>' +
      '</div>';
      L.popup({ closeButton: false, className: 'nc-leaflet-popup', offset: [0, -20], maxWidth: 260 })
        .setLatLng(latLng)
        .setContent(html)
        .openOn(map);
      setTimeout(function() {
        var rb = document.getElementById('pop-route');
        var nb = document.getElementById('pop-nav');
        var bb = document.getElementById('pop-back');
        var tb = document.getElementById('pop-tour');
        if (rb) rb.onclick = function() {
          clearTimeout(popupTimer);
          if (tb) tb.parentElement.style.display = 'none';
          showRoute();
        };
        if (bb) bb.onclick = function() {
          clearTimeout(popupTimer);
          map.closePopup(); unfocusAll(); clearRoute(); clearTourism();
          map.setView([${center}], 8);
        };
        if (tb) tb.onclick = function() {
          clearTimeout(popupTimer);
          if (rb) rb.parentElement.style.display = 'none';
          if (nb) nb.style.display = 'none';
          showTourismRoute(dep.name);
        };
        if (nb) nb.onclick = function() {
          clearTimeout(popupTimer);
          if (animTimer) {
            clearInterval(animTimer); animTimer = null;
            if (animMarker) { map.removeLayer(animMarker); animMarker = null; }
            nb.textContent = 'Iniciar Ruta';
            nb.className = 'nc-btn nc-btn-nav show';
          } else {
            startNavigation();
          }
        };
        popupTimer = setTimeout(function() {
          map.closePopup();
          unfocusAll();
          clearRoute();
          clearTourism();
          map.setView([${center}], 8);
        }, 10000);
      }, 50);
    }

    function showRoute() {
      if (!currentCenter) return;
      focusedDep = null;
      if (!userLat || !userLng) {
        getUsersLocation();
        var info = document.getElementById('pop-info');
        if (info) { info.className = 'nc-route-info show'; info.innerHTML = 'Obteniendo ubicacion... intenta de nuevo.'; }
        return;
      }
      if (userDepName && currentDep && userDepName === currentDep.name) {
        var info = document.getElementById('pop-info');
        var rb = document.getElementById('pop-route');
        if (rb) rb.style.display = 'none';
        if (info) {
          info.className = 'nc-route-info show';
          info.innerHTML = '<strong>Ya estas en ' + currentDep.name + '.</strong> ' +
            (tourismData[currentDep.name] ? 'Explora la ruta turistica de esta region.' : 'Disfruta de tu estancia.');
        }
        return;
      }
      modeLocked = true;
      if (routeLine) { map.removeLayer(routeLine); }

      var url = 'https://router.project-osrm.org/route/v1/driving/' +
        userLng + ',' + userLat + ';' + currentCenter.lng + ',' + currentCenter.lat +
        '?overview=full&geometries=geojson';

      fetch(url).then(function(r) { return r.json(); }).then(function(data) {
        if (!data.routes || !data.routes.length) {
          routeCoords = [[userLat, userLng], [currentCenter.lat, currentCenter.lng]];
          routeLine = L.polyline(routeCoords, { color: '#e94560', weight: 4, opacity: 0.9 }).addTo(map);
          var dist = map.distance([userLat, userLng], [currentCenter.lat, currentCenter.lng]);
          showRouteInfo((dist / 1000).toFixed(1), '--');
          return;
        }
        var route = data.routes[0];
        var coords = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
        routeCoords = [[userLat, userLng]].concat(coords).concat([[currentCenter.lat, currentCenter.lng]]);
        routeLine = L.polyline(coords, { color: '#e94560', weight: 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(map);

        userMarker = L.marker([userLat, userLng], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;background:#4DABF7;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
            iconSize: [16, 16], iconAnchor: [8, 8]
          })
        }).addTo(map);

        var km = (route.distance / 1000).toFixed(1);
        var min = Math.round(route.duration / 60);
        showRouteInfo(km, min);
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      }).catch(function() {
        routeCoords = [[userLat, userLng], [currentCenter.lat, currentCenter.lng]];
        routeLine = L.polyline(routeCoords, { color: '#e94560', weight: 4, opacity: 0.9 }).addTo(map);
        var dist = map.distance([userLat, userLng], [currentCenter.lat, currentCenter.lng]);
        showRouteInfo((dist / 1000).toFixed(1), '--');
      });
    }

    function showRouteInfo(km, min) {
      var info = document.getElementById('pop-info');
      var rb = document.getElementById('pop-route');
      var nb = document.getElementById('pop-nav');
      var tb = document.getElementById('pop-tour');
      if (info) { info.className = 'nc-route-info show'; info.innerHTML = '<strong>' + km + ' km</strong>' + (min !== '--' ? ' - ~' + min + ' min' : '') + ' hasta ' + currentDep.name; }
      if (rb) rb.style.display = 'none';
      if (tb) tb.parentElement.style.display = 'none';
      if (nb) nb.className = 'nc-btn nc-btn-nav show';
    }

    function startNavigation() {
      if (!routeCoords || routeCoords.length < 2) return;
      if (animTimer) { clearInterval(animTimer); animTimer = null; }
      if (animMarker) { map.removeLayer(animMarker); animMarker = null; }
      animIndex = 0;

      var dotIcon = L.divIcon({
        className: '',
        html: '<div class="nc-anim-dot"></div>',
        iconSize: [20, 20], iconAnchor: [10, 10]
      });

      animMarker = L.marker(routeCoords[0], { icon: dotIcon, zIndexOffset: 1000 }).addTo(map);
      map.setView(routeCoords[0], Math.max(map.getZoom(), 11));

      var nb = document.getElementById('pop-nav');
      if (nb) { nb.textContent = 'Detener'; nb.className = 'nc-btn nc-btn-stop show'; }

      animTimer = setInterval(function() {
        animIndex++;
        if (animIndex >= routeCoords.length) {
          clearInterval(animTimer); animTimer = null;
          if (nb) { nb.textContent = 'Iniciar Ruta'; nb.className = 'nc-btn nc-btn-nav show'; }
          return;
        }
        animMarker.setLatLng(routeCoords[animIndex]);
        map.panTo(routeCoords[animIndex], { animate: true, duration: 0.18 });
      }, 200);
    }

    var tourismData = {
      'Chontales': [
        { name: 'Lago de Apanas', desc: 'El lago mas grande de Nicaragua, ideal para pesca deportiva y observacion de aves.', img: 'https://picsum.photos/seed/apanas/400/250', lat: 12.2415, lng: -85.4850 },
        { name: 'Juigalpa Centro', desc: 'Centro historico con arquitectura colonial, mercado municipal y vida local.', img: 'https://picsum.photos/seed/juigalpa/400/250', lat: 12.1063, lng: -85.3645 },
        { name: 'Cerro Mombachito', desc: 'Mirador natural con vista panoramica del valle de Chontales.', img: 'https://picsum.photos/seed/mombachito/400/250', lat: 12.0850, lng: -85.3900 },
        { name: 'Museo Antropologico', desc: 'Coleccion de idols precolombinos y artefactos culturales chontale\u00f1os.', img: 'https://picsum.photos/seed/museochontales/400/250', lat: 12.1090, lng: -85.3620 },
        { name: 'San Lorenzo', desc: 'Pueblo tranquilo con iglesia historica y tradicion ganadera.', img: 'https://picsum.photos/seed/sanlorenzoc/400/250', lat: 12.1300, lng: -85.4400 },
        { name: 'Comalapa', desc: 'Municipio agricola con paisajes verdes y comunidades ancestrales.', img: 'https://picsum.photos/seed/comalapa/400/250', lat: 12.0450, lng: -85.3600 },
        { name: 'Cuapa', desc: 'Lugar de la aparicion mariana, santuario religioso con devocion popular.', img: 'https://picsum.photos/seed/cuapa/400/250', lat: 12.1100, lng: -85.2600 },
        { name: 'Villa El Carmen', desc: 'Pueblo pintoresco con tradiciones religiosas y artesania local.', img: 'https://picsum.photos/seed/villaelcarmen/400/250', lat: 12.1400, lng: -85.3200 },
        { name: 'El Rama', desc: 'Puerta fluvial hacia la Costa Caribe, rodeado de rios y bosques tropicales.', img: 'https://picsum.photos/seed/elrama/400/250', lat: 12.0900, lng: -84.9500 },
        { name: 'Acoyapa', desc: 'Municipio colonial con lagos artificiales y arquitectura Republican.', img: 'https://picsum.photos/seed/acoyapa/400/250', lat: 11.9700, lng: -85.1700 },
        { name: 'La Libertad', desc: 'Ciudad en las faldas del volcan Mombacho con cafe de altura.', img: 'https://picsum.photos/seed/lalibertadc/400/250', lat: 12.1900, lng: -85.3800 }
      ],
      'Esteli': [
        { name: 'Cascada Tisey', desc: 'Cascada natural enclavada en la monta\u00f1a con agua cristalina y vegetacion exuberante.', img: 'https://picsum.photos/seed/tisey/400/250', lat: 13.1300, lng: -86.3200 },
        { name: 'Canon de Somoto', desc: 'Garganta geologica formada por el rio Coco, perfecta para rappel y natacion.', img: 'https://picsum.photos/seed/somoto/400/250', lat: 13.0433, lng: -86.5822 },
        { name: 'Reserva Miraflor', desc: 'Bosque nuboso con orquideas, colibries y senderos ecologicos.', img: 'https://picsum.photos/seed/miraflor/400/250', lat: 13.0550, lng: -86.3100 },
        { name: 'Piedra Pintada', desc: 'Petroglifos precolombinos grabados en rocas volcanicas de mas de 3000 anos.', img: 'https://picsum.photos/seed/piedrapintada/400/250', lat: 13.0700, lng: -86.3700 },
        { name: 'Esteli Centro', desc: 'Ciudad conocida como La Paris de Centro America por su clima y cultura.', img: 'https://picsum.photos/seed/esticentro/400/250', lat: 13.0918, lng: -86.3541 },
        { name: 'La Estanzuela', desc: 'Parque natural con cascadas, senderos y zona de recreacion familiar.', img: 'https://picsum.photos/seed/estanzuela/400/250', lat: 13.1000, lng: -86.3800 },
        { name: 'Monumento a la Paz', desc: 'Obra escultorica que celebra la paz en un mirador con vista a la ciudad.', img: 'https://picsum.photos/seed/monumentopaz/400/250', lat: 13.0850, lng: -86.3500 },
        { name: 'Pueblo Nuevo', desc: 'Municipio cafetalero con senderos ecologicos y cascadas escondidas.', img: 'https://picsum.photos/seed/pueblonuevo/400/250', lat: 13.0600, lng: -86.2500 },
        { name: 'Condega', desc: 'Ciudad minera con historia de la revolucion y paisajes montanosos.', img: 'https://picsum.photos/seed/condega/400/250', lat: 13.2100, lng: -86.5300 },
        { name: 'Jalapa', desc: 'Frontera con Honduras, tierra de cafe y tradiciones ancestrales.', img: 'https://picsum.photos/seed/jalapa/400/250', lat: 13.2700, lng: -86.6000 },
        { name: 'San Nicolas', desc: 'Municipio cafeicultor con vistas al canon de Somoto.', img: 'https://picsum.photos/seed/sannicolas/400/250', lat: 13.1800, lng: -86.4200 }
      ],
      'Granada': [
        { name: 'Catedral de Granada', desc: 'Iglesia colonial del siglo XVI, el edificio mas fotografado de la ciudad.', img: 'https://picsum.photos/seed/catedralgranada/400/250', lat: 11.9344, lng: -85.9561 },
        { name: 'Isletas de Granada', desc: '365 islas en el lago Cocibolca, muchas con casas y restaurantes.', img: 'https://picsum.photos/seed/isletas/400/250', lat: 11.9100, lng: -85.9300 },
        { name: 'Mirador de la Cruz', desc: 'Vista 360 grados de la ciudad colonial y el volcan Mombacho.', img: 'https://picsum.photos/seed/miradorcruz/400/250', lat: 11.9330, lng: -85.9580 },
        { name: 'Volcan Mombacho', desc: 'Volcan dormant con senderos de nubes y flora unica endemica.', img: 'https://picsum.photos/seed/mombacho/400/250', lat: 11.8350, lng: -85.9700 },
        { name: 'Plaza de la Cultura', desc: 'Parque central con museos, artesanos y la vida nocturna de Granada.', img: 'https://picsum.photos/seed/plazagranada/400/250', lat: 11.9340, lng: -85.9550 },
        { name: 'La Merced', desc: 'Templo colonial con campanario de 54 metros y vista al lago.', img: 'https://picsum.photos/seed/lamerced/400/250', lat: 11.9350, lng: -85.9570 },
        { name: 'Convento San Francisco', desc: 'Museo arqueologico con la Diosa de Tepetate y arte colonial.', img: 'https://picsum.photos/seed/sanfrancisco/400/250', lat: 11.9310, lng: -85.9520 },
        { name: 'El Calvario', desc: 'Iglesia en la cuesta con escalinatas historicas y vista panoramica.', img: 'https://picsum.photos/seed/elcalvario/400/250', lat: 11.9260, lng: -85.9580 },
        { name: 'Guatapoa', desc: 'Mirador natural con vista al lago y las isletas de Granada.', img: 'https://picsum.photos/seed/guatapoa/400/250', lat: 11.9200, lng: -85.9400 },
        { name: 'Nandaime', desc: 'Municipio cervecero tradicional con arquitectura colonial y lagos.', img: 'https://picsum.photos/seed/nandaime/400/250', lat: 11.7500, lng: -86.1200 },
        { name: 'Laguna de Apoyo', desc: 'Crater volcanico con aguas termales, perfecto para nadar y relajarse.', img: 'https://picsum.photos/seed/lagunadeapoyo/400/250', lat: 11.9200, lng: -86.0900 }
      ],
      'Leon': [
        { name: 'Catedral Basica', desc: 'La catedral mas grande de Centro America, Patrimonio Mundial de la UNESCO.', img: 'https://picsum.photos/seed/catedralleon/400/250', lat: 12.4358, lng: -86.8780 },
        { name: 'Ruinas de Leon Viejo', desc: 'Ciudad colonial original destruida por el volcan, ruinas arqueologicas.', img: 'https://picsum.photos/seed/leonviejo/400/250', lat: 12.3967, lng: -86.8544 },
        { name: 'Cerro Negro', desc: 'Volcan activo mas joven de America Central, ideal para sandboard.', img: 'https://picsum.photos/seed/cerronegro/400/250', lat: 12.5033, lng: -86.7017 },
        { name: 'Museo de Arte Ortiz-Gurdiyan', desc: 'Arte contemporaneo nicaraguense y latinoamericano en una casona colonial.', img: 'https://picsum.photos/seed/museoleon/400/250', lat: 12.4340, lng: -86.8750 },
        { name: 'Iglesia Sutiava', desc: 'Iglesia barroca del siglo XVIII con murales historicos unicos.', img: 'https://picsum.photos/seed/sutiava/400/250', lat: 12.4450, lng: -86.8900 },
        { name: 'Barrio Subtiava', desc: 'Uno de los barrios mas antiguos con iglesias y tradiciones indigenas.', img: 'https://picsum.photos/seed/subtiava/400/250', lat: 12.4250, lng: -86.8900 },
        { name: 'Centro de Artes', desc: 'Espacio cultural con talleres de arte, galerias y eventos.', img: 'https://picsum.photos/seed/centroartes/400/250', lat: 12.4370, lng: -86.8800 },
        { name: 'Mercado Central', desc: 'Mercado tradicional con comida local, artesanias y ambiente leones.', img: 'https://picsum.photos/seed/mercadoleon/400/250', lat: 12.4320, lng: -86.8760 },
        { name: 'Las Penitas', desc: 'Playa pacifica con puesta de sol espectacular y restaurantes de mariscos.', img: 'https://picsum.photos/seed/penitas/400/250', lat: 12.3500, lng: -87.0200 },
        { name: 'Poneloya', desc: 'Playa volcanica con olas ideales para surf y ambiente relajado.', img: 'https://picsum.photos/seed/poneloya/400/250', lat: 12.3400, lng: -87.0300 },
        { name: 'Museo de la Revolucion', desc: 'Exposicion sobre la historia revolucionaria de Nicaragua.', img: 'https://picsum.photos/seed/museorevolucion/400/250', lat: 12.4360, lng: -86.8770 }
      ],
      'Managua': [
        { name: 'Parque Metropolitano', desc: 'El pulmon verde de Managua con lago, senderos y areas recreativas.', img: 'https://picsum.photos/seed/parquemanagua/400/250', lat: 12.1400, lng: -86.2600 },
        { name: 'Puerto Salvador Allende', desc: 'Malecon turistico sobre el lago Managua con restaurantes y paseos en barco.', img: 'https://picsum.photos/seed/puertoallende/400/250', lat: 12.1600, lng: -86.2900 },
        { name: 'Catedral de Santiago', desc: 'Iglesia moderna en la Plaza de la Republica, icono arquitectonico.', img: 'https://picsum.photos/seed/catedralmanagua/400/250', lat: 12.1550, lng: -86.2800 },
        { name: 'Reserva Natural Tiscapa', desc: 'Bosque protegido con canopy, tirolesa y vista panoramica de la ciudad.', img: 'https://picsum.photos/seed/tiscapa/400/250', lat: 12.1300, lng: -86.2300 },
        { name: 'Lago de Managua', desc: 'El decimo lago mas grande de America, hogar del tiburon verde.', img: 'https://picsum.photos/seed/lagomanagua/400/250', lat: 12.1700, lng: -86.3000 },
        { name: 'Parque Historico Nacional', desc: 'Sitio arqueologico con ruinas de la catedral original y monumentos.', img: 'https://picsum.photos/seed/historiconal/400/250', lat: 12.1500, lng: -86.2700 },
        { name: 'Plaza de la Revolucion', desc: 'Plaza principal con murales historicos y sede del gobierno.', img: 'https://picsum.photos/seed/plazarevolucion/400/250', lat: 12.1520, lng: -86.2680 },
        { name: 'Rotonda El Gueguense', desc: 'Interseccion iconica con escultura de la obra literaria mas famosa de Nicaragua.', img: 'https://picsum.photos/seed/rotonda/400/250', lat: 12.1600, lng: -86.2400 },
        { name: 'Mirador Tiscapa', desc: 'Mirador con silueta historica y vista 360 grados de Managua.', img: 'https://picsum.photos/seed/miradortiscapa/400/250', lat: 12.1280, lng: -86.2250 },
        { name: 'Volcan Concepcion View', desc: 'Vista al imponente volcan Concepcion desde las orillas del lago.', img: 'https://picsum.photos/seed/concepcionview/400/250', lat: 12.1800, lng: -86.3100 },
        { name: 'Mercado Oriental', desc: 'El mercado mas grande de Centro America, laberinto de productos y cultura.', img: 'https://picsum.photos/seed/mercadooriental/400/250', lat: 12.1200, lng: -86.2600 }
      ],
      'Masaya': [
        { name: 'Volcan Masaya', desc: 'Volcan activo con crater de lava, uno de los pocos donde puedes ver magma.', img: 'https://picsum.photos/seed/volcanmasaya/400/250', lat: 11.9840, lng: -86.1610 },
        { name: 'Mercado de Masaya', desc: 'El mercado indigena mas grande de Nicaragua, artesanias y cultura.', img: 'https://picsum.photos/seed/mercadomasaya/400/250', lat: 11.9731, lng: -86.0950 },
        { name: 'Catarina', desc: 'Pueblo de los Pueblos Blancos con mirador al Lago de Apoyo.', img: 'https://picsum.photos/seed/catarina/400/250', lat: 11.9100, lng: -86.1200 },
        { name: 'Laguna de Apoyo', desc: 'Laguna volcanica de agua termal, perfecta para nadar y relajarse.', img: 'https://picsum.photos/seed/apoyo/400/250', lat: 11.9300, lng: -86.1400 },
        { name: 'Masaya Centro', desc: 'Ciudad de las flores con parques historicos y tradiciones culturales.', img: 'https://picsum.photos/seed/masayacentro/400/250', lat: 11.9731, lng: -86.0950 },
        { name: 'Barrio Monimbo', desc: 'Barrio historico de resistencia con murales revolucionarios.', img: 'https://picsum.photos/seed/monimbo/400/250', lat: 11.9700, lng: -86.0980 },
        { name: 'Pueblo Moyo', desc: 'Mirador con vista al volcan Masaya y al lago de Masaya.', img: 'https://picsum.photos/seed/moyo/400/250', lat: 11.9500, lng: -86.1100 },
        { name: 'Diriamba', desc: 'Ciudad del volcancito con iglesia y tradiciones de San Sebastian.', img: 'https://picsum.photos/seed/diriamba/400/250', lat: 11.8600, lng: -86.2100 },
        { name: 'Niquinohomo', desc: 'Cuna de Augusto C. Sandino, patriota nicaraguense.', img: 'https://picsum.photos/seed/niquinohomo/400/250', lat: 11.9100, lng: -86.1000 },
        { name: 'San Juan de Oriente', desc: 'Aldea de artesanos ceramistas con taller abierto al publico.', img: 'https://picsum.photos/seed/sanjuandeori/400/250', lat: 11.9200, lng: -86.1050 },
        { name: 'Ticuantepe', desc: 'Municipio frutal con mirador natural y clima templado.', img: 'https://picsum.photos/seed/ticuantepe/400/250', lat: 12.0100, lng: -86.2100 }
      ],
      'Matagalpa': [
        { name: 'Selva Negra', desc: 'Eco-resort en la monta\u00f1a con cafe organico, senderos y avistamiento.', img: 'https://picsum.photos/seed/selvanegra/400/250', lat: 13.0200, lng: -85.8700 },
        { name: 'Cafe Las Nubes', desc: 'Finca de cafe de especialidad a 1400 metros sobre el nivel del mar.', img: 'https://picsum.photos/seed/cafelasnubes/400/250', lat: 12.9800, lng: -85.9000 },
        { name: 'Mirador de la Cumplida', desc: 'Mirador natural con vista a valles de cafe y monta\u00f1as centrales.', img: 'https://picsum.photos/seed/cumplida/400/250', lat: 12.9500, lng: -85.8800 },
        { name: 'Pantanal de Matagalpa', desc: 'Area humeda con biodiversidad unica, tortugas y aves acuaticas.', img: 'https://picsum.photos/seed/pantanal/400/250', lat: 12.9100, lng: -85.9200 },
        { name: 'Matagalpa Centro', desc: 'Ciudad monta\u00f1osa con clima templado, mercados y vida nocturna.', img: 'https://picsum.photos/seed/matagalpacentro/400/250', lat: 12.9256, lng: -85.9178 },
        { name: 'Macizos Volcanicos', desc: 'Zona de volcanes y lagunas con senderos de aventura.', img: 'https://picsum.photos/seed/macizos/400/250', lat: 13.0000, lng: -85.8600 },
        { name: 'El Arenal', desc: 'Aguas termales naturales en medio del bosque nuboso.', img: 'https://picsum.photos/seed/arenal/400/250', lat: 12.9600, lng: -85.8900 },
        { name: 'San Ramon', desc: 'Municipio productor de cafe con cascadas y vistas impresionantes.', img: 'https://picsum.photos/seed/sanramon/400/250', lat: 12.9300, lng: -85.8500 },
        { name: 'Waslala', desc: 'Ciudad del cafe y cacao con comunidades indigenas.', img: 'https://picsum.photos/seed/waslala/400/250', lat: 13.0300, lng: -85.7900 },
        { name: 'Bonanza', desc: 'Municipio minero con rio de aguas claras y bosques protegidos.', img: 'https://picsum.photos/seed/bonanza/400/250', lat: 13.0400, lng: -85.7400 },
        { name: 'Santa Maria de Ostuma', desc: 'Municipio en las monta\u00f1as con lagos crater y clima frio.', img: 'https://picsum.photos/seed/ostuma/400/250', lat: 12.9000, lng: -85.8700 }
      ],
      'RACCS': [
        { name: 'Bluefields Centro', desc: 'Ciudad portuaria con arquitectura caribena y cultura creole unica.', img: 'https://picsum.photos/seed/bluefields/400/250', lat: 12.0132, lng: -83.7637 },
        { name: 'Corn Island', desc: 'Islas caribenas con playa de arena blanca y agua turquesa.', img: 'https://picsum.photos/seed/cornisland/400/250', lat: 12.1667, lng: -83.0500 },
        { name: 'Laguna de Perlas', desc: 'Laguna costera con pescadores y manglares, puerta a las islas del Caribe.', img: 'https://picsum.photos/seed/lagunaperlas/400/250', lat: 12.3000, lng: -83.5667 },
        { name: 'El Bluff', desc: 'Pueblo pesquero con playas virgenes y arrecifes de coral.', img: 'https://picsum.photos/seed/elbluff/400/250', lat: 11.9833, lng: -83.7333 },
        { name: 'Cukra Hill', desc: 'Cerro con mirador de 360 grados sobre Bluefields y el Caribe.', img: 'https://picsum.photos/seed/cukra/400/250', lat: 12.0300, lng: -83.7400 },
        { name: 'Pearl Lagoon', desc: 'Laguna protegida con manglares y avifauna caribena excepcional.', img: 'https://picsum.photos/seed/pearllagoon/400/250', lat: 12.3500, lng: -83.5200 },
        { name: 'Orinoco', desc: 'Comunidad costera con cultura misquito y pesca artesanal.', img: 'https://picsum.photos/seed/orinoco/400/250', lat: 12.1800, lng: -83.6400 },
        { name: 'La Cruz de Rio Grande', desc: 'Puerto fluvial historico con conexiones al rio Escondido.', img: 'https://picsum.photos/seed/lacruzriogrande/400/250', lat: 11.9500, lng: -83.8600 },
        { name: 'Rama', desc: 'Pueblo en la desembocadura del rio Rama, acceso al Caribe profundo.', img: 'https://picsum.photos/seed/rama/400/250', lat: 11.8400, lng: -84.1700 },
        { name: 'Muelle de los Bueyes', desc: 'Municipio ganadero con rio Coco y tradiciones mesitena.', img: 'https://picsum.photos/seed/muelle/400/250', lat: 12.1400, lng: -83.8800 },
        { name: 'Bocana de Paiwas', desc: 'Comunidad riberena con selva virgen y biodiversidad unica.', img: 'https://picsum.photos/seed/bocanapaiwas/400/250', lat: 12.1200, lng: -83.9300 }
      ]
    };

    var tourMarkers = [];
    var tourPolyline = null;
    var tourAnimTimer = null;
    var tourAnimIndex = 0;
    var tourActive = false;
    var tourCurrentDep = null;
    var tourOsrmCoords = null;
    var tourTravelMarker = null;
    var tourPopup = null;
    var tourStopPopup = null;
    var modeLocked = false;
    var popupTimer = null;

    function clearTourism() {
      if (tourAnimTimer) { clearInterval(tourAnimTimer); tourAnimTimer = null; }
      tourMarkers.forEach(function(m) { map.removeLayer(m); });
      tourMarkers = [];
      if (tourPolyline) { map.removeLayer(tourPolyline); tourPolyline = null; }
      if (tourTravelMarker) { map.removeLayer(tourTravelMarker); tourTravelMarker = null; }
      if (tourStopPopup) { map.removeLayer(tourStopPopup); tourStopPopup = null; }
      tourActive = false;
      tourOsrmCoords = null;
      tourCurrentDep = null;
      focusedDep = null;
      modeLocked = false;
      document.getElementById('tour-panel').classList.remove('show');
      var ts = document.getElementById('tour-start');
      var tstop = document.getElementById('tour-stop-btn');
      if (ts) ts.style.display = '';
      if (tstop) { tstop.style.display = 'none'; tstop.classList.remove('show'); }
    }

    function updateTourPanel(stops, idx) {
      if (!stops || !stops[idx]) return;
      var s = stops[idx];
      document.getElementById('tour-img').src = s.img;
      document.getElementById('tour-img').alt = s.name;
      document.getElementById('tour-num').textContent = 'Parada ' + (idx + 1) + ' de ' + stops.length;
      document.getElementById('tour-stop-name').textContent = s.name;
      document.getElementById('tour-stop-desc').textContent = s.desc;
      var dots = '';
      for (var d = 0; d < stops.length; d++) {
        dots += '<div class="nc-tour-dot' + (d === idx ? ' active' : '') + '"></div>';
      }
      document.getElementById('tour-dots').innerHTML = dots;
      document.getElementById('tour-prev').disabled = (idx === 0);
      document.getElementById('tour-next').disabled = (idx === stops.length - 1);
    }

    function showTourStopPopup(stop, idx, total, color) {
      if (tourStopPopup) { map.removeLayer(tourStopPopup); tourStopPopup = null; }
      var html = '<div class="nc-tp-inner">' +
        '<img class="nc-tp-img" src="' + stop.img + '" alt="' + stop.name + '" />' +
        '<div class="nc-tp-body">' +
          '<div class="nc-tp-num">Parada ' + (idx + 1) + ' de ' + total + '</div>' +
          '<div class="nc-tp-name">' + stop.name + '</div>' +
          '<div class="nc-tp-desc">' + stop.desc + '</div>' +
        '</div>' +
      '</div>';
      tourStopPopup = L.popup({ closeButton: false, className: 'nc-tour-popup', offset: [0, -18], maxWidth: 220 })
        .setLatLng([stop.lat, stop.lng])
        .setContent(html)
        .openOn(map);
    }

    function showTourismRoute(depName) {
      clearTourism();
      map.closePopup();
      var stops = tourismData[depName];
      if (!stops || !stops.length) return;
      var dep = departamentos.find(function(d) { return d.name === depName; });
      var color = dep ? dep.color : '#e94560';
      tourCurrentDep = depName;
      modeLocked = true;
      focusedDep = null;

      document.getElementById('tour-title').textContent = depName + ' - Ruta Turistica';

      var allPoints = [];
      if (userLat && userLng) { allPoints.push([userLat, userLng]); }
      stops.forEach(function(s) { allPoints.push([s.lat, s.lng]); });

      stops.forEach(function(s, i) {
        var imgIcon = L.divIcon({
          className: '',
          html: '<div class="nc-tour-marker"><img src="' + s.img + '" alt="' + s.name + '" /></div>',
          iconSize: [36, 36], iconAnchor: [18, 18]
        });
        var m = L.marker([s.lat, s.lng], { icon: imgIcon }).addTo(map);
        (function(idx) {
          m.on('click', function() {
            updateTourPanel(stops, idx);
            showTourStopPopup(stops[idx], idx, stops.length, color);
          });
        })(i);
        tourMarkers.push(m);
      });

      if (allPoints.length >= 2) {
        var coordsStr = allPoints.map(function(p) { return p[1] + ',' + p[0]; }).join(';');
        var url = 'https://router.project-osrm.org/route/v1/driving/' + coordsStr + '?overview=full&geometries=geojson';
        fetch(url).then(function(r) { return r.json(); }).then(function(data) {
          if (data.routes && data.routes.length) {
            var routeCoords = data.routes[0].geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
            tourOsrmCoords = routeCoords;
            tourPolyline = L.polyline(routeCoords, {
              color: color, weight: 3.5, opacity: 0.85,
              lineCap: 'round', lineJoin: 'round'
            }).addTo(map);
          } else {
            tourPolyline = L.polyline(allPoints, {
              color: color, weight: 3, opacity: 0.8, dashArray: '8, 6'
            }).addTo(map);
          }
          map.fitBounds(tourPolyline.getBounds(), { padding: [60, 60] });
        }).catch(function() {
          tourPolyline = L.polyline(allPoints, {
            color: color, weight: 3, opacity: 0.8, dashArray: '8, 6'
          }).addTo(map);
          map.fitBounds(tourPolyline.getBounds(), { padding: [60, 60] });
        });
      } else {
        tourPolyline = L.polyline(allPoints, {
          color: color, weight: 3, opacity: 0.8, dashArray: '8, 6'
        }).addTo(map);
        map.fitBounds(tourPolyline.getBounds(), { padding: [60, 60] });
      }

      updateTourPanel(stops, 0);
      document.getElementById('tour-panel').classList.add('show');
      document.getElementById('tour-close').onclick = function() {
        clearTourism();
        map.closePopup();
        unfocusAll();
      };
      document.getElementById('tour-back').onclick = function() {
        clearTourism();
        map.closePopup();
        unfocusAll();
        map.setView([${center}], 8);
      };
      document.getElementById('tour-start').onclick = function() { startTourismNav(depName); };
      document.getElementById('tour-prev').onclick = function() {
        var cur = parseInt(document.getElementById('tour-num').textContent.match(/\\d+/)[0]) - 1;
        if (cur > 0) {
          updateTourPanel(stops, cur - 1);
          showTourStopPopup(stops[cur - 1], cur - 1, stops.length, color);
        }
      };
      document.getElementById('tour-next').onclick = function() {
        var cur = parseInt(document.getElementById('tour-num').textContent.match(/\\d+/)[0]) - 1;
        if (cur < stops.length - 1) {
          updateTourPanel(stops, cur + 1);
          showTourStopPopup(stops[cur + 1], cur + 1, stops.length, color);
        }
      };
    }

    window.flyToStop = function(i) {
      if (!tourCurrentDep) return;
      var stops = tourismData[tourCurrentDep];
      if (!stops || !stops[i]) return;
      var dep = departamentos.find(function(d) { return d.name === tourCurrentDep; });
      var color = dep ? dep.color : '#e94560';
      updateTourPanel(stops, i);
      showTourStopPopup(stops[i], i, stops.length, color);
    };

    function startTourismNav(depName) {
      var stops = tourismData[depName];
      if (!stops || stops.length < 2) return;
      tourActive = true;
      tourAnimIndex = 0;

      var dep = departamentos.find(function(d) { return d.name === depName; });
      var color = dep ? dep.color : '#e94560';

      var dotIcon = L.divIcon({
        className: '',
        html: '<div class="nc-anim-dot"></div>',
        iconSize: [20, 20], iconAnchor: [10, 10]
      });

      var startLat = userLat || stops[0].lat;
      var startLng = userLng || stops[0].lng;
      tourTravelMarker = L.marker([startLat, startLng], { icon: dotIcon, zIndexOffset: 1000 }).addTo(map);
      tourMarkers.push(tourTravelMarker);

      map.setView([startLat, startLng], 12);

      document.getElementById('tour-start').style.display = 'none';
      var tstop = document.getElementById('tour-stop-btn');
      tstop.style.display = 'block';
      tstop.classList.add('show');
      tstop.onclick = function() { stopTourismNav(); };

      showTourStopPopup(stops[0], 0, stops.length, color);
      updateTourPanel(stops, 0);

      var animCoords = tourOsrmCoords || [];
      if (animCoords.length === 0) {
        var allPts = [];
        if (userLat && userLng) allPts.push([userLat, userLng]);
        stops.forEach(function(s) { allPts.push([s.lat, s.lng]); });
        animCoords = allPts;
      }

      if (animCoords.length > 1) {
        var step = 0;
        tourAnimTimer = setInterval(function() {
          step++;
          if (step >= animCoords.length) {
            clearInterval(tourAnimTimer); tourAnimTimer = null;
            tourActive = false;
            document.getElementById('tour-start').style.display = '';
            tstop.style.display = 'none';
            tstop.classList.remove('show');
            return;
          }
          tourTravelMarker.setLatLng(animCoords[step]);
          map.panTo(animCoords[step], { animate: true, duration: 0.18 });
          for (var si = 0; si < stops.length; si++) {
            var dist = Math.abs(animCoords[step][0] - stops[si].lat) + Math.abs(animCoords[step][1] - stops[si].lng);
            if (dist < 0.02) {
              updateTourPanel(stops, si);
              showTourStopPopup(stops[si], si, stops.length, color);
              break;
            }
          }
        }, 150);
      }
    }

    function stopTourismNav() {
      if (tourAnimTimer) { clearInterval(tourAnimTimer); tourAnimTimer = null; }
      tourActive = false;
      document.getElementById('tour-start').style.display = '';
      var tstop = document.getElementById('tour-stop-btn');
      tstop.style.display = 'none';
      tstop.classList.remove('show');
    }

    map.on('popupclose', function() {
      clearTimeout(popupTimer);
      clearRoute();
      currentDep = null;
    });

    map.on('zoomend', function() {
      if (colorsHidden || focusedDep) return;
      var z = map.getZoom();
      departamentos.forEach(function(dep) {
        var polys = allPolys[dep.name];
        if (!polys) return;
        var baseFill = dep.highlighted ? 0.40 : 0.18;
        if (z >= 10) {
          var fade = Math.max(0.04, baseFill * 0.15);
          polys.forEach(function(p) { p.setStyle({ fillOpacity: fade, opacity: Math.max(0.1, dep.highlighted ? 0.3 : 0.15) }); });
        } else if (z >= 9) {
          var mid = baseFill * 0.5;
          polys.forEach(function(p) { p.setStyle({ fillOpacity: mid, opacity: dep.highlighted ? 0.6 : 0.35 }); });
        } else {
          polys.forEach(function(p) { p.setStyle({ fillOpacity: baseFill, opacity: dep.highlighted ? 0.9 : 0.6 }); });
        }
      });
    });

    var filesToFetch = [];
    departamentos.forEach(function(d) {
      if (filesToFetch.indexOf(d.file) === -1) filesToFetch.push(d.file);
    });

    var allCoords = {};
    Promise.all(filesToFetch.map(function(f) {
      return fetch('https://raw.githubusercontent.com/pacisauctor/geojson-nicaragua/master/' + f + '.geo.json')
        .then(function(r) { return r.json(); })
        .then(function(geo) { allCoords[f] = geo; })
        .catch(function() { allCoords[f] = null; });
    })).then(function() {
      var maskRings = [];
      filesToFetch.forEach(function(f) {
        var geo = allCoords[f];
        if (!geo) return;
        geo.features.forEach(function(feat) {
          var g = feat.geometry;
          if (g.type === 'Polygon') {
            maskRings.push(g.coordinates[0].map(function(c) { return [c[1], c[0]]; }));
          } else if (g.type === 'MultiPolygon') {
            g.coordinates.forEach(function(poly) {
              maskRings.push(poly[0].map(function(c) { return [c[1], c[0]]; }));
            });
          }
        });
      });

      var world = [[-200, -500], [-200, 500], [200, 500], [200, -500]];
      L.polygon([world].concat(maskRings), {
        fillColor: '#000000', fillOpacity: 0.92,
        color: '#000000', weight: 0, opacity: 0
      }).addTo(map);

      departamentos.forEach(function(dep) {
        var geo = allCoords[dep.file];
        if (!geo) return;
        geo.features.forEach(function(feat) {
          var g = feat.geometry;
          var addPoly = function(rings) {
            var ll = rings[0].map(function(c) { return [c[1], c[0]]; });
            var baseFill = dep.highlighted ? 0.40 : 0.18;
            var hoverFill = dep.highlighted ? 0.65 : 0.35;
            var poly = L.polygon(ll, {
              color: dep.color, fillColor: dep.color,
              fillOpacity: baseFill,
              weight: dep.highlighted ? 2.5 : 1.5,
              opacity: dep.highlighted ? 0.9 : 0.6
            }).addTo(map);

            if (!allPolys[dep.name]) allPolys[dep.name] = [];
            allPolys[dep.name].push(poly);

            poly.on('mouseover', function() {
              if (modeLocked) return;
              if (focusedDep && focusedDep !== dep.name) return;
              poly.setStyle({ fillOpacity: hoverFill, weight: 3 });
              poly.bringToFront();
            });
            poly.on('mouseout', function() {
              if (modeLocked) return;
              if (focusedDep && focusedDep !== dep.name) return;
              poly.setStyle({ fillOpacity: baseFill, weight: dep.highlighted ? 2.5 : 1.5 });
            });

            var c = getCentroid(ll);
            var marker = L.marker(c, {
              icon: L.divIcon({
                className: '',
                html: '<div class="pin-marker' + (dep.highlighted ? '' : ' no-click') + '"><div class="pin-name" style="color:' + (dep.highlighted ? dep.color : '#b0bec5') + ';">' + dep.name + '</div>' + makePinSvg(dep.highlighted ? dep.color : '#546e7a') + '</div>',
                iconSize: [28, 40], iconAnchor: [14, 40]
              })
            }).addTo(map);

            allPins[dep.name] = marker;

            if (dep.highlighted) {
              poly.on('click', function(e) { if (modeLocked) return; openPopup(dep, e.latlng); });
              marker.on('click', function() { if (modeLocked) return; openPopup(dep, c); });
            }
          };
          if (g.type === 'Polygon') { addPoly(g.coordinates); }
          else if (g.type === 'MultiPolygon') { g.coordinates.forEach(addPoly); }
        });
      });
    });
  </script>
</body>
</html>`;

function WebMap() {
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ref.current) return;
    const iframe = document.createElement('iframe');
    iframe.srcdoc = leafletHtml(MAP_CENTER);
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.title = 'Nicaragua Map';
    ref.current.appendChild(iframe);

    const handler = (e: MessageEvent) => {
      if (e.data === 'logout') {
        signOut().then(() => router.replace('/(auth)/login'));
      }
    };
    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
      ref.current?.removeChild(iframe);
    };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100%', margin: 0, padding: 0 }} />;
}

function NativeMap() {
  const { WebView } = require('react-native-webview');
  const { t } = useLang();
  const webViewRef = useRef<any>(null);
  const { signOut } = useAuth();
  const router = useRouter();
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);
  const loadedRef = useRef(false);
  const [Location] = useState<any>(() => {
    try {
      return require('expo-location');
    } catch {
      return null;
    }
  });

  const sendLocation = () => {
    const loc = locationRef.current;
    if (loc && loadedRef.current) {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'location', lat: loc.lat, lng: loc.lng }));
    }
  };

  useEffect(() => {
    if (!Location) return;
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted || status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        locationRef.current = { lat: location.coords.latitude, lng: location.coords.longitude };
        sendLocation();
      } catch (error) {
        console.warn('No se pudo obtener la ubicacion:', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [Location]);

  if (!Location) {
    return (
      <View style={styles.locationFallback}>
        <Text style={styles.locationFallbackTitle}>{t.locationUnavailableTitle}</Text>
        <Text style={styles.locationFallbackMessage}>{t.locationUnavailableMessage}</Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      style={{ flex: 1 }}
      originWhitelist={['*']}
      source={{ html: leafletHtml(MAP_CENTER) }}
      javaScriptEnabled
      scrollEnabled={false}
      onLoadEnd={() => {
        loadedRef.current = true;
        sendLocation();
      }}
      onMessage={(e: any) => {
        if (e.nativeEvent.data === 'logout') {
          signOut().then(() => router.replace('/(auth)/login'));
        }
      }}
    />
  );
}

export default function NicaraguaMap() {
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? <WebMap /> : <NativeMap />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  locationFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B1F3A',
  },
  locationFallbackTitle: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  locationFallbackMessage: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
