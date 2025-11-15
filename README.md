# :soccer: Futtech :soccer:
Football is the most popular sport on Earth, uniting people across education, class, and race. It has the power to strengthen communities and inspire dreams. _**Africa must harness this power**_ to uplift itself.<br />
**Through [Futtech](https://www.futtech.kalkyokya.tech)**, I am building a future where African footballers no longer have to leave home to maximize their potential—because the tools they need will be right here.<br />

---

> _"Mastery of complex skills is not easy. Especially with inefficient methods."_

---

Football is one such skill, and technology is a powerful tool that can facilitate its mastery.


### :page_with_curl: Project Description
Futtech is an end-to-end Engineering project focused on build of ```camera-equipped drones```, development of a ```responsively designed web platform``` and integration of an ```assistive Large Language Model```.<br />

#### :telescope: Overview
Futtech pairs a Django 5.2 backend with a React frontend (a user-facing app built with Vite) to deliver drone-recorded training content, manage subscriptions, and stream video via Mux.

##### :wrench: Repository layout
* **futtech_backend/** – Django project housing settings, URLs, and three apps (user_auth, video_management, and playlists) that supply authentication, video ingestion/streaming, and playlist curation services.

* **frontend/** – Vite React client that gates routes behind JWT-authenticated context providers, fetches media catalogs, and integrates with the backend via an Axios client that knows how to refresh tokens.

* **requirements.txt & package manifests** – lock in Python libraries (DRF, dj-stripe, mux-python) and JavaScript dependencies (React, MUI, Axios, Firebase).

#### :key: Backend essentials
* **Core configuration** – settings.py enables REST Framework + SimpleJWT, Redis-backed sessions, Stripe/dj-stripe, and the domain-specific apps; it expects environment variables for database, Stripe, and Mux credentials.

* **Video domain** – video_management models define teams, user profiles (with Stripe subscription linkage), video metadata (Mux IDs, premium flags), and playback history records.

* **Mux/Stripe integration** – services.py signs playback tokens, provisions direct-upload URLs, and verifies webhook signatures before updating local video state; views layer exposes endpoints for signed playback tokens, upload lifecycle management, Stripe checkout/customer portals, and webhook ingestion.

* **Authentication** – user_auth offers registration/login/refresh/logout/current-user endpoints that set refresh tokens as HttpOnly cookies while serializing user records and enforcing password policies.

* **Playlists** – playlists app models named collections of videos and surfaces them through a DRF ModelViewSet with custom pagination and nested serialization, ready for filtering and sharing between authenticated users.

#### :key: User-facing frontend
* **State scaffolding** – the entry point wraps the app in Auth/User/Video/List context providers so that authentication state, catalogs, and selections stay synchronized in local storage.

* **Routing** – App.jsx protects most routes behind the presence of user.accessToken, steering anonymous visitors to the registration/login experience while exposing pages for videos, AI analysis, pricing, profiles, uploads, and lists once authenticated.

* **API access** – services/apiClient.js injects Bearer tokens on each request and tries to refresh them automatically; AuthService wraps registration/login/logout flows, kick-starts playlist fetches, and exposes helpers for session-aware components.

* **Content loading** – screens such as Home.jsx pull curated lists or fall back to locally cached videos, using the base API URL from environment configuration to reach backend endpoints.

#### Environment & tooling tips
* Install Python dependencies from requirements.txt, ensuring Redis, PostgreSQL, Stripe, and Mux environment variables are in place before running migrations or starting manage.py runserver.

* Configure the frontend with VITE_API_BASE_URL and matching Stripe/Mux keys so Axios calls and embedded checkout flows hit the right backend endpoints.

### How Futtech Works
A seamless experience from recording training sessions to getting scouted:
- **Training Sessions Recording**: users book drone-recording sessions on Futtech's website or simply avail phone-recorded ones; video content is uploaded to Futtech.
- **Video Streaming**: uploaded content is safely stored and made available for on-demand streaming. 
- **AI-Driven Analytics**: if requested, Futtech’s system processes the video data and identifies key metrics.
- **Performance Reports**: users receives detailed insights on their game.
- **Growth & Visibility**: the data helps users better define their identity, refine their skills and potentially attract scouts.

---

A platform that empowers users through data, analytics, and visibility:
- **Data-driven training & feedback loops** → helping users improve strategically.
- **Affordable and scalable** performance tracking tools.
- **AI-powered analytics** that help users analyze their technical and tactical skills, as well as decision-making.
- **A bridge between users and scouts** → a talent database accessible to clubs worldwide.

## 📈 **Extra Information**
| Metric | Description |
| ------ | --------- |
| Repo Created | Saturday, 15th March 2025 |
| Last Update | Wednesday, 15th November 2025 |
| GitHub Repository | [kal-kyokya/Futtech/](https://github.com/kal-kyokya/Futtech-Django) |
| Official Link | [Futtech](https://www.futtech.kalkyokya.tech/) |
| Medium Blog Post | [Blog](https://medium.com/@kal-kyokya/the-futtech-startup-a-journey-of-engineering-prototyping-debugging-entrepreneurship-e3bfb91d2de5) |
| GitHub Commits | 539 |
