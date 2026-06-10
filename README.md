# LifeLine PH — Emergency Response Companion for the Philippines

A web app that helps anyone respond to a medical emergency in the Philippines: call for help, follow CPR guidance, find the nearest medical facility, and carry a digital Medical ID — even when you're panicking and every second counts.

## Why I built it

I live in Antipolo, Philippines, where emergency infrastructure is uneven — response times vary widely and many people don't know basic first aid. After earning my **Occupational First Aid & BLS CPR (with AED) certification from the Philippine Red Cross** (June 2025), I realized the bigger gap wasn't knowledge — it was access at the moment of crisis. LifeLine PH is my attempt to close that gap with software.

## Features

| Feature | What it does |
|---|---|
| **SOS** (`SOSView`) | One-tap emergency request with location sharing |
| **CPR Guide** (`CPRModal`) | Step-by-step CPR walkthrough designed for real-time use |
| **First Aid** (`FirstAidView`) | Quick-reference guides for common emergencies |
| **Facility Finder** (`FacilitiesView`) | Nearby hospitals and clinics on Google Maps |
| **Medical ID** (`ProfileView`) | Blood type, allergies, conditions — readable by first responders |
| **Offline mode** (`OfflineView`) | Core guidance still works without a connection |
| **Multilingual** | Localized UI so language is never the barrier in an emergency |

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · Firebase (Firestore) · Google Maps (`@vis.gl/react-google-maps`) · Gemini / OpenAI APIs for assistant features

## Development notes

This project was built for my Grade 12 Informatics class as an AI-assisted programming project — prototyped quickly with AI tooling, then refined by hand: feature design, emergency-scenario analysis, and the offline/location logic are my own. The hardest design constraint was assuming the user is **panicking**: every critical action had to be reachable in one or two taps, with voice guidance as a fallback.

## Context

This is the project referred to as "LifeLinePH" in my school records (Grade 12 Informatics).
